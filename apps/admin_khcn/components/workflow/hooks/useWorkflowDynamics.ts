import { useState, useEffect } from "react";
import { workflowApi } from "@/features/workflow/api";

export function useWorkflowDynamics() {
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [dynamicTriggers, setDynamicTriggers] = useState<any[]>([]);
  const [taskRoles, setTaskRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchDynamics = async () => {
      try {
        const [svcs, trigs, roles] = await Promise.all([
          workflowApi.getServices(),
          workflowApi.getTriggers(),
          workflowApi.getTaskRoles().catch(() => []),
        ]);
        setDynamicServices(svcs);
        setDynamicTriggers(trigs);
        setTaskRoles(roles);
      } catch (e) {
        console.error("Failed to fetch dynamic workflow data", e);
      }
    };
    fetchDynamics();
  }, []);

  return {
    dynamicServices,
    dynamicTriggers,
    taskRoles,
  };
}
