import { McpSkillAdapter } from './McpSkillAdapter';
import { NavixValidator } from './NavixValidator';

const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') return '';
  return (typeof process !== 'undefined' && process.env?.NAVIX_INTERNAL_BASE_URL) || 'http://127.0.0.1:3000';
};

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
      } else if (typeof process !== 'undefined') {
        headers['x-navix-internal'] = process.env.NAVIX_INTERNAL_SECRET || process.env.JWT_SECRET || 'navix_default_secret_key_change_in_production';
      }
      const baseUrl = getBaseApiUrl();
      const res = await fetch(`${baseUrl}/api/mcp/execute`, {
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
