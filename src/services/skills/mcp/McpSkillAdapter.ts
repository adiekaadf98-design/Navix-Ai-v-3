import { mcpSkillRegistry, McpSkill } from './NavixSkillRegistry';

// SKILL ADAPTER
// Adapts the internal request to standard MCP format sent to the backend
export class McpSkillAdapter {
  static async discoverAndRegister(serverName: string, tools: any[]) {
    tools.forEach(tool => {
      mcpSkillRegistry.registerSkill({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        serverName: serverName
      });
    });
  }

  static adaptRequest(skillName: string, args: any) {
    const skill = mcpSkillRegistry.getSkill(skillName);
    if (!skill) throw new Error(`Skill ${skillName} not found`);
    return {
      serverName: skill.serverName,
      toolName: skill.name,
      args
    };
  }
}
