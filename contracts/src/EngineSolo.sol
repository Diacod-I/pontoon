//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Owned} from "solmate/auth/Owned.sol";
import {ReentrancyGuard} from "solmate/utils/ReentrancyGuard.sol";

contract EngineSolo is Owned, ReentrancyGuard {
    event MatchCreated(uint256 indexed matchId, address indexed creator, uint256 indexed betAmount);
    event RoundPlayed(
        uint256 indexed matchId, uint256 indexed roundNumber, uint256 playerChoice, uint256 winningNumber, bool won
    );
    event PlayerLeft(uint256 indexed matchId, uint256 reward);

    enum Status {
        ACTIVE,
        FINISHED
    }

    struct Match {
        address player1;
        uint256 betAmount;
        uint256 createdAt;
        uint256 currentRound;
        Status status;
    }

    struct Round {
        uint256 startTime;
        uint256 playerChoice;
        uint256 bombNumber;
        bool resolved;
        bool survived;
    }

    // Constants
    uint256 public constant MAX_ROUNDS = 7;
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
    constructor() Owned(msg.sender) {}

    function createMatch(uint256 betAmount) public payable returns (uint256) {
        require(msg.value == betAmount, "Wrong bet amount");
        (bool success,) = address(this).call{value: betAmount}("");
        require(success, "Failed to send tokens");

        uint256 matchId = totalMatches;
        Match storage newMatch = matches[matchId];

        newMatch.player1 = msg.sender;
        newMatch.betAmount = msg.value;
        newMatch.createdAt = block.timestamp;
        newMatch.status = Status.ACTIVE;
        newMatch.currentRound = 1;

        emit MatchCreated(matchId, msg.sender, betAmount);

        ++totalMatches;
        return matchId;
    }

    function playRound(uint256 matchId, uint256 playerChoice) public matchExists(matchId) nonReentrant {
        Match storage m = matches[matchId];

        require(msg.sender == m.player1, "Not the player");
        require(m.currentRound <= MAX_ROUNDS, "Max rounds exceeded");
        require(m.status == Status.ACTIVE, "Match is not active");

        uint256 maxChoice = _getTilesForRound(m.currentRound);
        require(playerChoice >= 1 && playerChoice <= maxChoice, "Invalid choice for round");

        uint64 bombNumber = randomnessInRange(1, uint64(maxChoice));

        Round storage round = rounds[matchId][m.currentRound];

        round.startTime = block.timestamp;
        round.playerChoice = playerChoice;
        round.bombNumber = uint256(bombNumber);
        round.resolved = true;
        round.survived = (playerChoice != uint256(bombNumber));

        emit RoundPlayed(matchId, m.currentRound, playerChoice, uint256(bombNumber), round.survived);

        if (!round.survived) {
            m.status = Status.FINISHED;
            emit PlayerLeft(matchId, 0);
        } else {
            m.currentRound++;

            if (m.currentRound > MAX_ROUNDS) {
                m.status = Status.FINISHED;
                uint256 reward = _calculateChallengerReward(m.betAmount, MAX_ROUNDS);
                _sendReward(m.player1, reward);
                emit PlayerLeft(matchId, reward);
            }
        }
    }

    function leaveMatch(uint256 matchId) public nonReentrant matchExists(matchId) {
        Match storage m = matches[matchId];

        require(matches[matchId].status == Status.ACTIVE, "Match is not active");
        require(msg.sender == matches[matchId].player1, "Not a player");

        matches[matchId].status = Status.FINISHED;
        uint256 reward = _calculateChallengerReward(m.betAmount, m.currentRound - 1);
        _sendReward(m.player1, reward);

        emit PlayerLeft(matchId, reward);
    }

    function randomnessInRange(uint64 min, uint64 max) public view returns (uint64) {
        (bool ok, bytes memory data) = CADENCE_ARCH.staticcall(abi.encodeWithSignature("revertibleRandom()"));
        require(ok, "Failed to fetch a random number through Cadence Arch");
        uint64 randomNumber = abi.decode(data, (uint64));

        return (randomNumber % (max + 1 - min)) + min;
    }

    // Internal functions
    function _sendReward(address to, uint256 amount) private {
        require(address(this).balance >= amount, "Insufficient contract balance");
        (bool success,) = to.call{value: amount}("");
        require(success, "Reward transfer failed");
    }

    function _getTilesForRound(uint256 roundNumber) private pure returns (uint256) {
        require(roundNumber >= 1 && roundNumber <= MAX_ROUNDS, "Invalid round");
        return 9 - roundNumber;
    }

    function _calculateChallengerReward(uint256 betAmount, uint256 roundsCompleted) private pure returns (uint256) {
        require(roundsCompleted >= 1 && roundsCompleted <= MAX_ROUNDS, "Invalid rounds completed");

        uint256 baseReward = betAmount;
        uint256 bonusPercentage;

        if (roundsCompleted == 1) {
            bonusPercentage = 1;
        } else if (roundsCompleted == 2) {
            bonusPercentage = 2;
        } else if (roundsCompleted == 3) {
            bonusPercentage = 4;
        } else if (roundsCompleted == 4) {
            bonusPercentage = 10;
        } else if (roundsCompleted == 5) {
            bonusPercentage = 25;
        } else if (roundsCompleted == 6) {
            bonusPercentage = 60;
        } else {
            bonusPercentage = 97;
        }

        uint256 bonus = (betAmount * bonusPercentage) / 100;
        return baseReward + bonus;
    }

    receive() external payable {}
}
