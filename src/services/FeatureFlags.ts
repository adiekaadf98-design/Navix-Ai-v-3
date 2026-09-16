export const FeatureFlags = {
  knowledge_lab_enabled: true,
  knowledge_ingestion_enabled: true,
  knowledge_graph_enabled: true,
  triangulation_enabled: true,
  adversarial_check_enabled: true,
  retention_test_enabled: true,
  synthetic_problem_enabled: true,
  skill_promotion_enabled: true,
  knowledge_decay_enabled: true,
  meta_cognition_enabled: true,
  uncertainty_engine_enabled: true,
  causal_reasoning_enabled: true,
  counterfactual_enabled: true,
  experiment_engine_enabled: true,
  failure_intelligence_enabled: true,
  capability_benchmark_enabled: true,
  dynamic_model_routing_enabled: true,
  long_horizon_enabled: true,
  ai_immune_enabled: true
};

export function isFeatureEnabled(featureName: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[featureName] === true;
}
