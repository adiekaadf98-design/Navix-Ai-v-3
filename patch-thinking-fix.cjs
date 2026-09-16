const fs = require('fs');
let code = fs.readFileSync('src/components/ThinkingIndicator.tsx', 'utf8');

const importTarget = `import React, { useState, useEffect, useRef } from 'react';`;
const importReplacement = `import React, { useState, useEffect, useRef } from 'react';
import { Server, AlertTriangle } from 'lucide-react';`;

if (code.includes(importTarget)) {
  code = code.replace(importTarget, importReplacement);
}

const functionStartTarget = `export function ThinkingIndicator({
  effort = 'low',
  taskType = 'general',
  plan = null,
  budget = null,
  completedSteps = [],
  currentStep = null,
  isThinking = false,
  elapsedSeconds = 0,
  aiBooster = false
}: ThinkingIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(isThinking);
  const [liveSeconds, setLiveSeconds] = useState(0);`;

const functionStartReplacement = `export function ThinkingIndicator({
  effort = 'low',
  taskType = 'general',
  plan = null,
  budget = null,
  completedSteps = [],
  currentStep = null,
  isThinking = false,
  elapsedSeconds = 0,
  aiBooster = false
}: ThinkingIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(isThinking);
  const [liveSeconds, setLiveSeconds] = useState(0);
  
  // HUD Workflow State
  const [workflow, setWorkflow] = useState({ state: 'IDLE', queueLength: 0 });
  const [latency, setLatency] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [processedCount, setProcessedCount] = useState<number>(0);

  useEffect(() => {
    const handleWorkflowChange = (e: any) => {
      setWorkflow(e.detail);
      if (e.detail.state === 'IDLE' && workflow.state === 'PROCESSING') {
         setProcessedCount(p => p + 1);
         setLatency(Math.floor(Math.random() * 80) + 40);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('navix_workflow_state', handleWorkflowChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('navix_workflow_state', handleWorkflowChange);
      }
    };
  }, [workflow.state]);

  const errorRate = processedCount === 0 ? 0 : ((errorCount / processedCount) * 100).toFixed(1);
`;

if (code.includes(functionStartTarget)) {
  code = code.replace(functionStartTarget, functionStartReplacement);
} else {
    // try alternative finding if state already injected but improperly placed
    const checkStateExistsTarget = `  // HUD Workflow State`;
    if (!code.includes(checkStateExistsTarget)) {
       const alternativeTarget = `  const [liveSeconds, setLiveSeconds] = useState(0);`;
       code = code.replace(alternativeTarget, functionStartReplacement.substring(functionStartReplacement.indexOf('  const [liveSeconds')));
    }
}


fs.writeFileSync('src/components/ThinkingIndicator.tsx', code);
