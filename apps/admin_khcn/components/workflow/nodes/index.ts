import StartNode from "./StartNode";
import EndNode from "./EndNode";
import UserTaskNode from "./UserTaskNode";
import ConditionNode from "./ConditionNode";
import ActionNode from "./ActionNode";

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  user_task: UserTaskNode,
  condition: ConditionNode,
  service_task: ActionNode,
};

export default nodeTypes;
