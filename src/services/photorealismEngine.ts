/**
 * Navix Real-World Asset & Optical Photomontage Engine
 * Inspired by real-world photographic component assembly and identity-preserving inpainting.
 * 
 * 1. Text-to-Image: Decomposes living beings into real photographic components
 *    (Face with authentic pores & cornea reflections, hands/posture with true anatomy,
 *    apparel with real cotton/textile weave, environment with physical room lighting).
 * 2. Image-to-Image: Preserves 100% of user's original face & identity while
 *    exclusively editing the requested component (clothing, background, lighting, objects).
 */

export interface RealComponentDecomposition {
  face: string;
  handsAndPose: string;
  apparel: string;
  environment: string;
  opticalSetup: string;
}

export interface EnrichedPromptResult {
  prompt: string;
  negativePrompt: string;
  subjectType: 'portrait' | 'landscape' | 'wildlife' | 'architecture' | 'product' | 'general';
  decomposition?: RealComponentDecomposition;
}

const INDONESIAN_TO_ENGLISH_MAP: [RegExp, string][] = [
  // Human Subjects & Real Person Features
  [/\b(cewek|perempuan|gadis|wanita)\s+(berhijab|hijab|jilbab|kerudung)\b/gi, 'authentic living Southeast Asian Indonesian young woman wearing a casual breathable cotton-voile hijab with realistic natural cloth folds and fabric drape'],
  [/\b(cewek|perempuan|gadis|wanita)\b/gi, 'authentic living Southeast Asian Indonesian young woman with natural everyday human facial features, realistic skin texture with visible micro-pores'],
  [/\b(cowok|pria|laki-laki|pemuda)\b/gi, 'authentic living Southeast Asian Indonesian young man with natural skin texture and genuine everyday facial features'],
  [/\b(anak kecil|bocah|anak-anak)\b/gi, 'candid authentic Indonesian child with genuine natural expression and realistic skin texture'],
  [/\b(kakek|nenek|orang tua)\b/gi, 'elderly Indonesian person with authentic weathered skin, natural wrinkles, and dignified candid expression'],
  [/\b(manusia|orang)\b/gi, 'real living person with authentic human anatomy and organic skin texture'],
  [/\b(wajah|muka)\b/gi, 'genuine living human face with visible natural skin pores, realistic sebaceous texture, fine micro-lines, and natural corneal light reflections'],
  
  // Clothing & Real-World Apparel (Pakaian Realistis & Tekstur Kain)
  [/\b(revisi pakaian|ganti pakaian|ganti baju|pakaian baru|perbaiki pakaian)\b/gi, 'revised authentic everyday textile clothing with woven cotton fabric, visible seam stitching, and realistic physical cloth drape'],
  [/\b(pakaian lengkap|baju lengkap|busana lengkap)\b/gi, 'complete detailed everyday outfit with textured cotton fabric, real button placket, and natural wrinkles'],
  [/\b(pakaian|baju|busana)\b/gi, 'authentic everyday woven cotton apparel with natural creases, visible seam stitches, and physical drape'],
  [/\b(berhijab|hijab|jilbab|kerudung)\b/gi, 'wearing a natural lightweight cotton-voile square hijab with realistic fabric creases, matte texture, seam stitching, and natural shoulder drape'],
  [/\b(seragam sma|seragam putih abu-abu|baju sma)\b/gi, 'wearing authentic Indonesian high school uniform with white short-sleeve buttoned cotton shirt, OSIS badge on chest pocket, natural cloth wrinkles, and grey skirt/trousers'],
  [/\b(seragam sekolah|baju sekolah)\b/gi, 'wearing authentic everyday school uniform with woven cotton texture, real seam stitches, button placket, and natural fabric creases'],
  [/\b(seragam pramuka)\b/gi, 'wearing authentic Indonesian scout uniform with brown cotton fabric texture, pocket flaps, and shoulder epaulets'],
  [/\b(kemeja)\b/gi, 'wearing a casual button-down woven cotton shirt with visible seam lines and realistic fabric wrinkles'],
  [/\b(kaos|t-shirt)\b/gi, 'wearing a soft breathable cotton jersey t-shirt with natural cloth folds around the shoulders'],
  [/\b(jaket|hoodie)\b/gi, 'wearing a casual fleece or denim jacket with genuine zip and stitch details'],
  [/\b(batik)\b/gi, 'wearing traditional authentic Indonesian cotton batik shirt with intricate printed textile patterns and realistic cloth drape'],
  [/\b(baju muslim|gamis)\b/gi, 'wearing modest flowing linen/cotton attire with natural heavy cloth draping and seam details'],
  [/\b(celana jeans|jeans)\b/gi, 'wearing denim jeans with authentic textured twill weave and natural knee creases'],

  // Posture & Everyday Actions
  [/\b(duduk di meja kelas|duduk di kelas)\b/gi, 'sitting naturally at a wooden school study desk in a fully-detailed classroom with notebooks and pens on the table'],
  [/\b(duduk di meja)\b/gi, 'sitting comfortably at a real wooden table with natural forearm placement'],
  [/\b(duduk di kursi)\b/gi, 'sitting relaxed on a chair in a candid, non-stiff posture'],
  [/\b(berdiri)\b/gi, 'standing naturally in a relaxed, candid posture with organic weight distribution'],
  [/\b(tersenyum manis|tersenyum ramah|tersenyum)\b/gi, 'with a subtle, genuine candid gentle smile, natural eye crinkles, and unforced facial expression'],
  [/\b(tertawa)\b/gi, 'laughing naturally with genuine joyful expression and authentic facial muscle movement'],
  [/\b(melamun|menatap keluar)\b/gi, 'thoughtfully looking out through a large sunlit glass window, candid unposed mood'],
  [/\b(belajar|membaca buku)\b/gi, 'attentively reading an open printed book on the table with natural hand placement'],
  [/\b(ngopi|minum kopi)\b/gi, 'holding a ceramic coffee cup naturally with visible steam and table details'],

  // Complete Real-World Background Environments (Latar Belakang Lengkap)
  [/\b(beground yang di butuhkan lengkap|background lengkap|beground lengkap|latar belakang lengkap|latar lengkap)\b/gi, 'complete, highly detailed real-world environment filled with authentic furniture, architectural details, ambient window lighting, and deep spatial realism'],
  [/\b(beground|background|latar belakang|latar)\b/gi, 'fully-detailed real environment with authentic spatial depth and natural ambient light'],
  [/\b(di kelas|sekolah|ruang kelas)\b/gi, 'inside an authentic Indonesian school classroom with wooden student desks, chairs, green chalkboard with chalk writing and formulas, notice boards with posters, glass windows with natural sunlight streaming in, textured tile floor, and deep background clutter'],
  [/\b(di kamar)\b/gi, 'inside a realistic lived-in bedroom with wooden bed frame, desk, bookshelf, lamp, curtains, and warm ambient room daylight'],
  [/\b(di kantor)\b/gi, 'in a fully equipped modern office room with wooden desks, computer monitors, office chairs, and soft indoor ambient lighting'],
  [/\b(di cafe|di kafe)\b/gi, 'in a vibrant cozy cafe interior with wooden tables, warm hanging pendant lights, coffee bar in background, and realistic depth of field'],
  [/\b(di perpustakaan)\b/gi, 'inside a quiet library with tall wooden bookshelves packed with books, study tables, and soft daylight from tall windows'],
  [/\b(di jalan|di trotoar)\b/gi, 'on a real city street sidewalk with pedestrian walkway, trees, buildings in background, and crisp natural daylight'],
  [/\b(di pantai)\b/gi, 'at a realistic tropical coastal beach with sand texture, gentle ocean waves, distant shoreline, and natural golden hour sunlight'],
  [/\b(di taman)\b/gi, 'in an authentic lush green public garden with park benches, green grass, trees, and dappled sunlight'],
  [/\b(di rumah)\b/gi, 'inside an authentic family living room with sofa, tiled floor, wall decorations, and natural window lighting'],
  
  // Realism, Anti-Doll & Anti-Plastic Keywords
  [/\b(secara real dunia masih bonekah|masih bonekah|masih boneka|jangan seperti boneka|bukan boneka|anti boneka)\b/gi, '100% genuine real living human photograph with authentic organic skin pores, imperfect natural skin texture, asymmetrical facial features, completely non-plastic, non-airbrushed candid snapshot'],
  [/\b(secara real dunia|real dunia|dunia nyata|asli|nyata|realistis)\b/gi, 'authentic documentary photograph of the real world with natural ambient lighting, genuine material textures, and organic human features'],
  
  // Lighting & Atmospheric Depth
  [/\b(senja|sore hari)\b/gi, 'during late afternoon golden hour with warm low-angle directional sunlight and long natural physical shadows'],
  [/\b(pagi hari)\b/gi, 'during crisp morning daylight with soft diffused ambient light and realistic shadow gradients'],
  [/\b(malam hari|malam)\b/gi, 'at night illuminated by warm realistic indoor tungsten lights and street lamps with authentic shadow fall-off'],
  [/\b(hujan)\b/gi, 'during rain with delicate water droplets on glass windows, wet ground reflections, and authentic overcast sky lighting'],

  // Animals
  [/\b(kucing)\b/gi, 'domestic cat with individual hair follicles, realistic eye slit reflections, and detailed fur texture'],
  [/\b(anjing)\b/gi, 'domestic dog with natural fur texture and authentic wet nose texture'],
  [/\b(burung)\b/gi, 'wild bird with intricate feather barbules and realistic avian anatomy']
];

