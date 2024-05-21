// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "hardhat/console.sol";

/// @title Performance fee treasury that distribute fees to claimers
/// @author Alien Deployer (https://github.com/a17)
contract FeeTreasury is AccessManagedUpgradeable {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    /// @dev Version of Treasury contract implementation
    string public constant VERSION = "1.0.0";

    uint internal THRESHOLD = 10;

    // keccak256(abi.encode(uint256(keccak256("tetu.storage.FeeTreasury")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant FeeTreasuryStorageLocation = 0x09d69abd7689fd56666fe6869d931c23d02c3338dae383978413185cacb0a400;

    struct AssetData {
        uint distributed;
        uint claimed;
    }

    /// @custom:storage-location erc7201:tetu.storage.FeeTreasury
    struct FeeTreasuryStorage {
        EnumerableMap.AddressToUintMap claimers;
        mapping (address asset => AssetData) assetData;
        mapping (address asset => mapping (address claimer => uint amount)) toClaim;
    }

    event Claimers(address[] claimers, uint[] shares);
    event Claim(address indexed claimer, address indexed asset, uint amount);

    error IncorrectArgument();
    error AccessDenied();
    error SetupFeeTreasuryFirst();

    function initialize(address controller) public initializer {
        __AccessManaged_init(controller);
    }

    function setClaimers(address[] memory claimers_, uint[] memory shares) external restricted {
        FeeTreasuryStorage storage $ = _getTreasuryStorage();
        _cleanClaimers($);
        uint len = claimers_.length;
        if (len == 0 || len != shares.length) {
            revert IncorrectArgument();
        }
        for (uint i; i < len; ++i) {
            $.claimers.set(claimers_[i], shares[i]);
        }
        emit Claimers(claimers_, shares);
    }

    function claim(address[] memory assets) external {
        FeeTreasuryStorage storage $ = _getTreasuryStorage();
        (bool exists,) = $.claimers.tryGet(msg.sender);
        if (!exists) {
            revert AccessDenied();
        }
        uint len = assets.length;
        for (uint i; i < len; ++i) {
            uint toClaim = $.toClaim[assets[i]][msg.sender];
            $.toClaim[assets[i]][msg.sender] = 0;
            IERC20(assets[i]).safeTransfer(msg.sender, toClaim);
            AssetData memory assetData = $.assetData[assets[i]];
            $.assetData[assets[i]].claimed = assetData.claimed + toClaim;
        }
    }

    function distribute(address[] memory assets) external {
        FeeTreasuryStorage storage $ = _getTreasuryStorage();
        uint len = assets.length;
        for (uint i; i < len; ++i) {
            AssetData memory assetData = $.assetData[assets[i]];
            uint bal = IERC20(assets[i]).balanceOf(address(this));
            uint distributedOnBalance = assetData.distributed - assetData.claimed;
            if (bal > distributedOnBalance) {
                uint amountToDistribute = bal - distributedOnBalance;
                if (amountToDistribute > THRESHOLD) {
                    _distributeAssetAmount($, assets[i], amountToDistribute);
                    $.assetData[assets[i]].distributed = assetData.distributed + amountToDistribute;
                }
            }
        }
    }

    function _distributeAssetAmount(FeeTreasuryStorage storage $, address asset, uint amount) internal {
        address[] memory claimerAddress = $.claimers.keys();
        uint len = claimerAddress.length;
        if (len == 0) {
            revert SetupFeeTreasuryFirst();
        }
        for (uint i; i < len; ++i) {
            uint share = $.claimers.get(claimerAddress[i]);
            uint amountForClaimer = amount * share / 1e18;
            uint oldAmountToClaim = $.toClaim[asset][claimerAddress[i]];
            $.toClaim[asset][claimerAddress[i]] = oldAmountToClaim + amountForClaimer;
        }
    }

    function _cleanClaimers(FeeTreasuryStorage storage $) internal {
        uint len = $.claimers.length();
        if (len > 0) {
            address[] memory claimerAddress = $.claimers.keys();
            for (uint i; i < len; ++i) {
                $.claimers.remove(claimerAddress[i]);
            }
        }
    }

    function _getTreasuryStorage() private pure returns (FeeTreasuryStorage storage $) {
        assembly {
            $.slot := FeeTreasuryStorageLocation
        }
    }
}
