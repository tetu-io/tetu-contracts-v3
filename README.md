# Tetu V3

Index funds of yield-bearing vaults.

*Under development*

## Deployments

### Polygon

* Controller [0x7658d472996d90C0e0Ab8488af148184512DEE2c](https://polygonscan.com/address/0x7658d472996d90C0e0Ab8488af148184512DEE2c)
* FeeTreasury [0x4f6f91929A3C56982A324102a69733383195E181](https://polygonscan.com/address/0x4f6f91929A3C56982A324102a69733383195E181)

## How to

```shell
yarn
npx hardhat help
npx hardhat test
npx hardhat coverage
npx hardhat vars setup
npx hardhat ignition deploy ./ignition/modules/FeeTreasury.ts --parameters ./ignition/parameters.json --network polygon
npx hardhat ignition verify chain-137 --include-unrelated-contracts
```
    