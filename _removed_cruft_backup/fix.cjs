const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const generateHighQualityBase64 = `  const generateHighQualityBase64 = async (req: express.Request | undefined, cleanPrompt: string, requestedAspectRatio: string = "1:1", tryGemini: boolean = true): Promise<{ success: boolean; imageBase64?: string; error?: string }> => {
    try {
      const photoreal = translateAndEnrichPrompt(cleanPrompt);
      const width = requestedAspectRatio === "16:9" ? 1280 : requestedAspectRatio === "9:16" ? 720 : 1024;
      const height = requestedAspectRatio === "16:9" ? 720 : requestedAspectRatio === "9:16" ? 1280 : 1024;

      const cleanEncodedPrompt = encodeURIComponent(photoreal.prompt.substring(0, 950));
      const cleanEncodedNegative = encodeURIComponent(photoreal.negativePrompt.substring(0, 400));
      const seed = Math.floor(Math.random() * 999999);
      
      const pollinationsUrl = \`https://image.pollinations.ai/prompt/\${cleanEncodedPrompt}?width=\${width}&height=\${height}&seed=\${seed}&nologo=true&enhance=false&negative=\${cleanEncodedNegative}&model=flux-realism\`;
      
      console.log(\`[Image Engine] 🔄 Using High-Fidelity Navix Composite Engine (Flux-Realism via Pollinations)\`);
      const res = await fetch(pollinationsUrl);
      if (!res.ok) throw new Error("Fallback generation failed");
      
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return { success: true, imageBase64: \`data:image/jpeg;base64,\${base64}\` };
    } catch (fluxErr: any) {
      console.error(\`[Image Engine] Navix Flux Engine Error:\`, fluxErr);
    }
    return { success: false, error: 'Gagal membuat gambar dengan seluruh mesin Navix.' };
  };

  app.post("/api/vertex-generate-image", async (req, res) => {
    const start = Date.now();
    try {
      const { prompt, aspectRatio, authMode } = req.body;
      const cleanPromptText = prompt || "A photorealistic image";
`;

const startTarget = '  const generateHighQualityBase64 = async (req: express.Request | undefined, cleanPrompt: string, requestedAspectRatio: string = "1:1", tryGemini: boolean = true): Promise<{ success: boolean; imageBase64?: string; error?: string }> => {';
const endTarget = '    try {\n      const photoreal = translateAndEnrichPrompt(cleanPromptText);';

const startIndex = code.indexOf(startTarget);
const endIndex = code.indexOf(endTarget);

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + generateHighQualityBase64 + code.substring(endIndex);
    fs.writeFileSync('server.ts', code);
    console.log('Successfully fixed server.ts');
} else {
    console.log('Failed to fix server.ts');
}
