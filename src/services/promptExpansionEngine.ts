export interface ExpandedPromptResult {
  category: string;
  subcategory: string;
  species: string;
  biologicalContext: string;
  sceneDesign: string;
  visualVariation: string;
  cameraComposition: string;
  lighting: string;
  details: string;
  negativePrompt: string;
  finalPrompt: string;
}

export function expandStockPrompt(input: string, variationIndex: number = 0): ExpandedPromptResult {
  const lowerInput = input.toLowerCase();
  
  let category = 'Organisme Hidup Lainnya';
  let subcategory = 'Lainnya';
  
  const humans = ['manusia', 'anak', 'remaja', 'dewasa', 'lansia', 'orang', 'pria', 'wanita', 'gadis', 'cowok'];
  const mammals = ['harimau', 'kucing', 'anjing', 'paus', 'gajah', 'singa', 'monyet', 'kuda', 'sapi', 'kambing'];
  const birds = ['burung', 'elang', 'merpati', 'hantu', 'kakaktua', 'penguin', 'bebek', 'angsa'];
  const fish = ['ikan', 'hiu', 'pari', 'koi', 'cupang', 'arwana'];
  const reptiles = ['reptil', 'ular', 'buaya', 'komodo', 'kadal', 'kura'];
  const amphibians = ['amfibi', 'katak', 'kodok', 'salamander'];
  const insects = ['serangga', 'kupu', 'lebah', 'semut', 'belalang', 'kumbang'];
  const arachnids = ['arachnida', 'laba', 'kalajengking', 'tarantula'];
  const crustaceans = ['crustacea', 'kepiting', 'udang', 'lobster'];
  const molluscs = ['moluska', 'gurita', 'cumi', 'siput', 'kerang'];
  const plants = ['tumbuhan', 'pohon', 'bunga', 'rumput', 'mawar', 'melati', 'anggrek', 'kaktus', 'bambu', 'pisang', 'padi'];
  const fungi = ['jamur', 'mushroom', 'fungi', 'cendawan'];

  if (humans.some(k => lowerInput.includes(k))) category = 'Manusia';
  else if (plants.some(k => lowerInput.includes(k))) category = 'Tumbuhan';
  else if (fungi.some(k => lowerInput.includes(k))) category = 'Jamur';
  else if (mammals.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Mamalia'; }
  else if (birds.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Burung'; }
  else if (fish.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Ikan'; }
  else if (reptiles.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Reptil'; }
  else if (amphibians.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Amfibi'; }
  else if (insects.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Serangga'; }
  else if (arachnids.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Arachnida'; }
  else if (crustaceans.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Crustacea'; }
  else if (molluscs.some(k => lowerInput.includes(k))) { category = 'Hewan'; subcategory = 'Moluska'; }
  else category = 'Hewan'; // Fallback to animal if unsure, or Others

  if (category === 'Manusia') subcategory = 'Potret/Aktivitas';
  if (category === 'Tumbuhan') subcategory = lowerInput.includes('bunga') ? 'Bunga' : (lowerInput.includes('pohon') ? 'Pohon' : 'Flora Umum');
  if (category === 'Jamur') subcategory = 'Fungi';

  const species = input;
  const biologicalContext = `Accurate biological anatomy, natural characteristics of ${input}`;
  
  // Variations based on index
  const timeVariations = ['Golden hour morning light', 'Midday bright sunlight', 'Dramatic sunset lighting', 'Overcast soft diffused light', 'Nighttime with moonlight'];
  const angleVariations = ['Eye-level medium shot', 'Low-angle heroic shot', 'High-angle wide shot', 'Extreme close-up macro shot', 'Over-the-shoulder perspective'];
  const envVariations = ['Natural undisturbed habitat', 'Dense lush forest', 'Open wide savanna/field', 'Rocky terrain with moss', 'Waterfront or aquatic background'];
  const actionVariations = ['Resting peacefully', 'Looking directly at camera', 'In mid-motion/action', 'Interacting with environment', 'Displaying natural behavior'];

  const time = timeVariations[variationIndex % timeVariations.length];
  const angle = angleVariations[(variationIndex + 1) % angleVariations.length];
  const env = envVariations[(variationIndex + 2) % envVariations.length];
  const action = actionVariations[(variationIndex + 3) % actionVariations.length];

  const sceneDesign = `${action} in ${env}, ${time}`;
  const cameraComposition = `${angle}, depth of field, sharp focus on subject, blurred background, professional wildlife/nature photography framing`;
  const lighting = `Cinematic natural lighting, raytraced shadows, realistic subsurface scattering on organic surfaces`;
  const details = `8K resolution, photorealistic textures, hyper-detailed surface, true-to-life colors`;
  const negativePrompt = `cartoon, 3d render, illustration, low resolution, blurry, distorted anatomy, extra limbs, text, watermark, unnatural colors`;

  const finalPrompt = `A breathtaking photorealistic stock image of ${species}, ${biologicalContext}. ${sceneDesign}. ${cameraComposition}. ${lighting}. ${details}.`;

  return {
    category,
    subcategory,
    species,
    biologicalContext,
    sceneDesign,
    visualVariation: `Var: ${time}, ${angle}`,
    cameraComposition,
    lighting,
    details,
    negativePrompt,
    finalPrompt
  };
}
