import { McpSkillAdapter } from './McpSkillAdapter';
import { NavixValidator } from './NavixValidator';

export class McpSkillExecutor {
  static async execute(skillName: string, args: any): Promise<any> {
    try {
      const payload = McpSkillAdapter.adaptRequest(skillName, args);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('navix_auth_token') || localStorage.getItem('navix_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      const res = await fetch(`/api/mcp/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const rawOutput = await res.json();
      return NavixValidator.validateOutput(rawOutput);
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to execute MCP Skill" };
    }
  }
}
