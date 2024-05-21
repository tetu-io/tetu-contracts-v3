import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import {ZeroAddress} from "ethers";
import {ControllerUpgrade__factory} from "../typechain-types";

describe("Proxy", function () {
  async function deployPlatformFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const Controller = await hre.ethers.getContractFactory("Controller");
    const controllerImplementation = await Controller.deploy();
    const Proxy = await hre.ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy()
    await proxy.initProxy(await controllerImplementation.getAddress())
    const controller = await hre.ethers.getContractAt("Controller", await proxy.getAddress())
    await controller.initialize(owner.address)
    return { proxy, controller, controllerImplementation, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Check inited", async function () {
      const { proxy, controllerImplementation, } = await loadFixture(deployPlatformFixture);
      expect(await proxy.implementation()).to.equal(await controllerImplementation.getAddress());
      await expect(proxy.initProxy(await controllerImplementation.getAddress())).to.revertedWith('Already inited')
    });

    it("Try reinitialize proxied implementation", async function () {
      const { controller,} = await loadFixture(deployPlatformFixture);
      await expect(controller.initialize(ZeroAddress)).to.revertedWithCustomError(controller, 'InvalidInitialization')
    })
  });

  describe("Upgrade", function () {
    it("Do controller upgrade", async function () {
      const { proxy, controller, owner, otherAccount } = await loadFixture(deployPlatformFixture);

      const ControllerUpgrade = await hre.ethers.getContractFactory("ControllerUpgrade");
      const controllerUpgradeImplementation = await ControllerUpgrade.deploy();

      expect(await controller.VERSION()).to.eq("1.0.0")
      // upgrade by global admin
      await proxy.upgrade(await controllerUpgradeImplementation.getAddress())

      // upgrade by other account
      await expect(proxy.connect(otherAccount).upgrade(await controllerUpgradeImplementation.getAddress())).to.revertedWithCustomError(proxy, "ProxyUpgradeDenied()")
      await controller.labelRole(1n, "PROXY_UPGRADER")
      await controller.grantRole(1n, otherAccount.address, 0n)
      await controller.setTargetFunctionRole(await proxy.getAddress(), ["0x0900f010",], 1n)
      await proxy.connect(otherAccount).upgrade(await controllerUpgradeImplementation.getAddress())
      expect(await controller.VERSION()).to.eq("99.0.1")

      // ImplementationIsNotContract
      await expect(proxy.connect(otherAccount).upgrade("0x0000000000000090000000000000000000000000")).to.revertedWithCustomError(proxy, 'ImplementationIsNotContract')

      // check payable receive proxy logic
      await owner.sendTransaction({
        to: proxy.getAddress(),
        value: 10n,
      })
    });
  });
});
