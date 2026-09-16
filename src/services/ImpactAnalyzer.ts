import { ProjectMap } from './ProjectMapEngine';

export interface ImpactAnalysisResult {
  targetFile: string;
  directDependencies: string[];
  dependents: string[];
  sideEffects: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class ImpactAnalyzer {
  public analyze(targetFile: string, map: ProjectMap): ImpactAnalysisResult {
    const directDeps = map.fileRelations[targetFile] || [];
    const dependents: string[] = [];

    // Find all files that depend on targetFile
    const normalizedTarget = targetFile.replace(/^\.\//, '');
    for (const [file, deps] of Object.entries(map.fileRelations)) {
      if (file === targetFile) continue;
      const dependsOnTarget = deps.some(dep => {
        const normalizedDep = dep.replace(/^\.\//, '');
        return normalizedDep.includes(normalizedTarget) || normalizedTarget.includes(normalizedDep);
      });
      if (dependsOnTarget) {
        dependents.push(file);
      }
    }

    const sideEffects: string[] = [];
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (targetFile.includes('App.tsx') || targetFile.includes('main.tsx') || targetFile.includes('server.ts')) {
      riskLevel = 'CRITICAL';
      if (!dependents.includes('Entire Application')) dependents.unshift('Entire Application');
      sideEffects.push('Global State Breakage', 'Container Boot Failure', 'Routing Disruption');
    } else if (targetFile.includes('services/Orchestrator.ts') || targetFile.includes('services/EngineRegistry.ts')) {
      riskLevel = 'CRITICAL';
      sideEffects.push('Multi-Domain Engine Dispatch Failure', 'Request Routing Stall');
    } else if (targetFile.includes('services/')) {
      riskLevel = dependents.length > 2 ? 'HIGH' : 'MEDIUM';
      sideEffects.push('Business Logic Desynchronization', 'Service Data Pipeline Latency');
    } else if (targetFile.includes('components/')) {
      riskLevel = dependents.length > 2 ? 'MEDIUM' : 'LOW';
      sideEffects.push('UI Render Glitches', 'Component Unmount / Memory Retention');
    }

    if (dependents.length >= 5 && riskLevel !== 'CRITICAL') {
      riskLevel = 'HIGH';
    }

    return {
      targetFile,
      directDependencies: directDeps,
      dependents,
      sideEffects,
      riskLevel
    };
  }
}

export const globalImpactAnalyzer = new ImpactAnalyzer();
