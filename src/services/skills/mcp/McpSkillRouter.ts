import { mcpSkillRegistry } from './NavixSkillRegistry';
import { McpSkillExecutor } from './McpSkillExecutor';
import { McpSkillAdapter } from './McpSkillAdapter';

const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') return '';
  return (typeof process !== 'undefined' && process.env?.NAVIX_INTERNAL_BASE_URL) || 'http://127.0.0.1:3000';
};

export class NavixSkillRouter {
  static async discoverSkills(serverName: string): Promise<boolean> {
    try {
      const baseUrl = getBaseApiUrl();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('navix_auth_token') || localStorage.getItem('navix_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else if (typeof process !== 'undefined') {
        headers['x-navix-internal'] = process.env.NAVIX_INTERNAL_SECRET || process.env.JWT_SECRET || 'navix_default_secret_key_change_in_production';
      }
      const res = await fetch(`${baseUrl}/api/mcp/discover`, {
        method: 'POST',
        headers,
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
    const available = this.getAvailableSkills();
    if (available.length === 0) {
      return {
        status: 'CAPABILITY_NOT_AVAILABLE',
        success: false,
        error: `MCP_SKILLS_UNAVAILABLE: No MCP skills are registered or available for execution (${skillName}).`,
        skillCount: 0
      };
    }
    const found = available.find(s => s.name === skillName);
    if (!found) {
      return {
        status: 'CAPABILITY_NOT_AVAILABLE',
        success: false,
        error: `MCP_SKILL_NOT_FOUND: Skill "${skillName}" is not registered on any active MCP provider.`,
        skillCount: available.length
      };
    }
    return await McpSkillExecutor.execute(skillName, args);
  }
}
