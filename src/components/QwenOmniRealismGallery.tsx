import React from 'react';
import { Sparkles, Eye, Image as ImageIcon } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  tag: string;
}

export const QwenOmniRealismGallery: React.FC<{ items?: GalleryItem[] }> = ({ items = [] }) => {
  return (
    <div id="qwen-omni-realism-gallery" className="my-4 p-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Qwen-Omni Realism Studio Gallery</span>
        </div>
        <span className="text-[11px] text-slate-400">Ultra Realistic Engine</span>
      </div>
      {items.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-slate-700 stroke-[1.5]" />
          <span>Belum ada generasi gambar di sesi ini. Buat foto nyata di obrolan untuk mengisi galeri.</span>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-slate-800 aspect-square bg-slate-900">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end text-[11px]">
                <span className="font-medium text-white truncate">{item.title}</span>
                <span className="text-amber-300 text-[10px]">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
