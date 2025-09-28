// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {EngineSolo} from "../src/EngineSolo.sol";

contract EngineScript is Script {
    function run() external {
        address relayer = 0x02ddE83c1Bc2046F80687529a14de912A724fb4c;

        vm.startBroadcast();
        EngineSolo engine = new EngineSolo();
        vm.stopBroadcast();
    }
}
