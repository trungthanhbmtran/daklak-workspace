import React from 'react';
import { Accordion } from "@/components/ui/accordion";
import { PropertiesPanelComponentProps } from "./types";
import { BasicEdgeConfig } from "./edge/BasicEdgeConfig";
import { RuleBuilderConfig } from "./edge/RuleBuilderConfig";
import { AdvancedExpressionConfig } from "./edge/AdvancedExpressionConfig";

export const EdgeProperties = (props: PropertiesPanelComponentProps) => {
  if (!props.selectedEdge) return null;
  return (
    <div className="space-y-4">
      <BasicEdgeConfig {...props} />
      <RuleBuilderConfig {...props} />
      
      <Accordion type="single" collapsible className="w-full mt-4">
        <AdvancedExpressionConfig {...props} />
      </Accordion>
    </div>
  );
};
