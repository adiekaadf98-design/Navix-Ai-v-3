import React from 'react';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

interface MapArtifactProps {
  locationName?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
}

export const MapArtifact: React.FC<MapArtifactProps> = ({
  locationName = "Navix Global Geo-Radar",
  latitude = -6.2088,
  longitude = 106.8456,
  zoom = 13
}) => {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.05}%2C${latitude - 0.05}%2C${longitude + 0.05}%2C${latitude + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div id="map-artifact-card" className="w-full my-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide">{locationName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        </div>
      </div>
      <div className="relative w-full h-56 bg-slate-900">
        <iframe
          title="Map Location"
          src={mapUrl}
          className="w-full h-full border-0 filter invert contrast-125 opacity-90"
          loading="lazy"
        />
      </div>
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>Geo-Coordinate Lock Active</span>
        </div>
        <span className="text-cyan-400 font-mono">Zoom {zoom}x</span>
      </div>
    </div>
  );
};
