import StartNode from "./StartNode";
import ActionNode from "./ActionNode";
import EndNode from "./EndNode";
import ConditionNode from "./ConditionNode";
import UserTaskNode from "./UserTaskNode";
import ApiGatewayNode from "./ApiGatewayNode";
import NginxProxyNode from "./NginxProxyNode";
import ExternalSystemNode from "./ExternalSystemNode";
import GatewayNode from "./GatewayNode";
import ScriptTaskNode from "./ScriptTaskNode";

export const nodeTypes = {
  start: StartNode,
  service_task: ActionNode,
  end: EndNode,
  condition: ConditionNode,
  user_task: UserTaskNode,
  api_gateway: ApiGatewayNode,
  nginx_proxy: NginxProxyNode,
  external_system: ExternalSystemNode,
  parallel_gateway: GatewayNode,
  exclusive_gateway: GatewayNode,
  script_task: ScriptTaskNode,
};

export default nodeTypes;
