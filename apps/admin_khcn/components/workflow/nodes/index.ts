import StartNode from "./StartNode";
import EndNode from "./EndNode";
import UserTaskNode from "./UserTaskNode";
import ConditionNode from "./ConditionNode";
import ActionNode from "./ActionNode";
import NginxProxyNode from "./NginxProxyNode";
import ApiGatewayNode from "./ApiGatewayNode";
import ExternalSystemNode from "./ExternalSystemNode";

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  user_task: UserTaskNode,
  condition: ConditionNode,
  service_task: ActionNode,
  nginx_proxy: NginxProxyNode,
  api_gateway: ApiGatewayNode,
  external_system: ExternalSystemNode,
};

export default nodeTypes;
