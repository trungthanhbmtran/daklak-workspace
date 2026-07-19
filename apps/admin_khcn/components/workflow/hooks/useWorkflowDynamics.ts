/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { workflowApi } from "@/features/workflow/api";

export function useWorkflowDynamics() {
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [dynamicTriggers, setDynamicTriggers] = useState<any[]>([]);
  const [taskRoles, setTaskRoles] = useState<any[]>([]);
  const [workflowModules, setWorkflowModules] = useState<{ id: string; code: string; name: string; description?: string }[]>([]);
  const [orgRoles, setOrgRoles] = useState<{ code: string; name: string; rank: number; authorityLevel?: string; category?: string }[]>([]);

  useEffect(() => {
    const fetchDynamics = async () => {
      try {
        const [svcs, trigs, roles, modules, org] = await Promise.all([
          workflowApi.getServices(),
          workflowApi.getTriggers(),
          workflowApi.getTaskRoles().catch(() => []),
          workflowApi.getModules().catch(() => []),
          workflowApi.getOrgRoles().catch(() => []),
        ]);
        setDynamicServices(svcs);
        setDynamicTriggers(trigs);
        setTaskRoles(roles);
        setWorkflowModules(modules || []);
        setOrgRoles(org || []);
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
    workflowModules,
    orgRoles,
  };
}
