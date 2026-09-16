const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const models = await ai.models.list();
  for await (const m of models) {
    if (m.name.includes('gemini-3-pro-image')) {
      console.log(m);
      break;
    }
  }
}
run();
