// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/manager/AccessManager.sol";
import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagerUpgradeable.sol";

/// @dev Upgraded controller mock
contract ControllerUpgrade is AccessManagerUpgradeable {
    /// @dev Version of Controller contract implementation
    string public constant VERSION = "99.0.1";

    receive() external payable virtual {}
}
