import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ControllerModule = buildModule("Controller", (m) => {
  const initialAdmin = m.getParameter("initialAdmin", m.getAccount(0))
  const proxy = m.contract("Proxy");
  const controllerImplementation = m.contract("Controller");
  m.call(proxy, "initProxy", [controllerImplementation])
  const controller = m.contractAt("Controller", proxy, {id: "ProxyController"})
  m.call(controller, "initialize", [initialAdmin])
  return { proxy, controller, controllerImplementation };
});

export default ControllerModule;
