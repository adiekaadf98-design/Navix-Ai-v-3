import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, CheckCircle2, XCircle, Search, 
  Menu, Play, Pause, RefreshCw, Sparkles, Folder, Send,
  User, PawPrint, Bird, Fish, Bug, Leaf, Dna, Microscope,
  AlertTriangle, Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { showToast } from '../../utils/toast';
import { expandStockPrompt } from '../../services/promptExpansionEngine';

interface StockImageStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface StockImage {
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
  url: string;
}

interface QueueItem {
  id: string;
  input: string;
  count: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
}

const CATEGORIES = [
  { id: 'manusia', label: 'Manusia', icon: User, keywords: ['manusia', 'orang', 'anak', 'remaja', 'dewasa', 'lansia', 'pria', 'wanita', 'person', 'human'] },
  { id: 'mamalia', label: 'Mamalia', icon: PawPrint, keywords: ['harimau', 'kucing', 'anjing', 'gajah', 'singa', 'paus', 'lumba', 'sapi', 'kuda', 'beruang', 'kelinci', 'serigala'] },
  { id: 'burung', label: 'Burung', icon: Bird, keywords: ['burung', 'elang', 'merpati', 'pipit', 'beo', 'merak', 'hantu', 'kakatua', 'pelikan', 'gagak'] },
  { id: 'ikan', label: 'Ikan', icon: Fish, keywords: ['ikan', 'hiu', 'pari', 'tuna', 'koi', 'arwana', 'cupang', 'paus', 'lele'] },
  { id: 'reptil', label: 'Reptil', icon: Bug, keywords: ['reptil', 'ular', 'kadal', 'buaya', 'kura', 'komodo', 'penyu', 'bunglon'] }, // fallback icon
  { id: 'amfibi', label: 'Amfibi', icon: Bug, keywords: ['amfibi', 'katak', 'kodok', 'salamander', 'axolotl'] }, // fallback icon
  { id: 'serangga', label: 'Serangga', icon: Bug, keywords: ['serangga', 'kupu', 'semut', 'lebah', 'nyamuk', 'lalat', 'belalang', 'kepik', 'capung'] },
  { id: 'arachnida', label: 'Arachnida', icon: Bug, keywords: ['laba', 'kalajengking', 'tarantula'] },
  { id: 'crustacea_moluska', label: 'Crustacea/Moluska/Lainnya', icon: Fish, keywords: ['kepiting', 'udang', 'gurita', 'cumi', 'siput', 'kerang', 'ubur'] },
  { id: 'tumbuhan', label: 'Tumbuhan', icon: Leaf, keywords: ['tumbuhan', 'pohon', 'rumput', 'bunga', 'mawar', 'melati', 'tanaman', 'daun', 'kaktus', 'bambu'] },
  { id: 'jamur', label: 'Jamur', icon: Leaf, keywords: ['jamur', 'mushroom', 'fungi', 'cendawan'] },
  { id: 'organisme_lainnya', label: 'Organisme Hidup Lainnya', icon: Microscope, keywords: ['bakteri', 'amoeba', 'sel', 'mikroskopis', 'plankton'] }
];

const TARGET_TOTAL = 70000;

