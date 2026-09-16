// NAVIX SKILL REGISTRY
export interface McpSkill {
  name: string;
  description: string;
  inputSchema: any;
  serverName: string;
}

class NavixSkillRegistry {
  private skills: Map<string, McpSkill> = new Map();

  registerSkill(skill: McpSkill) {
    this.skills.set(skill.name, skill);
  }

  getSkill(name: string): McpSkill | undefined {
    return this.skills.get(name);
  }

  getAllSkills(): McpSkill[] {
    return Array.from(this.skills.values());
  }
}

export const mcpSkillRegistry = new NavixSkillRegistry();
