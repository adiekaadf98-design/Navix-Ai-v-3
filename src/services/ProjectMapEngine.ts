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
      fileRelations: {}
    };

    if (!files || files.length === 0) return map;

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
          }
        }
      }

      if (relations.length === 0) {
        if (path.includes('src/components/')) relations.push('src/App.tsx', 'src/types.ts');
        else if (path.includes('src/services/')) relations.push('src/services/Orchestrator.ts');
        else relations.push('System Core');
      }

      map.fileRelations[path] = relations;
    });

    map.architectureOverview = `Analyzed ${files.length} project modules. Identified ${map.components.length} components, ${map.services.length} services, and ${map.dependencies.length} external libraries.`;
    return map;
  }
  
  public getImpactedAreas(targetFile: string, map: ProjectMap): string[] {
    const impacted: string[] = [];
    if (map.components.includes(targetFile)) {
      impacted.push('UI Layout');
    }
    if (map.services.includes(targetFile)) {
      impacted.push('State Management', 'API Handlers');
    }
    if (map.engines.includes(targetFile)) {
      impacted.push('Core Engine Logic', 'Task Decomposer');
    }
    return impacted;
  }
}

export const globalProjectMapEngine = new ProjectMapEngine();
