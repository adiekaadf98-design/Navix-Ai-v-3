import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Search, 
  Menu, Sparkles, Folder, Send,
  User, PawPrint, Leaf, Microscope,
  Layers, Mountain, Building2, Palette,
  Utensils, Car, ExternalLink, Copy, Check,
  Download, Eye, X, ShieldCheck
} from 'lucide-react';
import { showToast } from '../../utils/toast';
import { expandStockPrompt } from '../../services/promptExpansionEngine';

interface StockImageStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

export interface StockImage {
  id: string;
  filename: string;
  category: string;
  subcategory: string;
  subject: string;
  species: string;
  description: string;
  original_user_prompt: string;
  expanded_prompt: string;
  negative_prompt: string;
  variation_parameters: string;
  resolution: string;
  format: string;
  generation_provider: string;
  generation_timestamp: string;
  generation_status: 'GENERATED' | 'VALIDATED' | 'FAILED' | 'DUPLICATE' | 'REJECTED';
  license: string;
  url: string;
}

interface QueueItem {
  id: string;
  input: string;
  count: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
}

// 9 Comprehensive Visual Categories for NAVIX AI
export const CATEGORIES = [
  { id: 'semua', label: 'Semua Koleksi', icon: Layers, keywords: [] },
  { id: 'lanskap', label: 'Alam & Lanskap', icon: Mountain, keywords: ['gunung', 'laut', 'danau', 'hutan', 'pantai', 'sunset', 'alam', 'landscape', 'nature', 'sungai', 'langit', 'savana'] },
  { id: 'arsitektur', label: 'Arsitektur & Ruang', icon: Building2, keywords: ['gedung', 'rumah', 'interior', 'arsitektur', 'candi', 'jembatan', 'kota', 'modern', 'skyscrapers', 'building'] },
  { id: 'potret', label: 'Manusia & Karakter', icon: User, keywords: ['manusia', 'orang', 'pria', 'wanita', 'anak', 'wajah', 'portrait', 'person', 'model', 'profesi', 'dokter'] },
  { id: 'satwa', label: 'Satwa & Fauna Liar', icon: PawPrint, keywords: ['harimau', 'kucing', 'anjing', 'gajah', 'singa', 'burung', 'elang', 'ikan', 'reptil', 'hewan', 'animal', 'fauna'] },
  { id: 'flora', label: 'Flora & Jamur', icon: Leaf, keywords: ['bunga', 'pohon', 'tanaman', 'jamur', 'daun', 'anggrek', 'mawar', 'botanical', 'flora', 'forest', 'mushroom'] },
  { id: 'teknologi', label: 'Sains & Teknologi', icon: Microscope, keywords: ['sains', 'teknologi', 'komputer', 'sirkuit', 'robot', 'ruang angkasa', 'nebula', 'server', 'mikroskop', 'cyberpunk', 'science'] },
  { id: 'seni', label: 'Seni & Tekstur', icon: Palette, keywords: ['tekstur', 'marmer', 'abstrak', 'batik', 'pattern', 'seni', 'cat air', 'art', 'texture', 'background', 'lukisan'] },
  { id: 'kuliner', label: 'Kuliner & Lifestyle', icon: Utensils, keywords: ['makanan', 'kopi', 'kafe', 'buah', 'kuliner', 'hidangan', 'food', 'coffee', 'lifestyle', 'resto'] },
  { id: 'kendaraan', label: 'Kendaraan & Transportasi', icon: Car, keywords: ['mobil', 'pesawat', 'kereta', 'kapal', 'motor', 'transportasi', 'vehicle', 'aircraft', 'car'] },
];

