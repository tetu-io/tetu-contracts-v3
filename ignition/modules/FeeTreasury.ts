import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ControllerModule from "./Controller";

const FeeTreasuryModule = buildModule("FeeTreasury", (m) => {
  const { controller } = m.useModule(ControllerModule)
  const proxy = m.contract("Proxy");
  const implementation = m.contract("FeeTreasury");
  m.call(proxy, "initProxy", [implementation])
  const feeTreasury = m.contractAt("FeeTreasury", proxy, {id: "ProxyFeeTreasury"})
  m.call(feeTreasury, "initialize", [controller])
  return { feeTreasury, controller, };
});

export default FeeTreasuryModule;
