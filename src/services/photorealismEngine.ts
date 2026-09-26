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
  subjectType: 'portrait' | 'landscape' | 'wildlife' | 'architecture' | 'product' | 'general' | 'flora' | 'microscopic' | 'multilife' | 'mythic_or_alien';
  decomposition?: RealComponentDecomposition;
}

const INDONESIAN_TO_ENGLISH_MAP: [RegExp, string][] = [
  // 1. Kingdom Plantae, Fungi & Botanical Organisms (Plants, Trees, Flowers, Fungi, Moss, Algae)
  [/\b(pohon beringin purba|pohon beringin|beringin)\b/gi, 'ancient banyan tree with aerial roots'],
  [/\b(pohon cemara|cemara)\b/gi, 'pine tree'],
  [/\b(pohon kelapa)\b/gi, 'coconut palm tree'],
  [/\b(pohon jati)\b/gi, 'teak tree'],
  [/\b(pohon baobab)\b/gi, 'baobab tree'],
  [/\b(pohon purba|pohon raksasa)\b/gi, 'ancient primordial giant tree'],
  [/\b(pohon)\b/gi, 'tree'],
  [/\b(hutan bambu|bambu)\b/gi, 'bamboo grove'],
  [/\b(bunga anggrek bulan|anggrek bulan)\b/gi, 'white moon orchid flower Phalaenopsis'],
  [/\b(bunga anggrek|anggrek)\b/gi, 'blooming orchid flower'],
  [/\b(bunga mawar merah|mawar merah)\b/gi, 'blooming red rose flower with fresh morning dew'],
  [/\b(bunga mawar|mawar)\b/gi, 'blooming rose flower'],
  [/\b(bunga teratai|teratai|lotus)\b/gi, 'blooming lotus water lily on calm pond'],
  [/\b(bunga melati|melati)\b/gi, 'fragrant jasmine flowers'],
  [/\b(bunga matahari)\b/gi, 'vibrant sunflower'],
  [/\b(bunga bangkai|rafflesia arnoldii|rafflesia)\b/gi, 'Rafflesia arnoldii giant flower'],
  [/\b(kantong semar|tanaman kantong semar)\b/gi, 'Nepenthes carnivorous pitcher plant'],
  [/\b(tanaman karnivora)\b/gi, 'carnivorous plant'],
  [/\b(bunga mekar|bunga-bunga|bunga)\b/gi, 'blooming flower'],
  [/\b(kelopak bunga|kelopak)\b/gi, 'delicate flower petals with natural texture'],
  [/\b(jamur bioluminesen|jamur bercahaya|jamur menyala)\b/gi, 'bioluminescent glowing fungi mushrooms emitting natural soft glow'],
  [/\b(jamur tiram)\b/gi, 'oyster mushrooms growing naturally'],
  [/\b(jamur kuping)\b/gi, 'wood ear fungus Auricularia'],
  [/\b(jamur amanita|jamur merah bintik putih)\b/gi, 'Amanita muscaria mushroom with red cap and white spots'],
  [/\b(jamur|fungi|cendawan)\b/gi, 'living fungi and wild mushrooms with natural gill structures'],
  [/\b(spora jamur|spora)\b/gi, 'microscopic fungal spores'],
  [/\b(lumut kerak|lumut hijau|lumut)\b/gi, 'lush green velvet moss with natural micro-texture'],
  [/\b(rumput laut|alga laut|alga|ganggang)\b/gi, 'living marine algae and seaweeds with natural flow in water'],
  [/\b(terumbu karang hidup|terumbu karang|karang laut)\b/gi, 'living coral reef ecosystem with organic polyp textures'],
  [/\b(anemon laut|anemon)\b/gi, 'living sea anemone with delicate flowing tentacles'],
  [/\b(dedaunan|daun hijau|daun)\b/gi, 'living green leaves with intricate vascular leaf venation'],
  [/\b(akar pohon|akar gantung|akar)\b/gi, 'organic tree root system'],
  [/\b(tanaman hias)\b/gi, 'ornamental living houseplant with lush leaves'],
  [/\b(tumbuhan hijau|tumbuhan|tanaman)\b/gi, 'living botanical plant with natural organic vitality'],

  // 2. Biological, Cellular & Microscopic Entities (Preserve Scientific Cytology)
  [/\b(sel darah merah|eritrosit)\b/gi, 'red blood cells'],
  [/\b(sel darah putih|leukosit)\b/gi, 'white blood cells engulfing target pathogen'],
  [/\b(sel darah)\b/gi, 'blood cells'],
  [/\b(sel saraf|neuron)\b/gi, 'neuron cells with axon and dendrites emitting synaptic signals'],
  [/\b(struktur sel|sel biologis)\b/gi, 'biological cell structure with organelles and cytoplasm'],
  [/\b(sel tumbuhan)\b/gi, 'plant cell structure with cell wall and chloroplasts'],
  [/\b(sel hewan)\b/gi, 'animal cell structure with cellular membrane and nucleus'],
  [/\b(pembelahan sel|mitosis)\b/gi, 'cellular mitosis division with chromosome separation'],
  [/\b(kloroplas)\b/gi, 'chloroplasts with chlorophyll thylakoid stacks'],
  [/\b(mitokondria)\b/gi, 'mitochondria with inner cristae folds'],
  [/\b(heliks ganda dna|rantai dna|struktur dna)\b/gi, 'DNA double helix molecular structure'],
  [/\b(bakteri|mikroba)\b/gi, 'microscopic bacteria colonies'],
  [/\b(amuba|amoeba|protozoa)\b/gi, 'amoeba single-celled protozoan with pseudopodia'],
  [/\b(paramecium)\b/gi, 'paramecium single-cell organism with cilia'],
  [/\b(plankton)\b/gi, 'microscopic ocean plankton organism'],
  [/\b(virus)\b/gi, 'microscopic viral capsid structure'],
  [/\b(mikroorganisme|jasad renik)\b/gi, 'microorganisms'],
  [/\b(di bawah mikroskop|mikroskopis|mikroskopik)\b/gi, 'under high-magnification optical microscope'],
  [/\b(mikroskop elektron)\b/gi, 'under scanning electron microscope'],
  [/\b(anatomi organ|anatomi)\b/gi, 'anatomical structure'],

  // 3. Fauna & Animal Subjects (Domestic, Farm, Wild, Marine, Aviary, Insect)
  [/\b(kucing oranye|kucing oren)\b/gi, 'orange tabby cat'],
  [/\b(kucing persia)\b/gi, 'fluffy white Persian cat'],
  [/\b(kucing anggora)\b/gi, 'Turkish Angora cat'],
  [/\b(kucing kampung|kucing domestik)\b/gi, 'domestic short-haired cat'],
  [/\b(anak kucing|kitten)\b/gi, 'little kitten'],
  [/\b(kucing)\b/gi, 'cat'],
  [/\b(anjing golden retriever)\b/gi, 'golden retriever dog'],
  [/\b(anjing husky|husky)\b/gi, 'Siberian husky dog'],
  [/\b(anak anjing|puppy)\b/gi, 'little puppy'],
  [/\b(anjing)\b/gi, 'dog'],
  [/\b(kelinci)\b/gi, 'rabbit'],
  [/\b(hamster)\b/gi, 'hamster'],
  [/\b(kuda pacu|kuda)\b/gi, 'horse with natural muscular build'],
  [/\b(sapi perah|sapi)\b/gi, 'dairy cow'],
  [/\b(kambing|domba)\b/gi, 'goat'],
  [/\b(kerbau lumpur|kerbau)\b/gi, 'water buffalo'],
  [/\b(ayam jantan|ayam jago|rooster)\b/gi, 'rooster with colorful plumage'],
  [/\b(burung merak)\b/gi, 'peacock displaying iridescent tail feathers'],
  [/\b(burung cendrawasih)\b/gi, 'bird of paradise with exotic plumage'],
  [/\b(burung hantu)\b/gi, 'owl with penetrating eyes'],
  [/\b(burung elang|elang)\b/gi, 'eagle in flight'],
  [/\b(burung merpati|merpati)\b/gi, 'pigeon bird'],
  [/\b(burung)\b/gi, 'bird'],
  [/\b(ikan mas koki|ikan koki)\b/gi, 'fancy goldfish swimming gracefully'],
  [/\b(ikan badut)\b/gi, 'clownfish among sea anemone'],
  [/\b(ikan koi)\b/gi, 'colorful Japanese koi fish'],
  [/\b(ikan hiu|hiu putih besar|hiu)\b/gi, 'great white shark'],
  [/\b(ikan)\b/gi, 'fish'],
  [/\b(lumba-lumba)\b/gi, 'dolphin leaping'],
  [/\b(paus biru|paus)\b/gi, 'whale in ocean'],
  [/\b(gurita)\b/gi, 'octopus with flexible tentacles and natural camouflage'],
  [/\b(cumi-cumi)\b/gi, 'squid'],
  [/\b(ubur-ubur)\b/gi, 'bioluminescent translucent jellyfish drifting in deep water'],
  [/\b(singa)\b/gi, 'lion with full mane'],
  [/\b(harimau sumatera)\b/gi, 'Sumatran tiger with striped coat'],
  [/\b(harimau)\b/gi, 'tiger'],
  [/\b(gajah)\b/gi, 'elephant with textured skin'],
  [/\b(serigala kutub|serigala)\b/gi, 'wolf with thick fur'],
  [/\b(beruang kutub|beruang)\b/gi, 'bear'],
  [/\b(orang utan|orangutan)\b/gi, 'orangutan with reddish hair'],
  [/\b(bunglon panther|bunglon)\b/gi, 'panther chameleon with vibrant textured skin'],
  [/\b(ular)\b/gi, 'snake with intricate scale patterns'],
  [/\b(katak pohon|katak|kodok)\b/gi, 'tree frog with moist vibrant skin'],
  [/\b(penyu laut|penyu|kura-kura)\b/gi, 'sea turtle with textured carapace shell'],
  [/\b(kupu-kupu)\b/gi, 'butterfly with patterned wings'],
  [/\b(lebah madu|lebah)\b/gi, 'honeybee gathering pollen'],
  [/\b(kunang-kunang)\b/gi, 'fireflies with warm glowing luminescence'],
  [/\b(semut)\b/gi, 'ant with chitinous exoskeleton'],
  [/\b(serangga)\b/gi, 'insect with detailed anatomy'],
  [/\b(hewan liar|satwa liar)\b/gi, 'wild animal in habitat'],
  [/\b(hewan|binatang)\b/gi, 'animal with authentic anatomy'],

  // 4. Mythological, Fictional & Extraterrestrial Life Forms
  [/\b(naga mitologi|naga)\b/gi, 'mythological dragon with detailed organic reptilian scales and wings'],
  [/\b(makhluk alien|organisme alien|alien)\b/gi, 'extraterrestrial alien living organism with complex biological anatomy'],
  [/\b(pohon ent|pohon hidup bijak|pohon berwajah)\b/gi, 'sentient ancient living tree creature with weathered bark face'],
  [/\b(makhluk mitologi|makhluk fantasi)\b/gi, 'mythical fantasy creature with believable organic anatomy'],

  // 5. Human Demographics, Roles, Professions & Expressions
  [/\b(cewek|perempuan|gadis|wanita)\s+(berhijab|hijab|jilbab|kerudung)\b/gi, 'woman wearing an elegant hijab'],
  [/\b(wanita|perempuan)\b/gi, 'woman'],
  [/\b(gadis|cewek)\b/gi, 'young woman'],
  [/\b(pria|laki-laki)\b/gi, 'man'],
  [/\b(cowok|pemuda)\b/gi, 'young man'],
  [/\b(anak kecil|bocah|anak-anak)\b/gi, 'child'],
  [/\b(bayi|balita)\b/gi, 'toddler'],
  [/\b(kakek|nenek|orang tua|lansia)\b/gi, 'elderly person with natural wise expression'],
  [/\b(manusia|orang)\b/gi, 'person'],
  [/\b(wajah|muka)\b/gi, 'face'],
  [/\b(petani)\b/gi, 'farmer in agricultural fields'],
  [/\b(nelayan)\b/gi, 'fisherman with fishing net at sea'],
  [/\b(dokter bedah)\b/gi, 'surgeon in hospital operating room in medical scrubs and mask'],
  [/\b(dokter)\b/gi, 'medical doctor in hospital'],
  [/\b(ilmuwan|peneliti)\b/gi, 'scientist in modern laboratory'],
  [/\b(astronot|astronaut)\b/gi, 'astronaut in pressurized spacesuit'],
  [/\b(koki|chef)\b/gi, 'professional chef in commercial kitchen'],
  [/\b(insinyur)\b/gi, 'engineer with hardhat helmet'],
  [/\b(penari)\b/gi, 'traditional dancer in cultural performance costume'],
  [/\b(guru)\b/gi, 'teacher in classroom'],
  [/\b(siswa|siswi|murid)\b/gi, 'student in school uniform'],

  // 6. Clothing & Attire (Preserve Contextual Wardrobe)
  [/\b(revisi pakaian|ganti pakaian|ganti baju|pakaian baru)\b/gi, 'revised clothing'],
  [/\b(pakaian|baju|busana)\b/gi, 'clothing'],
  [/\b(berhijab|hijab|jilbab|kerudung)\b/gi, 'wearing a hijab'],
  [/\b(seragam sma|seragam putih abu-abu)\b/gi, 'Indonesian high school uniform'],
  [/\b(seragam sekolah|baju sekolah)\b/gi, 'school uniform'],
  [/\b(kemeja)\b/gi, 'button-up shirt'],
  [/\b(kaos|t-shirt)\b/gi, 't-shirt'],
  [/\b(jaket|hoodie)\b/gi, 'jacket'],
  [/\b(batik tulis|kain batik|batik)\b/gi, 'traditional Indonesian batik with intricate patterns'],
  [/\b(jas lab|jas laboratorium)\b/gi, 'white laboratory coat'],
  [/\b(pakaian luar angkasa|baju luar angkasa)\b/gi, 'detailed spacesuit'],
  [/\b(celana jeans|jeans)\b/gi, 'denim jeans'],
  [/\b(celana)\b/gi, 'pants'],

  // 7. Actions & Living Poses
  [/\b(duduk di meja)\b/gi, 'sitting at a table'],
  [/\b(duduk di kursi)\b/gi, 'sitting on a chair'],
  [/\b(tidur di sofa|tertidur di sofa)\b/gi, 'sleeping cozily on a sofa'],
  [/\b(tidur di atas laptop|tertidur di laptop)\b/gi, 'sleeping peacefully on top of a laptop'],
  [/\b(tidur|tertidur)\b/gi, 'sleeping peacefully'],
  [/\b(membajak sawah)\b/gi, 'plowing rice fields'],
  [/\b(memeluk)\b/gi, 'hugging affectionately'],
  [/\b(membelai)\b/gi, 'gentle petting'],
  [/\b(berdiri)\b/gi, 'standing naturally'],
  [/\b(tersenyum)\b/gi, 'smiling gently'],
  [/\b(tertawa)\b/gi, 'laughing naturally'],
  [/\b(belajar|membaca buku)\b/gi, 'reading a book'],
  [/\b(terbang)\b/gi, 'flying through air'],
  [/\b(berenang)\b/gi, 'swimming smoothly'],
  [/\b(berlari)\b/gi, 'running dynamically'],
  [/\b(berkamuflase)\b/gi, 'camouflaging with environment'],

  // 8. Environments & Habitats
  [/\b(di ruang keluarga|ruang tamu)\b/gi, 'in a cozy living room'],
  [/\b(di kamar tidur|di kamar)\b/gi, 'in a bedroom'],
  [/\b(di dalam akuarium|akuarium)\b/gi, 'inside a crystal clear water glass aquarium'],
  [/\b(di sawah terasering|di sawah)\b/gi, 'in lush green stepped terrace rice fields'],
  [/\b(di kelas|ruang kelas)\b/gi, 'in a classroom'],
  [/\b(di laboratorium|di lab)\b/gi, 'in a science research laboratory'],
  [/\b(di ruang operasi)\b/gi, 'in a sterile surgical hospital operating theater with overhead lights'],
  [/\b(di stasiun luar angkasa)\b/gi, 'inside a space station with Earth visible through window'],
  [/\b(di kantor)\b/gi, 'in an office'],
  [/\b(di cafe|di kafe)\b/gi, 'in a cafe'],
  [/\b(di perpustakaan)\b/gi, 'in a library'],
  [/\b(di jalan|di trotoar)\b/gi, 'on a street'],
  [/\b(di pantai)\b/gi, 'at a beach with ocean waves'],
  [/\b(di taman bunga|taman bunga)\b/gi, 'in a vibrant botanical flower garden'],
  [/\b(di taman)\b/gi, 'in a garden park'],
  [/\b(di hutan hujan tropis|hutan hujan)\b/gi, 'in a tropical rainforest canopy'],
  [/\b(di hutan berkabut|hutan berkabut)\b/gi, 'in a misty atmospheric forest'],
  [/\b(di hutan)\b/gi, 'in a natural forest'],
  [/\b(di bawah laut|di kedalaman laut|di samudra)\b/gi, 'underwater in the deep ocean with sunlight rays'],
  [/\b(di laut)\b/gi, 'in the sea'],
  [/\b(di rumah)\b/gi, 'at home'],
  [/\b(di kutub|di salju)\b/gi, 'in the snowy arctic landscape'],
  [/\b(di sabana|savana)\b/gi, 'in the African savanna grasslands'],

  // 9. Lighting & Realism Descriptors
  [/\b(secara real dunia|real dunia|dunia nyata|asli|nyata|realistis)\b/gi, 'realistic'],
  [/\b(senja|sore hari)\b/gi, 'during golden hour sunset'],
  [/\b(pagi hari)\b/gi, 'in fresh morning daylight'],
  [/\b(malam hari|malam)\b/gi, 'at night under soft moonlight']
];