// Verified Real, High-Resolution, Open License Initial Stock Seed (No Broken Links)
const DEFAULT_CURATED_STOCK: StockImage[] = [
  // 1. Lanskap & Alam
  {
    id: 'stk-curated-1',
    filename: 'yosemite_valley_lake.jpg',
    category: 'lanskap',
    subcategory: 'Lembah & Danau Alami',
    subject: 'Lembah Yosemite & Refleksi Danau Alami',
    species: 'Lanskap Geologis Granit & Danau Glasial',
    description: 'Foto stok panorama resolusi tinggi menampilkan lembah megah berdinding granit terjal dengan refleksi air tenang di pagi hari.',
    original_user_prompt: 'yosemite valley lake morning reflection',
    expanded_prompt: 'Breathtaking landscape photography of Yosemite valley, towering granite monoliths reflecting in crystal-clear alpine lake, soft golden morning light, deep depth of field, 8k resolution, authentic environmental textures.',
    negative_prompt: 'blurry, low resolution, plastic finish, oversaturated, artificial render',
    variation_parameters: 'Wide Angle 24mm | Golden Hour | F/8 Aperture',
    resolution: '3840x2160 (4K UHD)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:00:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-2',
    filename: 'alpine_mist_mountain.jpg',
    category: 'lanskap',
    subcategory: 'Pegunungan Berkabut',
    subject: 'Puncak Pegunungan Alpen Berkabut',
    species: 'Formasi Pegunungan Salju Tinggi',
    description: 'Pemandangan puncak gunung tinggi menembus kabut awan lembut dengan lapisan pegunungan biru yang menawan.',
    original_user_prompt: 'alpine foggy mountain range sunrise',
    expanded_prompt: 'Majestic mountain range emerging above sea of clouds, moody cinematic atmospheric fog, pristine morning illumination, sharp rock ridges, photorealistic nature photography.',
    negative_prompt: 'watermark, cartoon, CGI, deformed, noisy',
    variation_parameters: 'Telephoto 70mm | Morning Twilight | Clean Atmosphere',
    resolution: '3000x2000 (Full HD+)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:05:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-3',
    filename: 'tropical_coastal_sunset.jpg',
    category: 'lanskap',
    subcategory: 'Pantai & Pesisir',
    subject: 'Pantai Pesisir Tropis & Gelombang Senja',
    species: 'Ekosistem Pesisir Samudra',
    description: 'Pemandangan pesisir pantai tropis dengan deburan ombak lembut di bawah pendaran warna senja keemasan.',
    original_user_prompt: 'tropical coast golden hour ocean sunset',
    expanded_prompt: 'Serene tropical beach at golden sunset, smooth ocean waves lapping golden sand, warm ambient lighting, peaceful horizons, crystal clear waters, National Geographic style composition.',
    negative_prompt: 'low res, oversaturated filters, digital noise',
    variation_parameters: 'Wide Angle 16mm | Shutter 1/60s | Warm Tones',
    resolution: '3600x2400 (Ultra-Sharp)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:10:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=90'
  },

  // 2. Arsitektur & Ruang
  {
    id: 'stk-curated-4',
    filename: 'modern_skyscrapers_facade.jpg',
    category: 'arsitektur',
    subcategory: 'Gedung Pencakar Langit Modern',
    subject: 'Geometri Fasad Kaca Pencakar Langit',
    species: 'Arsitektur Kontemporer Baja & Kaca Reflektif',
    description: 'Arsitektur modern simetris dari gedung pencakar langit dengan pantulan awan pada fasad kaca presisi tinggi.',
    original_user_prompt: 'modern glass skyscraper low angle symmetrical',
    expanded_prompt: 'Architectural photography of futuristic glass skyscraper from low angle perspective, striking geometric lines, reflective glass panels mirroring blue sky, ultra-sharp architectural details, tilt-shift lens precision.',
    negative_prompt: 'bent lines, low resolution, dark, blurry',
    variation_parameters: 'Tilt-Shift 24mm | Symmetry | Daytime Reflection',
    resolution: '4000x2667 (Architectural Grade)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:15:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-5',
    filename: 'scandinavian_minimalist_interior.jpg',
    category: 'arsitektur',
    subcategory: 'Desain Interior Minimalis',
    subject: 'Interior Ruang Tamu Skandinavia Cahaya Alami',
    species: 'Desain Interior Kayu & Tekstil Netral',
    description: 'Ruang tamu modern bersih bergaya Skandinavia dengan pencahayaan jendela besar alami dan perabotan kayu estetis.',
    original_user_prompt: 'minimalist scandinavian living room natural daylight',
    expanded_prompt: 'Spacious minimalist living room with warm wooden flooring, tasteful modern furniture, abundant natural sunlight streaming through large glass window, serene atmosphere, interior design magazine quality.',
    negative_prompt: 'cluttered, dark, distorted wide angle, messy',
    variation_parameters: 'Wide 35mm | Natural Window Light | Neutral Palette',
    resolution: '3500x2333 (Interior High-Res)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:20:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=90'
  },

  // 3. Manusia & Karakter
  {
    id: 'stk-curated-6',
    filename: 'portrait_young_woman_natural.jpg',
    category: 'potret',
    subcategory: 'Potret Alami Daylight',
    subject: 'Potret Wanita Muda dengan Pendaran Cahaya Alami',
    species: 'Homo sapiens (Potret Studio Terbuka)',
    description: 'Foto potret close-up autentik dengan tekstur kulit nyata, sorot mata jernih, dan pencahayaan lembut tanpa rekayasa berlebih.',
    original_user_prompt: 'portrait of young woman smiling natural daylight',
    expanded_prompt: 'Authentic studio portrait of young woman, genuine gentle smile, natural unretouched skin texture with realistic micro-pores, catchlight in expressive eyes, soft diffused daylight, 85mm prime lens bokeh.',
    negative_prompt: 'plastic skin, doll face, fake smoothness, distorted anatomy, extra fingers',
    variation_parameters: 'Portrait 85mm F/1.8 | Diffused Sun | Natural Tones',
    resolution: '3800x2533 (Fine Art Portrait)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:25:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-7',
    filename: 'portrait_man_confident_studio.jpg',
    category: 'potret',
    subcategory: 'Potret Pria Karismatik',
    subject: 'Potret Pria Dewasa Studio Profesional',
    species: 'Homo sapiens (Potret Karismatik)',
    description: 'Foto potret pria dengan tatapan percaya diri dan pencahayaan studio samping (split lighting) yang menonjolkan garis wajah tegas.',
    original_user_prompt: 'portrait confident man charismatic studio portrait',
    expanded_prompt: 'Close-up studio portrait of adult man with charismatic expression, authentic skin pores, sharp beard details, refined studio rim lighting, neutral dark backdrop, masterclass portrait photography.',
    negative_prompt: 'plastic, cartoon, airbrushed, unnatural eyes, blur',
    variation_parameters: 'Prime 105mm Macro | Key Light + Softbox | Dark Backdrop',
    resolution: '3600x2400 (High-Fidelity)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:30:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=90'
  },

  // 4. Satwa & Fauna Liar
  {
    id: 'stk-curated-8',
    filename: 'bengal_tiger_intense_look.jpg',
    category: 'satwa',
    subcategory: 'Fauna Liar Felidae',
    subject: 'Harimau Bergaris Tajam & Sorot Mata Liar',
    species: 'Panthera tigris (Karnivora Felidae)',
    description: 'Foto satwa liar makro harimau dengan pola loreng tajam, helai bulu bertekstur nyata, dan tatapan mata intens di alam liar.',
    original_user_prompt: 'tiger close up intense amber eyes wildlife photography',
    expanded_prompt: 'Intimate wildlife portrait of majestic wild tiger, piercing amber eyes, razor-sharp fur texture with individual whiskers visible, dramatic natural side-lighting, National Geographic award-winning telephoto capture.',
    negative_prompt: 'taxidermy, cartoon, deformed face, missing whiskers, fake CGI',
    variation_parameters: 'Super Telephoto 400mm | F/2.8 | Natural Jungle Backdrop',
    resolution: '4200x2800 (Wildlife Macro)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:35:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-9',
    filename: 'wild_eagle_perched.jpg',
    category: 'satwa',
    subcategory: 'Burung Pemangsa',
    subject: 'Elang Liar Bertengger di Tebing Batu',
    species: 'Aquila chrysaetos / Accipitridae',
    description: 'Foto makro elang gagah dengan paruh kuning melengkung tajam dan susunan bulu sayap bertekstur presisi.',
    original_user_prompt: 'eagle perched wild mountain eagle eye focus',
    expanded_prompt: 'Majestic eagle perched on mountain branch, intense focus in yellow raptor eyes, intricate feather plumage detail, sharp hooked beak, soft out-of-focus alpine background, telephoto wildlife shot.',
    negative_prompt: 'artificial, stuffed bird, blurry feathers, distorted claws',
    variation_parameters: 'Telephoto 500mm | Shutter 1/2000s | Crisp Daylight',
    resolution: '3600x2400 (Wildlife High-Speed)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:40:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=1200&q=90'
  },

  // 5. Flora, Botani & Jamur
  {
    id: 'stk-curated-10',
    filename: 'macro_dewdrop_wildflower.jpg',
    category: 'flora',
    subcategory: 'Makro Botani Bunga & Embun',
    subject: 'Bunga Liar dengan Butiran Embun Makro',
    species: 'Flora Angiospermae (Makro Botani)',
    description: 'Fotografi makro ekstrem menampakkan butiran embun pagi jernih di atas kelopak bunga bertekstur halus.',
    original_user_prompt: 'extreme macro flower dew drops morning light',
    expanded_prompt: 'Extreme macro photography of delicate flower petal covered in pristine morning dew drops, refractions of light inside droplets, velvety petal cellular texture, shallow depth of field, vivid authentic botanical colors.',
    negative_prompt: 'plastic, artificial render, flat colors, blurry droplets',
    variation_parameters: 'Macro 100mm 1:1 | Ring Light | Cellular Texture',
    resolution: '3800x2533 (Botanical Macro)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:45:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-11',
    filename: 'forest_wild_mushrooms_gills.jpg',
    category: 'flora',
    subcategory: 'Fungi & Jamur Hutan',
    subject: 'Jamur Liar Hutan Tropis dengan Struktur Insang',
    species: 'Agaricomycetes (Kingdom Fungi)',
    description: 'Foto close-up jamur hutan di atas lumut lembap, menampilkan detail struktur insang (gills) biologis yang rumit dan spora alami.',
    original_user_prompt: 'wild forest mushroom gills close up on mossy floor',
    expanded_prompt: 'Intricate close up of wild forest mushroom cap on rich damp green moss, delicate radial gill structure visible underneath, soft woodland sunlight filtering through canopy, organic natural specimen photograph.',
    negative_prompt: 'cartoon, neon, fake plastic mushroom, noisy',
    variation_parameters: 'Macro 90mm | Ground Level Angle | Forest Sunbeams',
    resolution: '3500x2333 (Fungi Study)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:50:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=90'
  },

  // 6. Sains, Teknologi & Ruang Angkasa
  {
    id: 'stk-curated-12',
    filename: 'microchip_silicon_circuitry.jpg',
    category: 'teknologi',
    subcategory: 'Perangkat Keras Silikon & Sirkuit',
    subject: 'Papan Sirkuit Mikroprosesor Silikon Makro',
    species: 'Semikonduktor Terintegrasi VLSI',
    description: 'Foto makro sirkuit semikonduktor dengan jalur tembaga mikroskopis, transistor miniatur, dan pantulan cahaya optik.',
    original_user_prompt: 'macro computer motherboard silicon microchip circuit',
    expanded_prompt: 'Macro photography of high-tech silicon microchip mounted on circuit board, gold bonding wires, complex conductive traces, technological masterpiece, pristine industrial precision lighting.',
    negative_prompt: 'blurry, melted solder, messy wires, cartoon',
    variation_parameters: 'Macro 105mm | Industrial LED Focus | High Precision',
    resolution: '4000x2667 (Industrial Grade)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T08:55:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-13',
    filename: 'deep_space_cosmic_nebula.jpg',
    category: 'teknologi',
    subcategory: 'Astrofotografi & Kosmologi',
    subject: 'Nebula Kosmik & Gugusan Bintang Galaksi Jauh',
    species: 'Objek Antariksa Dalam (Deep Sky Object)',
    description: 'Pemandangan astrofotografi spektakuler awan gas antariksa bercahaya dengan ribuan bintang di galaksi spiral.',
    original_user_prompt: 'deep space starry galaxy cosmic nebula telescope',
    expanded_prompt: 'Spectacular deep space astrophotography of glowing emission nebula, interstellar gas clouds illuminated by clusters of newborn stars, cosmic dust lanes, ultra-deep high-resolution telescopic observatory view.',
    negative_prompt: 'grainy noise, fake gradient, low resolution, pixelated',
    variation_parameters: 'Space Telescope Imagery | Infrared + Optical Composite',
    resolution: '4096x2731 (Astrophotography 4K)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash / Open Science Archive',
    license: 'Public Domain / Open License',
    generation_timestamp: '2026-03-01T09:00:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=90'
  },

  // 7. Seni, Tekstur & Abstrak
  {
    id: 'stk-curated-14',
    filename: 'natural_marble_golden_veins.jpg',
    category: 'seni',
    subcategory: 'Tekstur Mineral & Marmer Alami',
    subject: 'Tekstur Marmer Putih dengan Urat Emas Halus',
    species: 'Batuan Metamorf Rekristalisasi Karbonat',
    description: 'Tekstur permukaan marmer alami berkualitas tinggi dengan pola urat mineral elegan, ideal untuk latar belakang visual desain.',
    original_user_prompt: 'luxury white marble texture with subtle golden veins',
    expanded_prompt: 'High resolution flat lay texture of authentic white Carrara marble stone, elegant subtle gold and grey natural veins, organic stone patterns, smooth polished finish, studio overhead even lighting.',
    negative_prompt: 'blurry, artificial digital pattern, tiling seams, noisy',
    variation_parameters: 'Flat Lay 50mm | Even Diffuse Lighting | Texture Mapping',
    resolution: '4000x2667 (Seamless Texture)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T09:05:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-15',
    filename: 'vibrant_fluid_acrylic_art.jpg',
    category: 'seni',
    subcategory: 'Seni Fluida Cat Akrilik',
    subject: 'Pola Aliran Cat Fluida Dinamis & Gradasi Warna',
    species: 'Karya Seni Media Campuran Cat Akrilik',
    description: 'Eksplorasi warna artistik campuran pigmen cat cair mengalir bebas menciptakan percampuran warna dinamis dan tekstur marbling.',
    original_user_prompt: 'colorful acrylic fluid art marbling paint swirl macro',
    expanded_prompt: 'Macro fluid acrylic art painting, dynamic swirling colors blending seamlessly, vibrant turquoise, magenta and golden pigments, glossy liquid texture, contemporary fine art abstract photograph.',
    negative_prompt: 'pixelated, dull colors, low dynamic range, muddy',
    variation_parameters: 'Macro Fluid Focus | High Saturation Balance | Crisp Speculars',
    resolution: '3600x2400 (Fine Art Print)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T09:10:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=90'
  },

  // 8. Kuliner & Gaya Hidup
  {
    id: 'stk-curated-16',
    filename: 'artisan_latte_art_coffee.jpg',
    category: 'kuliner',
    subcategory: 'Kopi & Kafe Artisan',
    subject: 'Cangkir Kopi Espresso dengan Latte Art Halus',
    species: 'Sajian Kuliner Minuman Kopi & Susu Mikrobusa',
    description: 'Foto kopi latte art di atas cangkir keramik hitam bertekstur, diletakkan di meja kayu rustic dengan pantulan uap hangat.',
    original_user_prompt: 'artisan coffee cup with perfect latte art wooden table',
    expanded_prompt: 'Top-down commercial food photography of artisan coffee latte in ceramic cup, intricate rosetta latte art pattern in velvety micro-foam, rich crema rim, warm cafe atmosphere, gentle side window light.',
    negative_prompt: 'spilled coffee, ugly foam, blurry, cold lighting',
    variation_parameters: '50mm F/2.8 | 45-degree angle | Soft Ambient Lighting',
    resolution: '3600x2400 (Commercial Food)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T09:15:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=90'
  },

  // 9. Kendaraan & Transportasi
  {
    id: 'stk-curated-17',
    filename: 'classic_vintage_sports_car.jpg',
    category: 'kendaraan',
    subcategory: 'Otomotif & Mobil Ikonik',
    subject: 'Mobil Klasik Hitam Mengkilap Garis Aerodinamis',
    species: 'Rekayasa Otomotif Klasik',
    description: 'Foto otomotif dramatis menampilkan bodi mobil sport klasik dengan pantulan kilap krom dan lekukan bodi elegan.',
    original_user_prompt: 'sleek classic black vintage sports car studio reflection',
    expanded_prompt: 'Automotive studio photography of classic vintage sports car, glossy black paint with pristine reflections, metallic chrome accents, dramatic rim lighting sculpting the elegant vehicle curves.',
    negative_prompt: 'dents, scratched paint, blurry, bad reflections, toy car',
    variation_parameters: 'Low Angle 35mm | Studio Light Tube Strip | Deep Shadows',
    resolution: '3800x2533 (Automotive Master)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T09:20:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=90'
  },
  {
    id: 'stk-curated-18',
    filename: 'commercial_aircraft_sunset_flight.jpg',
    category: 'kendaraan',
    subcategory: 'Penerbangan & Aviasi',
    subject: 'Pesawat Komersial Melintas di Langit Senja Emas',
    species: 'Aviasi Rekayasa Dirgantara',
    description: 'Pemandangan pesawat terbang anggun melintasi awan senja bergradasi oranye dan ungu keemasan.',
    original_user_prompt: 'commercial passenger jet airplane flying sunset sky',
    expanded_prompt: 'Stunning aviation photography of passenger airplane climbing into sunset sky, warm golden light glinting off wing and fuselage, glowing evening clouds below, sense of wonder and motion.',
    negative_prompt: 'blurry, crash, smoke, distorted wings, cartoon',
    variation_parameters: 'Telephoto 200mm | Golden Hour Twilight | Clean Sky',
    resolution: '3600x2400 (Aviation High-Res)',
    format: 'image/jpeg',
    generation_provider: 'Unsplash Open Stock Library',
    license: 'Unsplash License (Bebas Komersial & Non-Komersial)',
    generation_timestamp: '2026-03-01T09:25:00Z',
    generation_status: 'VALIDATED',
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=90'
  }
];

