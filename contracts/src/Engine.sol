//SPDX-Licence-Identifier: MIT
pragma solidity 0.8.28;

import {Owned} from "solmate/auth/Owned.sol";
import {ReentrancyGuard} from "solmate/utils/ReentrancyGuard.sol";

contract Engine is Owned, ReentrancyGuard {
    // Events
    event MatchCreated(uint256 indexed matchId, address indexed creator, uint256 indexed betAmount);
    event MatchJoined(uint256 matchId, address indexed joiner);
    event MatchReady(uint256 indexed matchId, uint256 indexed timestamp);

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
        uint256 currentRound;
        bool player1Ready;
        bool player2Ready;
        Status status;
    }

    struct Round {
        uint256 startTime;
        bytes32 trapperCommit;
        bytes32 playerCommit;
        uint256 trapChoice;
        uint256 playerChoice;
        bool trapperRevealed;
        bool playerRevealed;
        bool resolved;
    }

    // Constants
    uint256 public constant MAX_ROUNDS = 7;
    uint256 public constant READY_TIMEOUT = 60 seconds;
    uint256 public constant ROUND_TIMEOUT = 30 seconds;
    bytes32 public constant DOMAIN_SEPARATOR = keccak256("TrapGame");

    // State Variables
    uint256 totalMatches;
    mapping(uint256 => Match) public matches;
    mapping(uint256 => mapping(uint256 => Round)) public rounds;

    // Functions
    constructor(address owner) Owned(owner) {}

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

        require(m.player1 == msg.sender, "Only another player can join!");
        require(m.player2 == address(0), "Match is full");
        require(m.betAmount == msg.value, "Wrong bet amount");

        (bool success,) = address(this).call{value: m.betAmount}("");
        require(success, "Failed to send tokens");

        matches[matchId].player2 = msg.sender;
    }
}
