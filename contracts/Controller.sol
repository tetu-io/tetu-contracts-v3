// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/manager/AccessManager.sol";
import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagerUpgradeable.sol";

/// @title Tetu V3 controller
/// @author Alien Deployer (https://github.com/a17)
contract Controller is AccessManagerUpgradeable {
    /// @dev Version of Controller contract implementation
    string public constant VERSION = "1.0.0";

    function initialize(address initialAdmin) public initializer {
        __AccessManager_init(initialAdmin);
    }
}