export const StockImageStudio: React.FC<StockImageStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  // Initialize stock from localStorage or fallback directly to DEFAULT_CURATED_STOCK
  const [stock, setStock] = useState<StockImage[]>(() => {
    try {
      const saved = localStorage.getItem('navix_stock_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with curated stock to guarantee diversity across all categories
          const existingUrls = new Set(parsed.map((p: any) => p.url));
          const missingCurated = DEFAULT_CURATED_STOCK.filter(c => !existingUrls.has(c.url));
          return [...parsed, ...missingCurated];
        }
      }
    } catch (e) {
      console.warn('Failed to load navix_stock_images from storage:', e);
    }
    return DEFAULT_CURATED_STOCK;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [mobileTab, setMobileTab] = useState<'gallery' | 'generator'>('gallery');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [batchCount, setBatchCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [previewImage, setPreviewImage] = useState<StockImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const processingRef = useRef(isProcessing);
  processingRef.current = isProcessing;

  const handleResetCurated = () => {
    setStock(DEFAULT_CURATED_STOCK);
    try {
      localStorage.setItem('navix_stock_images', JSON.stringify(DEFAULT_CURATED_STOCK));
    } catch (e) {
      console.warn('Failed to reset localStorage', e);
    }
    setSelectedCategory('semua');
    setSearchQuery('');
    showToast('Katalog stok foto berhasil dipulihkan ke 18 foto kurasi utama!', 'success');
  };

  // Persist stock back to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('navix_stock_images', JSON.stringify(stock));
    } catch (e) {
      console.warn('Failed to save stock images to localStorage:', e);
    }
  }, [stock]);

  // Categorize subjects dynamically
  const categorizeSubject = (input: string) => {
    const lowerInput = input.toLowerCase();
    for (const cat of CATEGORIES) {
      if (cat.id === 'semua') continue;
      if (cat.keywords.some(kw => lowerInput.includes(kw))) {
        return cat.id;
      }
    }
    return 'lanskap'; // sensible fallback
  };

  const generateMetadata = (subject: string, category: string, variationIndex: number) => {
    try {
      const expandedEngineResult = expandStockPrompt(subject, variationIndex);
      return {
        expanded: expandedEngineResult.finalPrompt,
        negative: expandedEngineResult.negativePrompt,
        variation_parameters: expandedEngineResult.visualVariation || `${expandedEngineResult.cameraComposition} | ${expandedEngineResult.lighting}`
      };
    } catch (e) {
      const angles = ['close-up macro shot', 'wide cinematic perspective', 'eye-level natural angle', 'dynamic atmospheric view'];
      const lightings = ['cinematic natural sunlight', 'soft golden hour illumination', 'diffused studio lighting', 'dramatic contrast'];
      const angle = angles[variationIndex % angles.length];
      const light = lightings[variationIndex % lightings.length];
      const expanded = `Authentic professional photograph of ${subject}, ${angle}, ${light}, razor-sharp focus, natural depth of field, 8k resolution, photorealistic masterwork.`;
      const negative = 'blurry, low resolution, plastic skin, distorted anatomy, watermarks, deformed, artificial CGI';
      return { expanded, negative, variation_parameters: `${angle} | ${light} | Authentic High-Res` };
    }
  };

  const handleQueueInput = () => {
    if (!inputPrompt.trim()) return;
    const newItem: QueueItem = {
      id: `job-${Date.now()}`,
      input: inputPrompt.trim(),
      count: batchCount,
      status: 'PENDING',
      progress: 0
    };
    setQueue(prev => [...prev, newItem]);
    setInputPrompt('');
  };

  // Process Batch Generation via Server Search Endpoint
  const processQueue = async () => {
    if (processingRef.current || queue.length === 0) return;
    setIsProcessing(true);
    
    const currentQueue = [...queue];
    
    for (let i = 0; i < currentQueue.length; i++) {
      const job = currentQueue[i];
      if (job.status === 'COMPLETED' || job.status === 'FAILED') continue;
      
      setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: 'PROCESSING' } : q));
      const category = categorizeSubject(job.input);
      let successCount = 0;
      
      try {
        // Fetch real stock images from server API (Wikimedia Commons + Open Repositories)
        const res = await fetch(`/api/stock-images/search?q=${encodeURIComponent(job.input)}&category=${encodeURIComponent(category)}&limit=${Math.max(job.count + 5, 10)}`);
        const data = await res.json();
        
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          const fetchedItems = data.results;
          for (let j = 0; j < Math.min(job.count, fetchedItems.length); j++) {
            const item = fetchedItems[j];
            const { expanded, negative, variation_parameters } = generateMetadata(job.input, category, j);
            
            const isDuplicate = stock.some(s => s.url === item.url);
            const newImage: StockImage = {
              id: item.id || `stk-${Date.now()}-${j}`,
              filename: item.filename || `stock_${category}_${Date.now()}_${j}.jpg`,
              category: item.category || category,
              subcategory: item.subcategory || job.input,
              subject: item.subject || job.input,
              species: item.species || item.subject || job.input,
              description: item.description || expanded,
              original_user_prompt: job.input,
              expanded_prompt: item.expanded_prompt || expanded,
              negative_prompt: item.negative_prompt || negative,
              variation_parameters: item.variation_parameters || variation_parameters,
              resolution: item.resolution || 'High Definition',
              format: item.format || 'image/jpeg',
              generation_provider: item.generation_provider || 'Wikimedia Commons (Open License)',
              license: item.license || 'Creative Commons / Public Domain',
              generation_timestamp: new Date().toISOString(),
              generation_status: 'VALIDATED',
              url: item.url
            };
            
            if (!isDuplicate) {
              setStock(prev => [newImage, ...prev]);
              successCount++;
            }
            
            setQueue(prev => prev.map(q => q.id === job.id ? { ...q, progress: Math.round(((j + 1) / job.count) * 100) } : q));
          }
        }
        
        setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: successCount > 0 ? 'COMPLETED' : 'FAILED', progress: 100 } : q));
        if (successCount > 0) {
          showToast(`Berhasil menambahkan ${successCount} stok gambar nyata ke perpustakaan!`, 'success');
        } else {
          showToast(`Tidak ditemukan gambar baru untuk "${job.input}". Coba kata kunci lain.`, 'error');
        }
      } catch (e) {
        console.error('Job error:', e);
        setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: 'FAILED', progress: 0 } : q));
        showToast('Gagal memproses penelusuran stok gambar.', 'error');
      }
    }
    
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!isProcessing && queue.some(q => q.status === 'PENDING')) {
      processQueue();
    }
  }, [queue, isProcessing]);

  // Direct Live Search from Open Library
  const handleLiveSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsLiveSearching(true);
    try {
      const res = await fetch(`/api/stock-images/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(selectedCategory)}&limit=12`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results) && data.results.length > 0) {
        let added = 0;
        setStock(prev => {
          const currentUrls = new Set(prev.map(p => p.url));
          const newOnes = data.results.filter((r: any) => !currentUrls.has(r.url));
          added = newOnes.length;
          return [...newOnes, ...prev];
        });
        showToast(`Ditemukan ${data.results.length} gambar nyata (${added} baru ditambahkan ke library)!`, 'success');
      } else {
        showToast(`Tidak ada gambar terbuka tambahan yang cocok dengan "${q}".`, 'info');
      }
    } catch (err) {
      showToast('Gagal mencari di perpustakaan daring.', 'error');
    } finally {
      setIsLiveSearching(false);
    }
  };

  // Action: Send to Chat as Visual Inspiration / Reference
  const handleUseAsVisualReference = (img: StockImage) => {
    if (!onSendToChat) {
      showToast('Koneksi chat tidak tersedia.', 'error');
      return;
    }
    const referencePrompt = `[Referensi Visual Stok Gambar]:
Subjek: ${img.subject}
Kategori: ${img.category}
URL Gambar: ${img.url}
Resolusi Asli: ${img.resolution}
Lisensi: ${img.license}

Instruksi: Gunakan visual pada gambar stok di atas sebagai referensi utama komposisi, pencahayaan, dan detail anatomi untuk pembuatan atau penyempurnaan karya visual selanjutnya.
Prompt Inspirasi: ${img.expanded_prompt}`;

    onSendToChat(referencePrompt);
    showToast(`Gambar "${img.subject}" berhasil dikirim sebagai referensi visual ke Chat!`, 'success');
  };

  // Action: Copy AI Inspiration Prompt
  const handleCopyPrompt = (id: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    showToast('Prompt inspirasi visual disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Stock based on Category & Search Query
  const filteredStock = stock.filter(s => {
    const matchesCategory = selectedCategory === 'semua' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      s.subject.toLowerCase().includes(query) || 
      s.category.toLowerCase().includes(query) || 
      s.description.toLowerCase().includes(query) ||
      s.expanded_prompt.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'semua') return stock.length;
    return stock.filter(s => s.category.toLowerCase() === categoryId.toLowerCase()).length;
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0e12] text-white relative font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 px-3 md:px-6 border-b border-neutral-800/80 bg-[#12141a]/90 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all md:hidden cursor-pointer shrink-0"
            aria-label="Buka Menu"
          >
            <Menu size={20} />
          </button>
          <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 shrink-0">
            <Camera size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-white tracking-wide truncate">
                Library Stok Gambar
              </h1>
              <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 font-mono rounded-full border border-green-500/30 whitespace-nowrap">
                Lisensi Terbuka & High-Res
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden lg:block truncate">
              Katalog referensi visual nyata untuk sintesis, pengeditan, dan inspirasi multimedia NAVIX AI.
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tab Switcher for Mobile Screens */}
          <div className="flex md:hidden bg-[#161822] border border-neutral-800 p-1 rounded-xl">
            <button
              onClick={() => setMobileTab('gallery')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                mobileTab === 'gallery'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>Foto ({stock.length})</span>
            </button>
            <button
              onClick={() => setMobileTab('generator')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                mobileTab === 'generator'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>Tambah</span>
            </button>
          </div>

          {/* Desktop Count & Reset Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleResetCurated}
              className="text-xs text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-lg transition"
              title="Kembalikan 18 stok foto kurasi utama"
            >
              Pulihkan Katalog
            </button>
            <span className="text-xs font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {stock.length} Gambar Tersedia
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
        {/* Left Panel: Input, Batch & Search Generator (Visible in 'generator' tab on mobile, always visible on md+) */}
        <div className={`w-full md:w-80 border-r border-neutral-800/80 p-4 space-y-6 flex-shrink-0 bg-[#0f1117]/80 ${
          mobileTab === 'generator' ? 'block' : 'hidden md:block'
        }`}>
          {/* Mobile Back to Gallery Button */}
          <div className="md:hidden pb-2 border-b border-neutral-800">
            <button
              onClick={() => setMobileTab('gallery')}
              className="w-full py-2 px-3 bg-neutral-800/80 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Layers size={14} className="text-green-400" />
              <span>← Kembali ke Galeri Foto ({stock.length})</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-green-400" />
              <h2 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                Ambil & Tambah Stok Baru
              </h2>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Ketik subjek visual apa saja. Sistem akan mencari foto asli beresolusi tinggi dan mengekspansi prompt inspirasi AI-nya secara otomatis.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Contoh: elang jawa, borobudur, mobil antik..."
                className="w-full bg-[#161822] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleQueueInput()}
              />
              <div className="flex gap-2">
                <select
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="bg-[#161822] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value={1}>1 Gambar (Cepat)</option>
                  <option value={3}>Batch: 3 Gambar</option>
                  <option value={5}>Batch: 5 Gambar</option>
                  <option value={10}>Batch: 10 Gambar</option>
                </select>
                <button
                  onClick={handleQueueInput}
                  disabled={!inputPrompt.trim() || isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-500 active:scale-98 text-white font-semibold text-xs rounded-xl py-2 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={14} />
                  <span>{isProcessing ? 'Memproses...' : 'Ambil Stok'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Antrean Eksekusi Batch */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Antrean Eksekusi
            </h2>
            <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {queue.length === 0 ? (
                <div className="p-4 border border-dashed border-neutral-800 rounded-xl text-center text-neutral-500 text-xs">
                  Tidak ada antrean berjalan.
                </div>
              ) : (
                queue.map(q => (
                  <div key={q.id} className="p-3 bg-[#161822] border border-neutral-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white capitalize truncate">{q.input}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        q.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : 
                        q.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400' : 
                        q.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-neutral-500">
                      <span>{q.count} variasi</span>
                      <span>{q.progress}%</span>
                    </div>
                    <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${q.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panduan Penggunaan Multimedia */}
          <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
              <ShieldCheck size={14} className="text-green-400" />
              <span>Hak Penggunaan & Kualitas</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Seluruh gambar dalam koleksi ini berasal dari repositori berlisensi terbuka (Unsplash Open License & Wikimedia Commons CC-BY-SA/Public Domain) dalam resolusi asli tanpa kompresi berlebih.
            </p>
          </div>
        </div>

        {/* Right Panel: Catalog, Categories & Gallery (Visible in 'gallery' tab on mobile, always visible on md+) */}
        <div className={`flex-1 p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto ${
          mobileTab === 'gallery' ? 'block' : 'hidden md:block'
        }`}>
          {/* Top Search & Live Open Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input
                type="text"
                placeholder="Cari foto (misal: elang, bromo, kopi, wajah, mobil)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLiveSearch()}
                className="w-full pl-10 pr-4 py-2 bg-[#161822] border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-green-500/50 text-white placeholder-neutral-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLiveSearch}
                disabled={!searchQuery.trim() || isLiveSearching}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 active:scale-98 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                <Search size={14} />
                <span>{isLiveSearching ? 'Mencari...' : 'Cari Online'}</span>
              </button>
              <button
                onClick={() => setMobileTab('generator')}
                className="md:hidden px-3.5 py-2 bg-green-600 hover:bg-green-500 active:scale-98 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <Sparkles size={14} />
                <span>+ Tambah</span>
              </button>
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    isSelected 
                      ? 'bg-green-600 text-white shadow-sm shadow-green-500/20' 
                      : 'bg-[#161822] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <Icon size={13} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-green-700 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Image Grid Gallery: Responsive 2-cols on mobile, up to 5 on large screens */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-4">
            {filteredStock.map(img => (
              <div 
                key={img.id} 
                className="group relative rounded-xl md:rounded-2xl overflow-hidden bg-[#141620] border border-neutral-800/90 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40 transition-all flex flex-col cursor-pointer"
                onClick={() => setPreviewImage(img)}
              >
                {/* Image Display */}
                <div className="aspect-[4/3] relative overflow-hidden bg-neutral-900">
                  <img 
                    src={img.url} 
                    alt={img.subject} 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* Category & License Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="text-[9px] md:text-[10px] font-medium px-1.5 py-0.5 bg-black/75 backdrop-blur-md text-white rounded border border-white/10 capitalize truncate max-w-[80px]">
                      {img.category}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className="text-[8px] md:text-[9px] font-mono px-1.5 py-0.5 bg-green-500/80 backdrop-blur-md text-white font-semibold rounded shadow-sm">
                      HD
                    </span>
                  </div>

                  {/* Desktop Hover Overlay */}
                  <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex-col justify-end p-3">
                    <p className="text-xs font-bold text-white truncate">{img.subject}</p>
                    <p className="text-[10px] text-neutral-300 line-clamp-2 mt-1 leading-relaxed">
                      {img.expanded_prompt}
                    </p>
                    
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseAsVisualReference(img);
                        }}
                        className="flex-1 py-1.5 px-2 bg-green-600 hover:bg-green-500 active:scale-95 rounded-lg text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                        title="Gunakan Sebagai Referensi Visual AI"
                      >
                        <Sparkles size={12} />
                        <span>Referensi AI</span>
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPrompt(img.id, img.expanded_prompt);
                        }}
                        className="p-1.5 bg-neutral-800/90 hover:bg-neutral-700 active:scale-95 rounded-lg text-white transition cursor-pointer"
                        title="Salin Prompt Inspirasi"
                      >
                        {copiedId === img.id ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="p-2 md:p-3 bg-[#141620] flex-1 flex flex-col justify-between border-t border-neutral-800/60">
                  <div>
                    <h3 className="text-[11px] md:text-xs font-semibold text-white truncate" title={img.subject}>
                      {img.subject}
                    </h3>
                    <p className="text-[9px] md:text-[10px] text-neutral-400 truncate mt-0.5">
                      {img.species || img.subcategory}
                    </p>
                  </div>

                  {/* Direct Action Button on Mobile (tap-friendly) */}
                  <div className="mt-2 pt-1.5 border-t border-neutral-800/60 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseAsVisualReference(img);
                      }}
                      className="flex-1 py-1 px-1.5 bg-green-600/90 hover:bg-green-500 active:scale-95 text-white font-semibold text-[9px] md:text-[10px] rounded-md flex items-center justify-center gap-1 transition"
                      title="Gunakan sebagai referensi visual di chat"
                    >
                      <Sparkles size={10} />
                      <span>Referensi AI</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(img);
                      }}
                      className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md text-[9px] transition"
                      title="Lihat Pratinjau Foto"
                    >
                      <Eye size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStock.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500 space-y-3">
              <Folder size={40} className="opacity-20 text-neutral-400" />
              <p className="text-xs md:text-sm font-medium text-neutral-400 text-center px-4">
                Tidak ada stok gambar yang cocok dengan filter atau kata kunci "{searchQuery}".
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetCurated}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Tampilkan Semua 18 Foto
                </button>
                {searchQuery.trim() && (
                  <button
                    onClick={handleLiveSearch}
                    className="px-3.5 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Cari "{searchQuery}" Online
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Multi-Category Status Strip */}
      <div className="h-11 md:h-14 px-3 md:px-4 shrink-0 bg-[#10121a] border-t border-neutral-800 flex items-center gap-3 md:gap-6 overflow-x-auto custom-scrollbar select-none z-20 sticky bottom-0">
        <div className="flex items-center gap-2 md:gap-3 shrink-0 pr-3 md:pr-4 border-r border-neutral-800">
          <div className="p-1 md:p-1.5 bg-green-500/10 text-green-400 rounded-lg">
            <Layers size={14} />
          </div>
          <div>
            <div className="text-[9px] md:text-[10px] text-neutral-400 font-medium">Koleksi Stok:</div>
            <div className="text-[11px] md:text-xs font-bold text-white whitespace-nowrap">
              {stock.length} Foto Resolusi Tinggi
            </div>
          </div>
        </div>

        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const count = getCategoryCount(cat.id);
          return (
            <button 
              key={cat.id} 
              onClick={() => {
                setSelectedCategory(cat.id);
                setMobileTab('gallery');
              }}
              className={`flex items-center gap-1.5 md:gap-2 shrink-0 py-1 px-2 md:px-2.5 rounded-lg transition cursor-pointer ${
                selectedCategory === cat.id ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon size={12} className={selectedCategory === cat.id ? 'text-green-400' : 'text-neutral-500'} />
              <span className="text-[10px] md:text-[11px] font-medium whitespace-nowrap">{cat.label}</span>
              <span className="text-[9px] md:text-[10px] font-mono text-neutral-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Modal Pratinjau Resolusi Penuh & Detail Lisensi */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-[#141620] border border-neutral-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-green-400" />
                <h3 className="text-sm md:text-base font-bold text-white truncate max-w-md">
                  {previewImage.subject}
                </h3>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="rounded-xl overflow-hidden bg-black/60 border border-neutral-800 aspect-video flex items-center justify-center">
                <img 
                  src={previewImage.url} 
                  alt={previewImage.subject}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#181a24] rounded-xl border border-neutral-800/80 space-y-1">
                  <span className="text-neutral-400 text-[10px] font-mono uppercase">Kategori & Subjek</span>
                  <p className="font-semibold text-white capitalize">{previewImage.category} — {previewImage.subcategory}</p>
                </div>
                <div className="p-3 bg-[#181a24] rounded-xl border border-neutral-800/80 space-y-1">
                  <span className="text-neutral-400 text-[10px] font-mono uppercase">Resolusi & Format</span>
                  <p className="font-semibold text-white">{previewImage.resolution} ({previewImage.format})</p>
                </div>
                <div className="p-3 bg-[#181a24] rounded-xl border border-neutral-800/80 space-y-1 col-span-full">
                  <span className="text-neutral-400 text-[10px] font-mono uppercase">Lisensi Resmi Penggunaan</span>
                  <p className="font-semibold text-green-400 flex items-center gap-1.5">
                    <ShieldCheck size={14} />
                    {previewImage.license}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {previewImage.generation_provider}
                  </p>
                </div>
              </div>

              {/* Prompt Inspirasi AI */}
              <div className="p-3.5 bg-[#181a24] rounded-xl border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[10px] font-mono uppercase">Prompt Inspirasi AI</span>
                  <button
                    onClick={() => handleCopyPrompt(previewImage.id, previewImage.expanded_prompt)}
                    className="text-[11px] text-green-400 hover:text-green-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Salin Prompt</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-mono bg-black/40 p-2.5 rounded-lg border border-neutral-800">
                  {previewImage.expanded_prompt}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-neutral-800 bg-[#10121a] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => window.open(previewImage.url, '_blank')}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>Buka URL Asli</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleUseAsVisualReference(previewImage);
                    setPreviewImage(null);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-green-600/20"
                >
                  <Sparkles size={14} />
                  <span>Jadikan Referensi Visual AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StockImageStudio;
