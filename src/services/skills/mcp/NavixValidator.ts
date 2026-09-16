// NAVIX VALIDATOR
export class NavixValidator {
  static validateOutput(output: any): any {
    if (!output) {
      throw new Error("Execution failed: No output received.");
    }
    
    // Check if the MCP server returned an error flag
    if (output.isError) {
      throw new Error(`MCP Skill Execution Error: ${JSON.stringify(output.content)}`);
    }

    return {
      success: true,
      data: output.content,
      timestamp: new Date().toISOString()
    };
  }
}
