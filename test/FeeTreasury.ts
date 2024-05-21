import { expect } from "chai";
import hre, {ignition} from "hardhat";
import FeeTreasuryModule from "../ignition/modules/FeeTreasury";
import {Controller__factory, FeeTreasury__factory} from "../typechain-types";
import {parseUnits} from "ethers";

describe("FeeTreasury", function () {
  it("Should work", async function () {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const { feeTreasury, controller } = await ignition.deploy(FeeTreasuryModule);
    const feeTreasuryContract = FeeTreasury__factory.connect(await feeTreasury.getAddress(), otherAccount)
    const controllerContract = Controller__factory.connect(await controller.getAddress(), owner)

    // try distribute
    const MockTokenFactory = await hre.ethers.getContractFactory("MockERC20");
    const token = await MockTokenFactory.deploy();
    await token.mint(parseUnits('2'))
    await token.transfer(await feeTreasuryContract.getAddress(), parseUnits('0.99'))
    await expect(feeTreasuryContract.distribute([await token.getAddress()])).to.revertedWithCustomError(feeTreasuryContract, "SetupFeeTreasuryFirst")

    // set claimers
    await expect(feeTreasuryContract.setClaimers([], [])).to.revertedWithCustomError(feeTreasuryContract, "AccessManagedUnauthorized")
    await controllerContract.labelRole(1n, "SETUP_CLAIMERS")
    await controllerContract.grantRole(1n, otherAccount.address, 0n)
    await controllerContract.setTargetFunctionRole(await feeTreasuryContract.getAddress(), ["0xf204bb31",], 1n)
    await expect(feeTreasuryContract.setClaimers([owner.address], [/*parseUnits('1')*/])).to.be.revertedWithCustomError(feeTreasuryContract, "IncorrectArgument")
    await feeTreasuryContract.setClaimers([owner.address], [parseUnits('1')])

    // distribute
    await feeTreasuryContract.distribute([await token.getAddress()])

    // claim
    await expect(feeTreasuryContract.claim([await token.getAddress()])).to.revertedWithCustomError(feeTreasuryContract, "AccessDenied")
    await feeTreasuryContract.connect(owner).claim([await token.getAddress()])

    // setCleaners
    await feeTreasuryContract.setClaimers([owner.address, otherAccount.address], [parseUnits('0.5'), parseUnits('0.5')])

    // distribute to trigger all branches
    // await token.transfer(await feeTreasuryContract.getAddress(), parseUnits('0.1'))
    await feeTreasuryContract.distribute([await token.getAddress()])
    // await feeTreasuryContract.connect(owner).claim([await token.getAddress()])
    // await feeTreasuryContract.connect(otherAccount).claim([await token.getAddress()])
    // await feeTreasuryContract.distribute([await token.getAddress()])
    // await token.transfer(await feeTreasuryContract.getAddress(), 5n)
    // await feeTreasuryContract.distribute([await token.getAddress()])
  });

  it("Try reinitialize proxied implementation", async function () {
    const { feeTreasury, controller } = await ignition.deploy(FeeTreasuryModule);
    await expect(feeTreasury.initialize(await controller.getAddress())).to.revertedWithCustomError(feeTreasury, 'InvalidInitialization')
  })
})
