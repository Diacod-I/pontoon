// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {EngineSolo} from "../src/EngineSolo.sol";

contract EngineSoloScript is Script {
    function run() external {
        vm.startBroadcast();
        EngineSolo engine = new EngineSolo();
        vm.stopBroadcast();
    }
}
