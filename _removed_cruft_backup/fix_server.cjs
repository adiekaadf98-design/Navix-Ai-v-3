const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// First, remove the previously injected block
const startMarker = '// ==========================================';
const endMarker = 'app.get("*", (req, res) => {';

let startIndex = content.indexOf(startMarker);
let endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const toRemove = content.slice(startIndex, endIndex);
  content = content.replace(toRemove, '');
}

// Now insert them before Vite middleware
const viteMarker = 'if (process.env.NODE_ENV !== "production") {';
const newStartIndex = content.indexOf(viteMarker);

if (newStartIndex !== -1) {
    const routes = `
  // ==========================================
  // SHADOW ENGINE API ENDPOINTS
  // ==========================================
  
  app.post('/api/v1/generate', express.json(), async (req, res) => {
    try {
      const requestParams = req.body;
      const pipelineType = globalPipelineClassifier.classify(
        requestParams.prompt || '', 
        !!requestParams.image_url, 
        !!requestParams.video_url
      );
      
      const enrichedRequest = { ...requestParams, type: pipelineType };
      const jobId = await globalJobManager.createJob(enrichedRequest);
      
      res.json({ status: 'success', job_id: jobId, pipeline: pipelineType });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  app.get('/api/v1/job-status/:jobId', (req, res) => {
    const status = globalJobManager.getJobStatus(req.params.jobId);
    if (!status) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(status);
  });

  app.get('/api/v1/health', (req, res) => {
    const telemetry = globalTelemetry.getTelemetry();
    res.json({ status: 'online', telemetry });
  });

  app.get('/api/v1/models', (req, res) => {
    res.json(globalModelRegistry.getAllModels());
  });

  app.get('/api/v1/capabilities', (req, res) => {
    res.json({
        TEXT_TO_TEXT: true,
        IMAGE_UNDERSTANDING: true,
        DOCUMENT_PROCESSING: true,
        TEXT_TO_IMAGE: true,
        IMAGE_TO_IMAGE: false, // Depending on Gemini support via Vertex
        TEXT_TO_VIDEO: true, // Google Veo if supported, otherwise simulation warning
        IMAGE_TO_VIDEO: false,
        MOTION_TRANSFER: false
    });
  });

`;
    content = content.slice(0, newStartIndex) + routes + content.slice(newStartIndex);
    fs.writeFileSync('server.ts', content);
    console.log("Fixed server.ts successfully.");
} else {
    console.log("Failed to find vite marker");
}