/**
 * Remove clunky AI buzzwords that ruin modern diffusion models by causing over-smoothed plastic dolls.
 */
export function cleanBuzzwords(text: string): string {
  return text
    .replace(/\b(photorealistic|hyperrealistic|ultra realistic|super detailed|hyper detailed|8k resolution|octane render|unreal engine 5|unreal engine|perfect skin|flawless skin|porcelain skin|smooth skin|doll face|beautiful perfect|masterpiece|cantik|glowing skin|baby face|mulus|flawless|boneka|anime|barbie|aesthetic model|3d model|cgi|wax doll|mannequin)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decomposes real-world human/living being components from user query
 * to construct a multi-element photographic composite with complete background and authentic wardrobe.
 */
export function decomposeRealWorldComponents(cleanPrompt: string): RealComponentDecomposition {
  const p = cleanPrompt.toLowerCase();
  
  let face = "highly detailed living human face, photorealistic skin texture, natural soft skin tones, elegant facial features, deep expressive eyes with authentic corneal glints, cinematic lighting";
  let apparel = "elegant, high-quality fabric, authentic clothing with natural draping, rich textile details and textures";
  let handsAndPose = "graceful, natural, and elegant human posture, perfect anatomical proportions, cinematic framing";
  let environment = "beautifully composed real-world background, cinematic depth of field, rich environmental details, soft ambient lighting, elegant atmosphere";
  let opticalSetup = "shot on Hasselblad medium format camera, 85mm f/1.2 lens, 8k resolution, award-winning portrait photography, ultra-detailed, cinematic studio lighting, masterpiece";

  // Specialized Wardrobe Decomposition
  if (p.includes('hijab') || p.includes('kerudung') || p.includes('jilbab')) {
    apparel = "elegant Indonesian hijab made of high-quality soft premium fabric, beautiful natural draping, graceful folds, highly detailed cloth texture, worn elegantly";
  } else if (p.includes('sma') || p.includes('sekolah') || p.includes('seragam')) {
    apparel = "neat Indonesian high school uniform (seragam putih abu-abu), crisp white shirt, grey skirt/trousers, realistic fabric textures";
  } else if (p.includes('batik')) {
    apparel = "elegant Indonesian premium batik shirt with intricate traditional motifs, high-end woven texture";
  } else if (p.includes('kemeja')) {
    apparel = "crisp, elegant button-up shirt with high-quality fabric texture";
  } else if (p.includes('kaos')) {
    apparel = "high-quality cotton t-shirt with realistic draping";
  }

  // Specialized Complete Background Decomposition
  if (p.includes('kelas') || p.includes('sekolah') || p.includes('belajar')) {
    environment = "beautifully lit classroom environment, cinematic natural sunlight streaming through windows, wooden desks, elegant educational setting, gorgeous depth of field";
    handsAndPose = "sitting gracefully at a wooden study desk, natural and focused posture, elegant framing";
  } else if (p.includes('kamar')) {
    environment = "elegant, cozy lived-in bedroom interior, soft ambient natural lighting, beautiful architectural details, cinematic depth of field";
  } else if (p.includes('kafe') || p.includes('cafe') || p.includes('ngopi')) {
    environment = "high-end aesthetic cafe interior, warm ambient lighting, beautiful rustic wood and glass elements, cinematic bokeh background blur";
  } else if (p.includes('kantor') || p.includes('office')) {
    environment = "modern, elegant corporate office workspace, cinematic ambient lighting, professional atmospheric depth of field";
  } else if (p.includes('pantai')) {
    environment = "gorgeous natural tropical coastline at golden hour, beautiful warm sunlight, cinematic ocean waves, stunning landscape";
  } else if (p.includes('taman') || p.includes('kebun')) {
    environment = "lush, beautiful botanical garden, soft dappled sunlight, rich vibrant greenery, cinematic outdoor lighting";
  }

  return { face, handsAndPose, apparel, environment, opticalSetup };
}

/**
 * Constructs an Identity-Preserving Image Edit Prompt for Image-to-Image tasks.
 * Strict rule: Keep the user's uploaded face 100% intact, modify only requested elements.
 */
export function buildIdentityPreservingEditPrompt(userInstruction: string): string {
  const cleanInst = cleanBuzzwords(userInstruction);
  return `PRECISE PHOTO EDITING INSTRUCTION:
1. STRICT FACE & IDENTITY LOCK: Retain the EXACT original face, facial features, eyes, nose, mouth shape, skin tone, and human identity from the provided image with 100% accuracy. Do NOT replace, reshape, or alter the person's face.
2. SELECTIVE TARGET MODIFICATION: Only edit and apply the requested change: "${cleanInst}".
3. REAL-WORLD TEXTURE & LIGHTING HARMONY: Ensure any new elements (clothing, background, hair, or accessories) blend seamlessly with the original image's lighting, shadow angles, and real photographic camera grain.
4. ZERO ARTIFICIAL ARTIFACTS: Absolutely NO doll-face conversion, NO cartoon filter, NO 3D rendering, NO plastic smoothing. Maintain authentic camera snapshot quality.`;
}

/**
 * Translates Indonesian concepts and ground the prompt into true optical photography parameters.
 */
export function translateAndEnrichPrompt(rawPrompt: string): EnrichedPromptResult {
  let translated = cleanBuzzwords(rawPrompt);
  
  // Apply bilingual translation mappings
  for (const [regex, replacement] of INDONESIAN_TO_ENGLISH_MAP) {
    translated = translated.replace(regex, replacement);
  }

  const p = rawPrompt.toLowerCase();
  
  const isHuman = (
    p.includes('wajah') || p.includes('manusia') || p.includes('orang') || 
    p.includes('wanita') || p.includes('pria') || p.includes('gadis') || 
    p.includes('cowok') || p.includes('cewek') || p.includes('hijab') || 
    p.includes('kerudung') || p.includes('jilbab') || p.includes('human') || 
    p.includes('person') || p.includes('woman') || p.includes('man') || 
    p.includes('girl') || p.includes('portrait') || p.includes('foto') ||
    p.includes('pakaian') || p.includes('baju') || p.includes('seragam') ||
    p.includes('boneka') || p.includes('bonekah') || p.includes('manekin') ||
    p.includes('real dunia') || p.includes('beground')
  );

  const isWildlife = (
    p.includes('kucing') || p.includes('anjing') || p.includes('hewan') || 
    p.includes('burung') || p.includes('harimau') || p.includes('singa') ||
    p.includes('animal') || p.includes('wildlife')
  );

  const isScenery = (
    p.includes('pemandangan') || p.includes('gunung') || p.includes('pantai') || 
    p.includes('laut') || p.includes('hutan') || p.includes('kota') || 
    p.includes('landscape') || p.includes('nature')
  );

  let enrichedPrompt = '';
  // Strong negative prompt to kill the "doll" look
  let negativePrompt = '3d render, cgi, anime, cartoon, illustration, drawing, painting, doll face, plastic skin, porcelain skin, smooth skin, airbrush, beauty filter, makeup filter, mannequin, bad eyes, artificial eyes, unnatural gaze, glossy face, wax figure, oversaturated, blurry, watermark, deformed, plastic, fake, artificial';
  
  let subjectType: EnrichedPromptResult['subjectType'] = 'general';
  let decomp: RealComponentDecomposition | undefined;

  if (isHuman) {
    subjectType = 'portrait';
    decomp = decomposeRealWorldComponents(rawPrompt);
    // Focus on ultra-realistic, highly elegant, professional cinematic photography.
    enrichedPrompt = `Breathtaking ultra-realistic cinematic portrait photography of ${translated}. [COMPOSITE COMPONENTS: Face: ${decomp.face}. Wardrobe: ${decomp.apparel}. Posture: ${decomp.handsAndPose}. Setting: ${decomp.environment}. Camera: ${decomp.opticalSetup}]. 100% genuine real human, stunningly elegant, masterpiece, Vogue magazine editorial, highly detailed photorealistic skin texture, dramatic soft lighting, award-winning photography.`;
    negativePrompt = '3d render, cgi, anime, cartoon, illustration, drawing, painting, doll face, plastic skin, porcelain skin, smooth skin, airbrush, beauty filter, makeup filter, mannequin, artificial eyes, glossy face, wax figure, deformed, cartoonish, fake smile, highly retouched, plastic, uncanny valley, fake, bad anatomy';
  } else if (isWildlife) {
    subjectType = 'wildlife';
    enrichedPrompt = `Breathtaking National Geographic award-winning wildlife photography of ${translated}. Real animal anatomy, highly detailed fur/feathers, authentic eye reflection, cinematic natural lighting. Shot on telephoto lens, crisp optical focus, stunning depth of field. Strictly no cgi, no 3d render, no cartoon, no toy.`;
    negativePrompt = 'cgi, 3d render, stuffed animal, toy, cartoon, illustration, oversaturated, plastic fur, fake';
  } else if (isScenery) {
    subjectType = 'landscape';
    enrichedPrompt = `Breathtaking cinematic landscape photograph of ${translated}. Stunning atmospheric lighting, highly detailed geographical terrain, gorgeous weather and sky. Shot on 24mm wide angle lens, razor-sharp optical clarity, masterpiece. Strictly no cgi, no fantasy painting, no 3d render.`;
    negativePrompt = 'cgi, 3d render, fantasy painting, cartoon, digital art, oversaturated neon, fake clouds, artificial';
  } else {
    enrichedPrompt = `Breathtaking ultra-realistic authentic photograph of ${translated}. True-to-life surface textures, physical shadows, gorgeous cinematic lighting, shot on full-frame Hasselblad camera with 50mm lens, masterpiece photography. Strictly no 3d render, no cgi, no cartoon.`;
  }

  return {
    prompt: enrichedPrompt.replace(/\s+/g, ' ').trim(),
    negativePrompt,
    subjectType,
    decomposition: decomp
  };
}

/**
 * Builds an authentic, uncompressed photographic URL utilizing flux with strict negative doll/plastic filters.
 */
export function buildPollinationsRealismUrl(prompt: string, aspectRatio?: string, customSeed?: number): string {
  const photoreal = translateAndEnrichPrompt(prompt || 'Authentic candid human photograph');
  const width = aspectRatio === "16:9" ? 1280 : aspectRatio === "9:16" ? 720 : aspectRatio === "4:3" ? 1024 : aspectRatio === "3:4" ? 768 : 1024;
  const height = aspectRatio === "16:9" ? 720 : aspectRatio === "9:16" ? 1280 : aspectRatio === "4:3" ? 768 : aspectRatio === "3:4" ? 1024 : 1024;
  
  // Random seed for varied results
  const seed = customSeed || Math.floor(Math.random() * 9999999);
  
  // Inject the negative prompt directly into the string so the engine strictly avoids the "doll" look
  const finalPrompt = `${photoreal.prompt} | NEGATIVE: ${photoreal.negativePrompt}`;
  const encodedPrompt = encodeURIComponent(finalPrompt.substring(0, 1500));
  
  // Using model=flux for the highest quality realism on pollinations. enhance=false prevents their LLM from simplifying our detailed cinematic prompt.
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux&enhance=false`;
}

