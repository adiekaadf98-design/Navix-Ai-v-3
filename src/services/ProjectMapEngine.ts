export interface ProjectMap {
  projectId: string;
  entryPoints: string[];
  components: string[];
  services: string[];
  dependencies: string[];
  apis: string[];
  engines: string[];
  architectureOverview: string;
  fileRelations: Record<string, string[]>;
  circularDependencies?: string[][];
  moduleMetrics?: {
    totalFiles: number;
    externalDepCount: number;
    internalDepCount: number;
    couplingDensity: number;
  };
}

export class ProjectMapEngine {
  public analyzeProjectStructure(files: any[]): ProjectMap {
    const map: ProjectMap = {
      projectId: `proj_${Date.now()}`,
      entryPoints: [],
      components: [],
      services: [],
      dependencies: [],
      apis: [],
      engines: [],
      architectureOverview: "Scanning project structure...",
      fileRelations: {},
      circularDependencies: [],
      moduleMetrics: {
        totalFiles: 0,
        externalDepCount: 0,
        internalDepCount: 0,
        couplingDensity: 0
      }
    };

    if (!files || files.length === 0) return map;

    let totalInternalLinks = 0;
    const internalGraph: Record<string, string[]> = {};

    files.forEach(file => {
      const path = file.path || file.name || '';
      
      // Analyze file type based on path
      if (path.includes('src/components/')) {
        map.components.push(path);
      } else if (path.includes('src/services/')) {
        map.services.push(path);
      } else if (path.includes('src/api/')) {
        map.apis.push(path);
      } else if (path.includes('App.tsx') || path.includes('index.html') || path.includes('main.tsx')) {
        map.entryPoints.push(path);
      } else if (path.includes('Engine.ts')) {
        map.engines.push(path);
      }
      
      // Authentic relation mapping based on explicit imports or path hierarchy
      const relations: string[] = [];
      const internalImports: string[] = [];
      const content = file.content || '';
      
      if (content && typeof content === 'string') {
        const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
          const importPath = match[1];
          if (!importPath.startsWith('.')) {
            if (!map.dependencies.includes(importPath)) map.dependencies.push(importPath);
            relations.push(`External: ${importPath}`);
          } else {
            relations.push(importPath);
            internalImports.push(importPath);
            totalInternalLinks++;
          }
        }
      }

      if (relations.length === 0) {
        if (path.includes('src/components/')) relations.push('src/App.tsx', 'src/types.ts');
        else if (path.includes('src/services/')) relations.push('src/services/Orchestrator.ts');
        else relations.push('System Core');
      }

      map.fileRelations[path] = relations;
      internalGraph[path] = internalImports;
    });

    // Detect Simple Cycles in Internal Graph
    const detectedCycles: string[][] = [];
    const visited: Record<string, boolean> = {};
    const recStack: Record<string, boolean> = {};

    const findCycles = (node: string, currentPath: string[]) => {
      visited[node] = true;
      recStack[node] = true;
      const neighbors = internalGraph[node] || [];

      for (const neighbor of neighbors) {
        // Resolve relative candidate
        const matchedKey = Object.keys(internalGraph).find(k => k.includes(neighbor.replace(/^\.\.?\//, '')));
        if (matchedKey) {
          if (!visited[matchedKey]) {
            findCycles(matchedKey, [...currentPath, matchedKey]);
          } else if (recStack[matchedKey]) {
            detectedCycles.push([...currentPath, matchedKey]);
          }
        }
      }
      recStack[node] = false;
    };

    Object.keys(internalGraph).forEach(k => {
      if (!visited[k]) findCycles(k, [k]);
    });

    map.circularDependencies = detectedCycles.slice(0, 5);
    const totalFiles = files.length;
    map.moduleMetrics = {
      totalFiles,
      externalDepCount: map.dependencies.length,
      internalDepCount: totalInternalLinks,
      couplingDensity: totalFiles > 0 ? Number((totalInternalLinks / totalFiles).toFixed(2)) : 0
    };

    map.architectureOverview = `Analisis ${totalFiles} modul proyek: ${map.components.length} komponen, ${map.services.length} services, ${map.dependencies.length} dependensi eksternal. Kepadatan kopling: ${map.moduleMetrics.couplingDensity} (${detectedCycles.length === 0 ? 'Bebas siklus / Clean' : `${detectedCycles.length} dependensi siklik terdeteksi`}).`;
    return map;
  }
  
  public getImpactedAreas(targetFile: string, map: ProjectMap): string[] {
    const impacted: string[] = [];
    if (map.components.includes(targetFile)) {
      impacted.push('UI Layout', 'Visual Rendering');
    }
    if (map.services.includes(targetFile)) {
      impacted.push('State Management', 'API Handlers', 'Business Logic Pipeline');
    }
    if (map.engines.includes(targetFile)) {
      impacted.push('Core Engine Logic', 'Task Decomposer', 'Verification Gate');
    }
    if (map.entryPoints.includes(targetFile)) {
      impacted.push('Global App Bootstrap', 'Routing Hierarchy');
    }
    if (impacted.length === 0) {
      impacted.push('General Module Dependency');
    }
    return impacted;
  }
}

export const globalProjectMapEngine = new ProjectMapEngine();
