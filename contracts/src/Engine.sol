//SPDX-Licence-Identifier: MIT
pragma solidity 0.8.28;

import {Owned} from "solmate/auth/Owned.sol";
import {ReentrancyGuard} from "solmate/utils/ReentrancyGuard.sol";

contract Engine is Owned, ReentrancyGuard {
    event MatchCreated(uint256 matchId);

    struct Match {
        address player1;
        address player2;
        address winner;
        uint256 betAmount;
        uint256 createdAt;
    }

    uint256 totalMatches;
    Match[] matches;

    function createMatch(uint256 betAmount) public payable returns (uint256) {
        (bool success,) = address(this).call{value: betAmount}("");
        require(success, "Failed to send tokens");

        matches.push(
            Match({
                player1: msg.sender,
                player2: address(0),
                winner: address(0),
                betAmount: betAmount,
                createdAt: block.timestamp
            })
        );

        ++totalMatches;
        return totalMatches;
    }
}
