const { parseWorkflowDefinition } = require('./components/workflow/utils/parseWorkflowDefinition');

const data = {
  "bpmnLogic": {
    "nodes": [
      {
        "id": "start_1",
        "data": { "label": "Công dân nộp hồ sơ" },
        "type": "start",
        "position": { "x": 50, "y": 250 }
      }
    ],
    "edges": []
  },
  "uiMetadata": {}
};

console.log(JSON.stringify(parseWorkflowDefinition(data), null, 2));
