const { GoogleGenAI } = require('@google/genai');
async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    let response = await ai.models.list();
    for await (const model of response) {
      console.log(model.name, model.supportedGenerationMethods);
    }
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
