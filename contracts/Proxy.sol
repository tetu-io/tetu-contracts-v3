// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/manager/IAccessManager.sol";
import {UpgradeableProxy} from "./base/UpgradeableProxy.sol";

/// @title Proxy for Tetu V3 core contracts
/// @author Alien Deployer (https://github.com/a17)
contract Proxy is UpgradeableProxy {
    error ProxyUpgradeDenied();

    function initProxy(address logic_) external {
        _init(logic_);
    }

    //slither-disable-next-line naming-convention
    function upgrade(address newImplementation_) external {
        (bool callAllowed,) = IAccessManager(address(this)).canCall(msg.sender, address(this), this.upgrade.selector);
        if (!callAllowed) {
            revert ProxyUpgradeDenied();
        }
        _upgradeTo(newImplementation_);
    }

    function implementation() external view returns (address) {
        return _implementation();
    }
}
