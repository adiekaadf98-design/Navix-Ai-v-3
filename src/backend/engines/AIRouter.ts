export class AiRouter {
  selectModel(modelPreference?: string, isThinkingMode?: boolean, hasAttachments?: boolean): string {
    if (modelPreference) {
      if (modelPreference.includes('lite')) return "gemini-3.1-flash-lite";
      if (modelPreference.includes('pro')) return "gemini-3.1-pro-preview";
      if (modelPreference.includes('flash')) return "gemini-3.6-flash";
      return modelPreference;
    }
    return "gemini-3.6-flash";
  }
}

export const navixAiRouter = new AiRouter();
