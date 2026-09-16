const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  // Standard OpenAI-compatible Chat Completions Endpoint
  app.post("/v1/chat/completions", authenticateNavixApi, trackUsageAndEnforceQuota, async (req, res) => {
    try {
      const { messages, model } = req.body;
      if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages format" });
      
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
      
      // Use Google AI Studio (Gemini) under the hood!
      const ai = getAiClient();
      
      // Map OpenAI messages to Gemini format (simplified for this demo)
      const promptText = messages.map(m => \`\${m.role}: \${m.content}\`).join('\\n') + '\\nassistant:';
      
      // We will use gemini-2.5-flash as the actual engine powering "navix-pro-v1"
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });
      
      const responseText = geminiResponse.text || "Tidak ada respons.";
      
      const response = {
        id: "chatcmpl-nvx-" + Date.now(),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: model || "navix-pro-v1",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: responseText
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: promptText.length,
          completion_tokens: responseText.length,
          total_tokens: promptText.length + responseText.length
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error("Navix API internal error:", error);
      res.status(500).json({ error: "Internal Server Error during AI generation." });
    }
  });
`;

// Simple replacement
const oldStart = '  // Standard OpenAI-compatible Chat Completions Endpoint';
const oldEnd = '  if (process.env.NODE_ENV !== "production") {';

const startIndex = content.indexOf(oldStart);
const endIndex = content.indexOf(oldEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newEndpoint + '\n' + content.substring(endIndex);
  fs.writeFileSync('server.ts', content);
  console.log("Bridged Navix API with Gemini API successfully");
} else {
  console.log("Could not find markers for replacement.");
}