/**
 * Clean redundant diffusion buzzwords without deleting user-intended art styles
 * (e.g., keep anime, cartoon, illustration, 3D model, CGI if requested).
 */
export function cleanBuzzwords(text: string): string {
  return text
    .replace(/\b(photorealistic|hyperrealistic|ultra realistic|super detailed|hyper detailed|8k resolution|octane render|unreal engine 5|unreal engine|perfect skin|flawless skin|porcelain skin|doll face|wax doll|mannequin)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decomposes real-world human/living being components from user query
 * to construct a multi-element photographic composite with complete background and authentic wardrobe.
 */
export function decomposeRealWorldComponents(cleanPrompt: string): RealComponentDecomposition {
  const p = cleanPrompt.toLowerCase();
  
  let face = "highly detailed living face with natural expression and authentic lighting";
  let apparel = "contextual clothing with natural fabric texture";
  let handsAndPose = "natural posture and anatomically accurate proportions";
  let environment = "real-world environment with natural ambient lighting and authentic spatial depth";
  let opticalSetup = "shot with professional optical lens, realistic focal depth, natural lighting";

  if (p.includes('hijab') || p.includes('kerudung') || p.includes('jilbab')) {
    apparel = "natural hijab with authentic fabric drape and realistic texture";
  } else if (p.includes('jas lab') || p.includes('laboratorium')) {
    apparel = "white laboratory coat with realistic textile drape";
  } else if (p.includes('astronot') || p.includes('astronaut')) {
    apparel = "detailed spacesuit with authentic utility fixtures";
  } else if (p.includes('batik')) {
    apparel = "traditional batik attire with intricate textile pattern";
  }

  if (p.includes('kelas') || p.includes('sekolah')) {
    environment = "well-lit classroom environment with desks and natural window light";
  } else if (p.includes('lab') || p.includes('laboratorium')) {
    environment = "scientific research laboratory with equipment and clean lighting";
  } else if (p.includes('hutan')) {
    environment = "natural forest environment with organic vegetation and atmospheric lighting";
  } else if (p.includes('laut') || p.includes('samudra')) {
    environment = "underwater marine environment with ambient ocean light";
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
 * Translates Indonesian concepts faithfully and conditions prompts to preserve
 * true biological morphology, animal anatomy, plant biology, microscopic cytology,
 * human characteristics, and requested artistic styles without distortion or quality loss.
 */
export function translateAndEnrichPrompt(rawPrompt: string): EnrichedPromptResult {
  let translated = cleanBuzzwords(rawPrompt);
  
  // Apply bilingual translation mappings faithfully
  for (const [regex, replacement] of INDONESIAN_TO_ENGLISH_MAP) {
    translated = translated.replace(regex, replacement);
  }

  const p = rawPrompt.toLowerCase();

  // 1. Detect requested artistic / non-photographic style
  const isArtisticStyle = /\b(anime|kartun|cartoon|animasi|animation|ilustrasi|illustration|lukisan|painting|drawing|sketch|sketsa|3d render|3d model|cgi|disney|pixar|chibi|vektor|vector|diagram|infografis|watercolor|cat air|oil painting|pixel art)\b/i.test(rawPrompt);

  // 2. Detect Biological, Cellular & Microscopic Entities
  const hasMicroscopic = /\b(sel|darah|eritrosit|leukosit|bakteri|virus|dna|rna|kloroplas|mitokondria|neuron|saraf|mikroskop|mikroskopis|mikroskopik|mikroorganisme|jasad renik|jaringan seluler|organel|embrio|cell|bacteria|microscopic|chloroplast|cellular|mitosis|amuba|amoeba|protozoa|paramecium|plankton)\b/i.test(rawPrompt);

  // 3. Detect Flora, Fungi, Plants, Trees, Flowers, Corals
  const hasFlora = /\b(pohon|tanaman|tumbuhan|bunga|anggrek|mawar|melati|teratai|lotus|matahari|rafflesia|kantong semar|jamur|fungi|cendawan|lumut|alga|ganggang|terumbu karang|karang laut|anemon|daun|dedaunan|akar|spora|flora|plant|flower|tree|mushroom|fungus|moss|coral|seaweed|algae)\b/i.test(rawPrompt);

  // 4. Detect Animals, Wildlife, Marine Life, Pets, Insects
  const hasFauna = /\b(kucing|anjing|hewan|binatang|satwa|fauna|burung|elang|ikan|hiu|singa|harimau|gajah|kuda|sapi|kambing|domba|kerbau|kelinci|hamster|ayam|bebek|merak|cendrawasih|burung hantu|merpati|serigala|beruang|orangutan|orang utan|bunglon|chameleon|ular|katak|kodok|kura-kura|penyu|lumba-lumba|paus|gurita|cumi-cumi|ubur-ubur|kepiting|lobster|kupu-kupu|lebah|kunang-kunang|semut|serangga|animal|wildlife|mammal|bird|fish|insect|tiger|lion|cat|dog|shark|whale|dolphin)\b/i.test(rawPrompt);

  // 5. Detect Human Subjects
  const hasHuman = /\b(manusia|orang|person|people|human|wajah|pria|wanita|laki-laki|perempuan|cowok|cewek|gadis|pemuda|anak|bocah|bayi|kakek|nenek|lansia|dokter|guru|petani|nelayan|astronot|astronaut|ilmuwan|peneliti|koki|chef|penari|atlet|siswa|siswi|murid|model|portrait|potret)\b/i.test(rawPrompt);

  // 6. Detect Mythic or Extraterrestrial Life
  const hasMythicOrAlien = /\b(naga|alien|makhluk alien|extraterrestrial|pohon ent|ent|makhluk mitologi|makhluk fantasi|dragon|creature)\b/i.test(rawPrompt);

  // 7. Detect Scenery & Landscape
  const isScenery = !hasMicroscopic && !hasFlora && !hasFauna && !hasHuman && !hasMythicOrAlien && /\b(pemandangan|gunung|pantai|laut|samudra|hutan|kota|landscape|nature|scenery|skyline|sunset|sunrise)\b/i.test(rawPrompt);

  // Determine whether this prompt involves multi-kingdom co-existence (e.g., human + animal, human + plant, animal + flora)
  const isMultiLife = (hasHuman && (hasFauna || hasFlora)) || (hasFauna && hasFlora);

  // Check if fauna is in a domestic/indoor environment
  const isDomesticOrIndoor = /\b(kamar|rumah|sofa|meja|laptop|kasur|kandang|akuarium|ruang tamu|dapur|halaman|taman kota|living room|bedroom|indoor|aquarium|cage|home|domestic|pet)\b/i.test(rawPrompt);

  let enrichedPrompt = '';
  let negativePrompt = '';
  let subjectType: EnrichedPromptResult['subjectType'] = 'general';
  let decomp: RealComponentDecomposition | undefined;

  // A. MULTI-LIFE INTERACTION (Human + Animal, Human + Flora, Fauna + Flora)
  if (isMultiLife) {
    subjectType = 'multilife';
    if (hasHuman) {
      decomp = decomposeRealWorldComponents(rawPrompt);
    }
    if (isArtisticStyle) {
      enrichedPrompt = `${translated}, harmonious artistic composition, anatomically accurate biological morphology, expressive natural interaction, clean outlines, high quality craftsmanship`;
      negativePrompt = 'deformed anatomy, disfigured limbs, extra fingers, mutated bodies, low quality, blurry, artifacts';
    } else {
      enrichedPrompt = `Authentic natural photograph of ${translated}, harmonious interaction between living subjects, anatomically accurate human posture and animal/plant morphology, realistic textures (natural skin tones, fur, feathers, botanical leaves, textiles), authentic ambient lighting, true-to-life depth of field`;
      negativePrompt = 'plastic skin, doll face, deformed hands, extra fingers, taxidermy, unnatural eyes, mutated limbs, blurry, low resolution, artifacts';
    }
  }
  // B. BIOLOGICAL, CELLULAR & MICROSCOPIC
  else if (hasMicroscopic) {
    subjectType = 'microscopic';
    if (isArtisticStyle) {
      enrichedPrompt = `Accurate scientific illustration of ${translated}, clear biological structures, accurate cytological anatomy, educational clarity`;
      negativePrompt = 'distorted morphology, incorrect anatomy, blurry, low resolution, artifacts';
    } else {
      enrichedPrompt = `Accurate scientific visualization of ${translated}, precise biological cytology, realistic cellular structures and organelles, authentic scientific microscopy lighting, pristine optical clarity`;
      negativePrompt = 'distorted morphology, incorrect cellular structures, blurry, low resolution, artifacts, clothing, human face, macro human skin';
    }
  }
  // C. FLORA, FUNGI & BOTANICAL LIFE
  else if (hasFlora) {
    subjectType = 'flora';
    if (isArtisticStyle) {
      enrichedPrompt = `${translated}, botanical artwork, accurate plant and floral morphology, rich vibrant colors, harmonious artistic composition`;
      negativePrompt = 'wilted, dead leaves, low quality, deformed, blurry, artifacts';
    } else {
      enrichedPrompt = `Authentic botanical photograph of ${translated}, accurate botanical and fungal morphology, natural leaf venation and organic cellular textures, healthy organic vitality, natural atmospheric sunlight, crisp optical focus`;
      negativePrompt = 'plastic artificial flowers, fake plant, wilting, dead leaves, low quality, blurry, artifacts, human face';
    }
  }
  // D. FAUNA & ANIMAL KINGDOM
  else if (hasFauna) {
    subjectType = 'wildlife';
    if (isArtisticStyle) {
      enrichedPrompt = `${translated}, expressive artistic representation, natural creature anatomy, vibrant clean composition`;
      negativePrompt = 'low quality, poorly drawn, deformed limbs, extra legs, blurry, distorted anatomy';
    } else if (isDomesticOrIndoor) {
      // Domestic / indoor pet: DO NOT force "wildlife photography in natural habitat"
      enrichedPrompt = `Authentic natural photograph of ${translated}, accurate species morphology, natural living animal features, realistic fur/scale/feather texture, natural expressive eyes, cozy authentic ambient lighting, crisp optical focus`;
      negativePrompt = 'taxidermy, plastic toy, stuffed animal, mutant, extra limbs, deformed anatomy, unnatural eyes, clothing on animals, cgi artifacts, blurry';
    } else {
      // Wild animal in nature
      enrichedPrompt = `Authentic wildlife photography of ${translated}, accurate species morphology, natural living animal features, realistic eye reflections, natural habitat, authentic ambient lighting, crisp optical focus`;
      negativePrompt = 'taxidermy, plastic toy, stuffed animal, mutant, extra limbs, deformed anatomy, unnatural eyes, clothing on wild animals, cgi artifacts, blurry';
    }
  }
  // E. HUMAN SUBJECTS
  else if (hasHuman) {
    subjectType = 'portrait';
    decomp = decomposeRealWorldComponents(rawPrompt);
    if (isArtisticStyle) {
      enrichedPrompt = `${translated}, beautifully crafted artwork, expressive features, accurate anatomy, clean composition`;
      negativePrompt = 'low quality, deformed hands, extra fingers, bad anatomy, blurry, distorted face';
    } else {
      // Authentic human photography without forcing casual smartphone 24mm snapshot on specialized professions
      enrichedPrompt = `Authentic natural photograph of ${translated}, natural human anatomy and proportions, genuine facial expression, realistic skin texture and natural tones, accurate posture and attire matching context, natural ambient lighting, professional optical depth`;
      negativePrompt = 'plastic skin, doll face, porcelain skin, artificial mannequin, wax figure, extra fingers, deformed hands, bad anatomy, unnatural gaze, airbrushed, blurry';
    }
  }
  // F. MYTHICAL & EXTRATERRESTRIAL CREATURES
  else if (hasMythicOrAlien) {
    subjectType = 'mythic_or_alien';
    if (isArtisticStyle) {
      enrichedPrompt = `${translated}, imaginative conceptual art, intricate creature anatomy, epic lighting and atmosphere`;
      negativePrompt = 'low quality, chaotic mess, deformed, blurry, artifacts';
    } else {
      enrichedPrompt = `Believable organic visualization of ${translated}, intricate living creature biology, realistic skin, scales, or bioluminescent textures, coherent anatomical structure, dynamic atmospheric lighting`;
      negativePrompt = 'incoherent anatomy, chaotic mutant, deformed mess, low quality, blurry, artifacts';
    }
  }
  // G. SCENERY & LANDSCAPE
  else if (isScenery) {
    subjectType = 'landscape';
    if (isArtisticStyle) {
      enrichedPrompt = `${translated}, beautiful landscape art, scenic composition, harmonious lighting`;
      negativePrompt = 'low quality, blurry, muddy colors, artifacts';
    } else {
      enrichedPrompt = `Natural landscape photograph of ${translated}, authentic geological textures, realistic weather dynamics, natural sunlight and atmospheric perspective`;
      negativePrompt = 'cgi, blurry, artificial artifacts, oversaturated neon, low quality';
    }
  }
  // H. GENERAL OBJECTS & SCENES
  else {
    subjectType = 'general';
    if (isArtisticStyle) {
      enrichedPrompt = `${translated}, high quality artistic rendering, clean composition`;
      negativePrompt = 'low quality, blurry, artifacts, deformed';
    } else {
      enrichedPrompt = `Authentic realistic photograph of ${translated}, natural surface textures, accurate optical shadows, soft natural lighting`;
      negativePrompt = 'blurry, deformed, plastic, fake, artificial, low quality, artifacts';
    }
  }

  return {
    prompt: enrichedPrompt.replace(/\s+/g, ' ').trim(),
    negativePrompt,
    subjectType,
    decomposition: decomp
  };
}

/**
 * Builds an authentic, uncompressed photographic URL utilizing flux without polluting T5 token space with negative words.
 */
export function buildPollinationsRealismUrl(prompt: string, aspectRatio?: string, customSeed?: number): string {
  const photoreal = translateAndEnrichPrompt(prompt || 'High-resolution photograph');
  const width = aspectRatio === "16:9" ? 1280 : aspectRatio === "9:16" ? 720 : aspectRatio === "4:3" ? 1024 : aspectRatio === "3:4" ? 768 : 1024;
  const height = aspectRatio === "16:9" ? 720 : aspectRatio === "9:16" ? 1280 : aspectRatio === "4:3" ? 768 : aspectRatio === "3:4" ? 1024 : 1024;
  
  // Random seed for varied results
  const seed = customSeed || Math.floor(Math.random() * 9999999);
  
  // Do NOT embed words like 'doll', 'plastic', 'mannequin' into Flux prompt string because T5 transformer encodes them as positive semantic tokens!
  const encodedPrompt = encodeURIComponent(photoreal.prompt.substring(0, 1400));
  
  // Using model=flux for the highest quality realism on pollinations. enhance=false prevents their LLM from simplifying our detailed prompt.
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux&enhance=false`;
}

