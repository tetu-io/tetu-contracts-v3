// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract MockERC20 is ERC20Upgradeable {
    uint8 internal _decimals;

    // add this to be excluded from coverage report
    function test() public {}

    function init(string memory name_, string memory symbol_, uint8 decimals_) external initializer {
        __ERC20_init(name_, symbol_);
        _decimals = decimals_;
    }

    function mint(uint amount) external {
        _mint(msg.sender, amount);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
