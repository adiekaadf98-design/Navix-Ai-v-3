const fs = require('fs');
const content = fs.readFileSync('src/components/studios/StockImageStudio.tsx', 'utf8');

const targetStr = `  const processQueue = async () => {
    if (processingRef.current || queue.length === 0) return;
    setIsProcessing(true);
    
    const currentQueue = [...queue];
    
    for (let i = 0; i < currentQueue.length; i++) {
      const job = currentQueue[i];
      if (job.status === 'COMPLETED' || job.status === 'FAILED') continue;
      
      // Update job status to processing
      setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: 'PROCESSING' } : q));
      
      const category = categorizeSubject(job.input);
      let successCount = 0;
      
      for (let j = 0; j < job.count; j++) {
        try {
          const { expanded, negative, variation_parameters } = generateExpandedPrompt(job.input, category, j);
          
          // Actually call image generation API
          const res = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: expanded,
              aspectRatio: '4:3'
            })
          });
          
          if (!res.ok) throw new Error('Generation failed');
          
          const data = await res.json();
          if (!data.imageUrl) throw new Error('No image returned');
          
          // Validation checks
          const isValid = data.imageUrl && data.imageUrl.startsWith('http');
          if (!isValid) throw new Error('Validation failed - Invalid URL');
          
          // Duplicate check (simulated hash check)
          const isDuplicate = stock.some(s => s.url === data.imageUrl);
          
          const newImage: StockImage = {
            id: \`stk-\${Date.now()}-\${j}\`,
            filename: \`stock_\${category}_\${Date.now()}_\${j}.jpg\`,
            category,
            subcategory: job.input,
            subject: job.input,
            species: 'Unknown',
            description: expanded,
            original_user_prompt: job.input,
            expanded_prompt: expanded,
            negative_prompt: negative,
            variation_parameters,
            resolution: '1024x768',
            format: 'image/jpeg',
            generation_provider: 'Flux',
            generation_timestamp: new Date().toISOString(),
            generation_status: isDuplicate ? 'DUPLICATE' : 'VALIDATED',
            url: data.imageUrl
          };
          
          if (!isDuplicate) {
            setStock(prev => [...prev, newImage]);
            successCount++;
          }
          
          // Update progress
          setQueue(prev => prev.map(q => q.id === job.id ? { ...q, progress: Math.round(((j + 1) / job.count) * 100) } : q));
          
        } catch (e) {
          console.error('Job error', e);
        }
      }
      
      // Mark job as completed
      setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: 'COMPLETED', progress: 100 } : q));
    }
    
    setIsProcessing(false);
  };`;

const replaceStr = `  const processQueue = async () => {
    if (processingRef.current || queue.length === 0) return;
    setIsProcessing(true);
    
    const currentQueue = [...queue];
    
    for (let i = 0; i < currentQueue.length; i++) {
      const job = currentQueue[i];
      if (job.status === 'COMPLETED' || job.status === 'FAILED') continue;
      
      // Update job status to processing
      setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: 'PROCESSING' } : q));
      
      const category = categorizeSubject(job.input);
      let successCount = 0;
      
      try {
        // Fetch real stock images from Wikipedia/Wikimedia Commons
        const res = await fetch(\`https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=pageimages&generator=search&gsrsearch=\${encodeURIComponent(job.input)}&gsrlimit=\${Math.max(job.count + 10, 20)}&piprop=original\`);
        const data = await res.json();
        
        let validUrls = [];
        let validTitles = [];
        
        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages).filter((p) => p.original && p.original.source);
          validUrls = pages.map((p) => p.original.source);
          validTitles = pages.map((p) => p.title);
        }
        
        for (let j = 0; j < Math.min(job.count, validUrls.length); j++) {
          const { expanded, negative, variation_parameters } = generateExpandedPrompt(job.input, category, j);
          
          const imageUrl = validUrls[j];
          const imageTitle = validTitles[j];
          
          // Validation checks
          const isValid = imageUrl && imageUrl.startsWith('http');
          if (!isValid) continue;
          
          // Duplicate check
          const isDuplicate = stock.some(s => s.url === imageUrl);
          
          const newImage = {
            id: \`stk-\${Date.now()}-\${j}\`,
            filename: \`stock_\${category}_\${Date.now()}_\${j}.jpg\`,
            category,
            subcategory: job.input,
            subject: job.input,
            species: imageTitle,
            description: expanded,
            original_user_prompt: job.input,
            expanded_prompt: expanded,
            negative_prompt: negative,
            variation_parameters,
            resolution: 'High Resolution',
            format: 'image/jpeg',
            generation_provider: 'Wikimedia Commons API (Real Stock Photo)',
            generation_timestamp: new Date().toISOString(),
            generation_status: isDuplicate ? 'DUPLICATE' : 'VALIDATED',
            url: imageUrl
          };
          
          if (!isDuplicate) {
            setStock(prev => [...prev, newImage]);
            successCount++;
          }
          
          // Update progress
          setQueue(prev => prev.map(q => q.id === job.id ? { ...q, progress: Math.round(((j + 1) / job.count) * 100) } : q));
        }
        
        setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: successCount > 0 ? 'COMPLETED' : 'FAILED', progress: 100 } : q));
        if (successCount > 0) showToast(\`\${successCount} Real Stock Images Added!\`, 'success');
        else showToast(\`Failed to find real images for "\${job.input}"\`, 'error');
        
      } catch (e) {
        console.error('Job error', e);
        setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: 'FAILED', progress: 0 } : q));
        showToast('API Error when fetching stock.', 'error');
      }
    }
    
    setIsProcessing(false);
  };`;

if(content.includes(targetStr)) {
  fs.writeFileSync('src/components/studios/StockImageStudio.tsx', content.replace(targetStr, replaceStr));
  console.log("Success");
} else {
  console.log("Target not found!");
}
