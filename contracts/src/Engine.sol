//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Owned} from "solmate/auth/Owned.sol";
import {ReentrancyGuard} from "solmate/utils/ReentrancyGuard.sol";

contract Engine is Owned, ReentrancyGuard {
    // Events
    event MatchCreated(uint256 indexed matchId, address indexed creator, uint256 indexed betAmount);
    event MatchJoined(uint256 matchId, address indexed joiner);
    event MatchReady(uint256 indexed matchId, uint256 indexed timestamp);
    event PlayersReady(uint256 indexed matchId, address challenger, address conman);
    event RoundStarted(uint256 indexed matchId, uint256 indexed roundNumber, uint256 tilesCount);

    // Types
    enum Status {
        WAITING,
        READY,
        ACTIVE,
        FINISHED
    }

    enum Role {
        CHALLENGER,
        CONMAN
    }

    struct Match {
        address player1;
        address player2;
        address challenger;
        address conman;
        address winner;
        uint256 betAmount;
        uint256 createdAt;
        uint256 readyDeadline;
        uint256 currentRound;
        bool player1Ready;
        bool player2Ready;
        Status status;
    }

    struct Round {
        uint256 startTime;
        bytes32 conmanCommit;
        bytes32 challengerCommit;
        uint256 conmanChoice;
        uint256 challengerChoice;
        bool conmanRevealed;
        bool challengerRevealed;
        bool resolved;
    }

    // Constants
    uint256 public constant MAX_ROUNDS = 7;
    uint256 public constant READY_TIMEOUT = 60 seconds;
    uint256 public constant ROUND_TIMEOUT = 30 seconds;
    bytes32 public constant DOMAIN_SEPARATOR = keccak256("TrapGame");
    address public constant CADENCE_ARCH = 0x0000000000000000000000010000000000000001;

    // State Variables
    uint256 totalMatches;
    mapping(uint256 => Match) public matches;
    mapping(uint256 => mapping(uint256 => Round)) public rounds;

    modifier matchExists(uint256 matchId) {
        require(matchId < totalMatches, "Match doesn't exist");
        require(matches[matchId].status != Status.FINISHED, "Match is finished");
        _;
    }

    // Functions
    constructor(address owner) Owned(owner) {}

    // Creates a new match with a specific 'betAmount'
    function createMatch(uint256 betAmount) public payable returns (uint256) {
        require(msg.value == betAmount, "Wrong bet amount");
        (bool success,) = address(this).call{value: betAmount}("");
        require(success, "Failed to send tokens");

        uint256 matchId = totalMatches;
        Match storage newMatch = matches[matchId];

        newMatch.player1 = msg.sender;
        newMatch.betAmount = msg.value;
        newMatch.createdAt = block.timestamp;
        newMatch.status = Status.WAITING;

        emit MatchCreated(matchId, msg.sender, betAmount);

        ++totalMatches;
        return matchId;
    }

    function joinMatch(uint256 matchId) public payable {
        Match storage m = matches[matchId];

        require(m.status == Status.WAITING, "Match is not waiting");
        require(m.player1 != msg.sender, "Cannot join your own match!");
        require(m.player2 == address(0), "Match is full");
        require(m.betAmount == msg.value, "Wrong bet amount");

        (bool success,) = address(this).call{value: m.betAmount}("");
        require(success, "Failed to send tokens");

        m.readyDeadline = block.timestamp + READY_TIMEOUT;
        matches[matchId].player2 = msg.sender;

        emit MatchJoined(matchId, msg.sender);
    }

    function ready(uint256 matchId) public {
        Match storage m = matches[matchId];

        require(m.status == Status.WAITING, "Match not in waiting state");
        require(msg.sender == m.player1 || msg.sender == m.player2, "Not a player");
        require(block.timestamp <= m.readyDeadline, "Ready period expired");

        if (msg.sender == m.player1) {
            m.player1Ready = true;
        } else {
            m.player2Ready = true;
        }

        if (m.player1Ready && m.player2Ready) {
            _assignRolesAndStart(matchId);
        }
    }

    // Internal Functions
    function _assignRolesAndStart(uint256 matchId) private {
        Match storage m = matches[matchId];

        uint256 randomNumber = _randomNumber();

        if (randomNumber % 2 == 0) {
            m.challenger = m.player1;
            m.conman = m.player2;
        } else {
            m.challenger = m.player2;
            m.conman = m.player1;
        }

        m.status = Status.ACTIVE;
        m.currentRound = 1;

        rounds[matchId][1].startTime = block.timestamp;

        emit PlayersReady(matchId, m.challenger, m.conman);
        emit RoundStarted(matchId, 1, _getTilesForRound(1));
    }

    function _getTilesForRound(uint256 roundNumber) private pure returns (uint256) {
        require(roundNumber >= 1 && roundNumber <= MAX_ROUNDS, "Invalid round");
        return 9 - roundNumber;
    }

    // Using native flow VRF, even if its predictable it does not affect the core logic, only assigning of roles.
    function _randomNumber() internal view returns (uint64) {
        (bool ok, bytes memory data) = CADENCE_ARCH.staticcall(abi.encodeWithSignature("revertibleRandom()"));
        require(ok, "Failed to fetch a random number through Cadence Arch");
        uint64 output = abi.decode(data, (uint64));
        return output;
    }
}
