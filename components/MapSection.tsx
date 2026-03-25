import React, { useEffect, useRef } from 'react';
import { Demand, Category } from '../types';

// We need to declare L as global since we are loading it from CDN
declare const L: any;

interface MapSectionProps {
  demands: Demand[];
}

const MapSection: React.FC<MapSectionProps> = ({ demands }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case Category.SECURITY: return '#ef4444';
      case Category.HOMELESSNESS: return '#f97316';
      case Category.CLEANING: return '#10b981';
      case Category.INFRASTRUCTURE: return '#3b82f6';
      case Category.TRANSPORT: return '#8b5cf6';
      case Category.ORDER: return '#eab308';
      default: return '#64748b';
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      // Default view on Rio de Janeiro
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([-22.9068, -43.1729], 11);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers (except tiles)
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    const validDemands = demands.filter(d => d.lat && d.lng);
    
    validDemands.forEach(d => {
      const primaryCategory = Array.isArray(d.category) ? d.category[0] : d.category;
      const color = getCategoryColor(String(primaryCategory || ''));
      
      const circle = L.circleMarker([d.lat, d.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      circle.bindPopup(`
        <div class="p-1">
          <strong class="text-sm font-semibold">${d.hotelName}</strong><br/>
          <span class="text-xs text-slate-500">${d.id} - ${Array.isArray(d.category) ? d.category.join(', ') : d.category}</span><br/>
          <p class="text-xs mt-1 text-slate-700">${d.description.substring(0, 80)}...</p>
        </div>
      `);
    });

    // Fit bounds if there are markers
    if (validDemands.length > 0) {
      const bounds = L.latLngBounds(validDemands.map(d => [d.lat, d.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [demands]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        Mapa de Calor das Demandas
      </h3>
      <div 
        ref={mapContainerRef} 
        className="w-full flex-grow min-h-[384px] rounded-lg z-0"
      />
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {[...new Set(Object.values(Category))].map((cat) => (
             <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-600">
               <span className="w-3 h-3 rounded-full" 
                 style={{ backgroundColor: getCategoryColor(String(cat)) }}></span>
               {cat}
             </div>
        ))}
      </div>
    </div>
  );
};

export default MapSection;
