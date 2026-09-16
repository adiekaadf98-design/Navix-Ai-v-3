const { GoogleGenAI } = require('@google/genai');

async function main() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        for (const model of data.models) {
            if (model.name.includes("imagen") || model.name.includes("image")) {
                console.log(model.name, "=>", model.supportedGenerationMethods);
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
