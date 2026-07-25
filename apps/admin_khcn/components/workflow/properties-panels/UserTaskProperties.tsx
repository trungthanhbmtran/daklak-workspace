/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Accordion } from "@/components/ui/accordion";
import { PropertiesPanelComponentProps } from "./types";
import { BasicConfig } from "./user-task/BasicConfig";
import { FormBuilderConfig } from "./user-task/FormBuilderConfig";
import { AdvancedConfig } from "./user-task/AdvancedConfig";
import { DevConfig } from "./user-task/DevConfig";

export const UserTaskProperties = (props: PropertiesPanelComponentProps) => {
  if (!props.selectedNode || !props.onUpdate) return null;

  return (
    <div className="space-y-4">
      <BasicConfig {...props} />

      <Accordion type="multiple" className="w-full mt-4 space-y-2">
        <FormBuilderConfig {...props} />
        <AdvancedConfig {...props} />
        <DevConfig {...props} />
      </Accordion>
    </div>
  );
};
