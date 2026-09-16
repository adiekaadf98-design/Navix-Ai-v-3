import { mcpSkillRegistry } from './NavixSkillRegistry';
import { McpSkillExecutor } from './McpSkillExecutor';
import { McpSkillAdapter } from './McpSkillAdapter';

export class NavixSkillRouter {
  static async discoverSkills(serverName: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/mcp/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverName })
      });
      const data = await res.json();
      if (data.tools) {
        McpSkillAdapter.discoverAndRegister(serverName, data.tools);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to discover MCP skills", e);
      return false;
    }
  }

  static getAvailableSkills() { return mcpSkillRegistry.getAllSkills(); }

  static async routeSkill(skillName: string, args: any) {
    console.log(`[NavixSkillRouter] Routing execution for: ${skillName}`);
    return await McpSkillExecutor.execute(skillName, args);
  }
}
