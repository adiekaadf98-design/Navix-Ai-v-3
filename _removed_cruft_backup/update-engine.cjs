const fs = require('fs');
let code = fs.readFileSync('src/services/ThinkingEngine.ts', 'utf8');

code = code.replace(/export function createTaskPlan\([\s\S]*?\): TaskPlan \{[\s\S]*?outputFormat: "sesuai permintaan user"\n  \};\n\}/, `export function createTaskPlan(
  input: string,
  taskType: TaskType,
  complexity: Complexity,
  maxSteps: number
): TaskPlan {
  // Navix 15-Layer Core Architecture
  const fullSteps = [
    "Intent Intelligence",
    "Complexity & Risk Detection",
    "Planning Engine",
    "Smart Router",
    "Memory Retrieval",
    "Web / Data / Tool Access",
    "Single atau Multi-Engine Processing",
    "Evidence Collection",
    "Cross-Verification",
    "Quality Evaluation",
    "Self-Correction",
    "Confidence & Uncertainty Scoring",
    "Human Control",
    "FINAL OUTPUT",
    "Learning & Performance Update"
  ];

  // Adjust steps based on effort level / maxSteps
  let selectedSteps = [];
  if (maxSteps <= 3) {
    selectedSteps = [
      "Intent Intelligence",
      "Single Engine Processing",
      "FINAL OUTPUT"
    ];
  } else if (maxSteps <= 5) {
    selectedSteps = [
      "Intent Intelligence",
      "Complexity Detection",
      "Web / Tool Access",
      "Quality Evaluation",
      "FINAL OUTPUT"
    ];
  } else if (maxSteps <= 10) {
    selectedSteps = [
      "Intent Intelligence",
      "Planning Engine",
      "Smart Router",
      "Memory Retrieval",
      "Web / Tool Access",
      "Evidence Collection",
      "Cross-Verification",
      "Quality Evaluation",
      "FINAL OUTPUT"
    ];
  } else {
    selectedSteps = fullSteps;
  }

  return {
    goal: input,
    subGoals: [
      \`Jenis tugas: \${taskType}\`,
      \`Kompleksitas: \${complexity}\`,
      \`Layer aktif: \${selectedSteps.length}/15\`
    ],
    steps: selectedSteps,
    neededTools: [],
    risks: [
      "Kemungkinan halusinasi data",
      "Ambiguitas instruksi pengguna",
      "Kompleksitas task yang diremehkan",
      "Keterbatasan akses sumber valid"
    ],
    outputFormat: "Structured Analysis & Output"
  };
}`);

fs.writeFileSync('src/services/ThinkingEngine.ts', code);
console.log("Updated ThinkingEngine.ts");