export const StockImageStudio: React.FC<StockImageStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [stock, setStock] = useState<StockImage[]>(() => {
    try {
      const saved = localStorage.getItem('navix_stock_images');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load navix_stock_images', e);
    }
    return [];
  });

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [batchCount, setBatchCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const processingRef = useRef(isProcessing);
  processingRef.current = isProcessing;

  useEffect(() => {
    localStorage.setItem('navix_stock_images', JSON.stringify(stock));
  }, [stock]);

  const categorizeSubject = (input: string) => {
    const lowerInput = input.toLowerCase();
    for (const cat of CATEGORIES) {
      if (cat.keywords.some(kw => lowerInput.includes(kw))) {
        return cat.id;
      }
    }
    return 'organisme_lainnya'; // default
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
      const environments = ['in a dense lush forest', 'in an open savanna', 'underwater with coral reefs', 'in a modern urban setting', 'in a mystical foggy mountain', 'in a bright sunny field', 'at sunset with golden hour lighting', 'in a macro studio shot with dark background', 'in a snowy tundra landscape', 'in a tropical rainforest'];
      const angles = ['close up portrait', 'wide angle shot', 'eye level', 'low angle', 'high angle', 'drone view', 'macro shot'];
      const lighting = ['cinematic lighting', 'natural sunlight', 'dramatic rim light', 'soft diffused lighting', 'studio strobes', 'moody atmosphere'];
      const quality = 'highly detailed, 8k resolution, photorealistic, ultra-sharp focus, masterpiece, intricate textures, wildlife photography';
      
      const env = environments[(subject.length + variationIndex * 3) % environments.length];
      const angle = angles[(subject.length + variationIndex * 5) % angles.length];
      const light = lighting[(subject.length + variationIndex * 7) % lighting.length];
      
      const base = `A ${angle} of ${subject} ${env}, ${light}.`;
      const expanded = `${base} ${quality}`;
      const negative = 'blurry, distorted, low quality, artifacts, watermark, text, signature, low res, out of frame, artificial looking, fake, deformed, mutation';
      
      return { expanded, negative, variation_parameters: `${angle} | ${env} | ${light}` };
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

  const processQueue = async () => {
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
        const res = await fetch(`https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(job.input)}&gsrlimit=${Math.max(job.count + 10, 20)}&piprop=original`);
        const data = await res.json();
        
        let validUrls = [];
        let validTitles = [];
        
        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages).filter((p: any) => p.original && p.original.source);
          validUrls = pages.map((p: any) => p.original.source);
          validTitles = pages.map((p: any) => p.title);
        }
        
        for (let j = 0; j < Math.min(job.count, validUrls.length); j++) {
          const { expanded, negative, variation_parameters } = generateMetadata(job.input, category, j);
          
          const imageUrl = validUrls[j];
          const imageTitle = validTitles[j];
          
          // Validation checks
          const isValid = imageUrl && imageUrl.startsWith('http');
          if (!isValid) continue;
          
          // Duplicate check
          const isDuplicate = stock.some(s => s.url === imageUrl);
          
          const newImage = {
            id: `stk-${Date.now()}-${j}`,
            filename: `stock_${category}_${Date.now()}_${j}.jpg`,
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
            generation_status: (isDuplicate ? 'DUPLICATE' : 'VALIDATED') as 'DUPLICATE' | 'VALIDATED',
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
        if (successCount > 0) showToast(`${successCount} Real Stock Images Added!`, 'success');
        else showToast(`Failed to find real images for "${job.input}"`, 'error');
        
      } catch (e) {
        console.error('Job error', e);
        setQueue(prev => prev.map(q => q.id === job.id ? { ...q, status: 'FAILED', progress: 0 } : q));
        showToast('API Error when fetching stock.', 'error');
      }
    }
    
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!isProcessing && queue.some(q => q.status === 'PENDING')) {
      processQueue();
    }
  }, [queue, isProcessing]);

  const validatedStock = stock.filter(s => s.generation_status === 'VALIDATED');
  
  const getCategoryCount = (categoryId: string) => {
    return validatedStock.filter(s => s.category === categoryId).length;
  };

  const filteredStock = validatedStock.filter(s => 
    s.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black text-white relative font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 md:px-6 border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all md:hidden cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
            <Camera size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              Real Stock Image Library
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Makhluk Hidup - Target: {TARGET_TOTAL.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
        {/* Left Panel: Input & Queue */}
        <div className="w-full md:w-80 border-r border-neutral-800 p-4 space-y-6 flex-shrink-0 bg-neutral-900/20">
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase">Input Subject Baru</h2>
            <div className="space-y-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Contoh: harimau, mawar, manusia..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleQueueInput()}
              />
              <div className="flex gap-2">
                <select
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value={1}>1 Gambar (Test)</option>
                  <option value={5}>Batch: 5 Gambar</option>
                  <option value={10}>Batch: 10 Gambar</option>
                  <option value={50}>Batch: 50 Gambar</option>
                </select>
                <button
                  onClick={handleQueueInput}
                  disabled={!inputPrompt.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl py-2 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={16} />
                  <span>Proses</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 italic">
              Input sederhana akan otomatis diekspansi menjadi prompt biologis & sinematik yang kompleks.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase">Batch Generation Queue</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {queue.length === 0 ? (
                <div className="p-4 border border-dashed border-neutral-800 rounded-xl text-center text-neutral-500 text-xs">
                  Tidak ada batch berjalan.
                </div>
              ) : (
                queue.map(q => (
                  <div key={q.id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white capitalize">{q.input}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        q.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : 
                        q.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400' : 
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-neutral-500">
                      <span>{q.count} variations</span>
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
        </div>

        {/* Right Panel: Catalog */}
        <div className="flex-1 p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input
                type="text"
                placeholder="Cari katalog (misal: ikan, singa)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-green-500/50 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredStock.map(img => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition">
                <div className="aspect-square relative">
                  <img src={img.url} alt={img.subject} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-xs font-semibold text-white capitalize truncate">{img.subject}</p>
                    <p className="text-[10px] text-neutral-300 line-clamp-2 mt-1" title={img.expanded_prompt}>
                      {img.expanded_prompt}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => window.open(img.url, '_blank')}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-white"
                        title="Lihat Detail"
                      >
                        <ImageIcon size={12} />
                      </button>
                      {onSendToChat && (
                        <button 
                          onClick={() => onSendToChat(`[Stock Image - ${img.subject}]: ${img.url}`)}
                          className="p-1.5 bg-neutral-800 hover:bg-blue-600 rounded text-white"
                          title="Kirim ke Chat"
                        >
                          <Send size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-2 py-1.5 bg-neutral-900 border-t border-neutral-800 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-neutral-400 capitalize">{img.category}</span>
                  <span className="text-[9px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded">VALID</span>
                </div>
              </div>
            ))}
          </div>

          {filteredStock.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 space-y-3">
              <Folder size={40} className="opacity-20" />
              <p className="text-sm">Belum ada gambar tervalidasi yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Stats */}
      <div className="h-16 px-4 shrink-0 bg-[#161b22] border-t border-neutral-800 flex items-center gap-6 overflow-x-auto custom-scrollbar select-none z-20 sticky bottom-0">
        <div className="flex items-center gap-3 shrink-0 pr-4 border-r border-neutral-800">
          <div className="p-2 bg-neutral-800 rounded-lg">
            <Layers size={16} className="text-neutral-300" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-medium">Total Stok Tervalidasi :</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-white">{validatedStock.length.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-neutral-500">/ {TARGET_TOTAL.toLocaleString('id-ID')} (Target)</span>
            </div>
          </div>
        </div>

        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const count = getCategoryCount(cat.id);
          return (
            <div key={cat.id} className="flex flex-col items-center justify-center shrink-0 min-w-[70px] opacity-70 hover:opacity-100 transition cursor-default">
              <Icon size={14} className="mb-1 text-neutral-400" />
              <span className="text-[9px] text-neutral-400">{cat.label}</span>
              <span className="text-xs font-semibold text-white">{count.toLocaleString('id-ID')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
