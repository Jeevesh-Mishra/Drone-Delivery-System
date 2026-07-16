import React, { useEffect, useState, useRef } from 'react';
import { 
  MapPin, 
  Compass, 
  Battery, 
  Clock, 
  Activity, 
  RotateCw, 
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import API from '../services/api';
// Static connection corridors mapping between warehouses and destinations
const STATIC_CONNECTIONS = [
  { from: 'WH-A', to: 'C-01' },
  { from: 'WH-A', to: 'C-02' },
  { from: 'WH-A', to: 'C-03' },
  { from: 'WH-A', to: 'C-06' },
  { from: 'WH-B', to: 'C-01' },
  { from: 'WH-B', to: 'C-03' },
  { from: 'WH-B', to: 'C-04' },
  { from: 'C-01', to: 'C-02' },
  { from: 'C-01', to: 'C-03' },
  { from: 'C-02', to: 'C-05' },
  { from: 'C-02', to: 'C-06' },
  { from: 'C-03', to: 'C-04' },
  { from: 'C-04', to: 'C-05' },
  { from: 'C-05', to: 'C-06' },
];

// Import mapbox gl js library
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const RouteOptimization: React.FC = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [noFlyZones, setNoFlyZones] = useState<any[]>([]);
  const [selectedWH, setSelectedWH] = useState('');
  const [selectedDest, setSelectedDest] = useState('');
  
  const [optimizedRoute, setOptimizedRoute] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mapbox DOM ref & instance reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  // Track if map has loaded successfully
  const [mapboxFailed, setMapboxFailed] = useState(false);

  // Fetch initial nodes from API
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const [whRes, destRes, nfzRes] = await Promise.all([
          API.get('/routes/warehouses'),
          API.get('/routes/destinations'),
          API.get('/routes/noflyzones')
        ]);
        setWarehouses(whRes.data.data);
        setDestinations(destRes.data.data);
        setNoFlyZones(nfzRes.data.data);

        // Pre-select defaults
        if (whRes.data.data.length > 0) setSelectedWH(whRes.data.data[0].warehouseId);
        if (destRes.data.data.length > 0) setSelectedDest(destRes.data.data[0].destinationId);
      } catch (err) {
        console.error('Failed to load path nodes:', err);
      }
    };
    fetchNodes();
  }, []);

  // Initialize Mapbox GL JS Map
  useEffect(() => {
    if (!mapContainerRef.current || warehouses.length === 0) return;

    try {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHJvbmVkZWxpdmVyeSIsImEiOiJjbHlkMWhhMWowMTFqMnpwc2pxM2h3Mmd2In0.U2Qxb3BxTDRjMHh1MW92QWc';
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11', // premium sleek dark tech theme style
        center: [-122.4194, 37.7749], // SF center Civic Center
        zoom: 11.8,
        attributionControl: false
      });

      mapRef.current = map;

      // Handle mapbox load error fallback
      map.on('error', () => {
        console.warn('Mapbox rendering failed. Switching to Cockpit Simulator.');
        setMapboxFailed(true);
      });

      map.on('load', () => {
        // Draw No-Fly Zones as solid red overlay polygons
        noFlyZones.forEach(zone => {
          const zoneId = `nfz-${zone.zoneName.replace(/\s+/g, '-').toLowerCase()}`;
          
          map.addSource(zoneId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [zone.polygonCoordinates]
              },
              properties: {}
            }
          });

          // Red fill
          map.addLayer({
            id: `${zoneId}-fill`,
            type: 'fill',
            source: zoneId,
            paint: {
              'fill-color': '#f43f5e',
              'fill-opacity': 0.22
            }
          });

          // Red boundary
          map.addLayer({
            id: `${zoneId}-outline`,
            type: 'line',
            source: zoneId,
            paint: {
              'line-color': '#f43f5e',
              'line-width': 1.8,
              'line-dasharray': [2, 2]
            }
          });
        });

        // Add markers for Warehouses and Customers
        updateMapMarkers();
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.warn('Mapbox initialization exception. Switching to Cockpit Simulator.', err);
      setMapboxFailed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouses, destinations, noFlyZones]);

  // Redraw Markers helper
  const updateMapMarkers = () => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add warehouses
    warehouses.forEach(wh => {
      const el = document.createElement('div');
      el.className = 'w-7 h-7 rounded-lg bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-mono-tech text-[10px] font-bold';
      el.innerText = wh.warehouseId;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([wh.longitude, wh.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Add destinations
    destinations.forEach(dest => {
      const el = document.createElement('div');
      el.className = 'w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-mono-tech text-[9px] font-bold';
      el.innerText = dest.destinationId;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([dest.longitude, dest.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });
  };

  // Trigger Dijkstra route optimization endpoint
  const handleOptimize = async () => {
    if (!selectedWH || !selectedDest) {
      setError('Please select origin warehouse and destination.');
      return;
    }

    setLoading(true);
    setError('');
    setOptimizedRoute(null);

    try {
      const response = await API.post('/routes/optimize', {
        warehouseId: selectedWH,
        destinationId: selectedDest
      });
      const route = response.data.data;
      setOptimizedRoute(route);

      // Draw path line on map
      drawOptimizedPath(route.pathCoordinates);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Route calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Draw Path Line
  const drawOptimizedPath = (coords: [number, number][]) => {
    const map = mapRef.current;
    if (!map || mapboxFailed) return;

    // Ensure style has loaded
    if (!map.isStyleLoaded()) return;

    // Remove existing line if present
    if (map.getLayer('route-line')) map.removeLayer('route-line');
    if (map.getSource('route-path')) map.removeSource('route-path');

    // Add source
    map.addSource('route-path', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords
        },
        properties: {}
      }
    });

    // Add glowing line layer
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-path',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#10b981', // Emerald green
        'line-width': 4.5,
        'line-opacity': 0.85
      }
    });

    // Fit map bounds to encompass the path
    const bounds = new mapboxgl.LngLatBounds();
    coords.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, { padding: 60 });
  };

  // Coordinates Mapping for Cockpit Simulator Canvas fallback
  const getSimCoordinates = (lng: number, lat: number) => {
    // SF Bounds mapping:
    // Lng: -122.50 to -122.39 (Left to Right)
    // Lat: 37.75 to 37.82 (Bottom to Top)
    const minLng = -122.50;
    const maxLng = -122.39;
    const minLat = 37.75;
    const maxLat = 37.82;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100; // in %
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // in % (invert Y axis)
    return { x, y };
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* PAGE BANNER */}
      <div className="page-banner px-8 py-6" style={{ background: 'linear-gradient(135deg, #e8f8f0 0%, #d4f4e8 60%, #c8f0e0 100%)' }}>
        <h1 className="text-3xl font-extrabold text-gray-900">Route Optimization</h1>
        <p className="text-gray-500 text-sm mt-1">Calculate optimal flight paths using Dijkstra's algorithm, avoiding No-Fly Zones.</p>
      </div>

      <div className="flex flex-1 gap-5 p-6 min-h-0" style={{ minHeight: '500px' }}>

      {/* 1. MAP SECTION (Left Panel) */}
      <div className="flex-1 card rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[450px]">

        {/* Top HUD overlay info */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 text-[10px] font-semibold text-green-600 flex items-center space-x-2 shadow-sm">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>ROUTING VISUALIZER — Dijkstra Path Engine</span>
        </div>


        {/* Dynamic Dual-Mode Map Engine */}
        {mapboxFailed ? (
          /* High-Fidelity SVG Cockpit Simulator (Offline Fallback) */
          <div className="flex-1 w-full h-full relative bg-[#070b19] flex items-center justify-center p-6 border-b border-slate-800">
            {/* Background grid overlay */}
            <div className="absolute inset-0 cockpit-grid opacity-30"></div>

            <svg className="w-full h-full max-h-[500px]" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Draw No-Fly Zones */}
              {noFlyZones.map((zone, zIdx) => {
                const points = zone.polygonCoordinates.map((coord: any) => {
                  const pt = getSimCoordinates(coord[0], coord[1]);
                  return `${pt.x},${pt.y}`;
                }).join(' ');

                return (
                  <polygon
                    key={zIdx}
                    points={points}
                    fill="#f43f5e"
                    fillOpacity="0.18"
                    stroke="#f43f5e"
                    strokeWidth="0.4"
                    strokeDasharray="1,1"
                  />
                );
              })}

              {/* Draw Connections (Corridors) */}
              {warehouses.length > 0 && destinations.length > 0 && STATIC_CONNECTIONS.map((conn, cIdx) => {
                const fromNode = warehouses.find(w => w.warehouseId === conn.from) || destinations.find(d => d.destinationId === conn.from);
                const toNode = warehouses.find(w => w.warehouseId === conn.to) || destinations.find(d => d.destinationId === conn.to);
                
                if (fromNode && toNode) {
                  const p1 = getSimCoordinates(fromNode.longitude, fromNode.latitude);
                  const p2 = getSimCoordinates(toNode.longitude, toNode.latitude);
                  return (
                    <line
                      key={cIdx}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="0.25"
                    />
                  );
                }
                return null;
              })}

              {/* Draw Optimized Path Line */}
              {optimizedRoute && (
                <polyline
                  points={optimizedRoute.pathCoordinates.map((coords: any) => {
                    const pt = getSimCoordinates(coords[0], coords[1]);
                    return `${pt.x},${pt.y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              )}

              {/* Plot Warehouses */}
              {warehouses.map((wh) => {
                const pt = getSimCoordinates(wh.longitude, wh.latitude);
                return (
                  <g key={wh.warehouseId}>
                    <rect
                      x={pt.x - 1.5}
                      y={pt.y - 1.5}
                      width="3"
                      height="3"
                      rx="0.5"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="0.2"
                    />
                    <text
                      x={pt.x}
                      y={pt.y + 0.4}
                      fill="#ffffff"
                      fontSize="1"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="Share Tech Mono"
                    >
                      {wh.warehouseId}
                    </text>
                  </g>
                );
              })}

              {/* Plot Destinations */}
              {destinations.map((dest) => {
                const pt = getSimCoordinates(dest.longitude, dest.latitude);
                return (
                  <g key={dest.destinationId}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="1.2"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="0.2"
                    />
                    <text
                      x={pt.x}
                      y={pt.y + 0.4}
                      fill="#ffffff"
                      fontSize="1"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="Share Tech Mono"
                    >
                      {dest.destinationId}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Warning info overlay */}
            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-lg text-[9px] text-slate-500 font-mono-tech flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>OFFLINE COCKPIT GRID ACTIVE</span>
            </div>
          </div>
        ) : (
          /* Standard Mapbox Container */
          <div ref={mapContainerRef} className="flex-1 w-full h-full border-b border-slate-200 z-0"></div>
        )}

        {/* Bottom Legend bar */}
        <div className="p-3 bg-white flex items-center justify-center space-x-6 text-[11px] font-medium text-gray-500 select-none border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-blue-500 border border-white shadow-sm"></span>
            <span>Origin Depot (Warehouse)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span>
            <span>Target Node (Destination)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-2 border border-dashed border-rose-500 bg-rose-50"></span>
            <span>No-Fly Zone</span>
          </div>
          {optimizedRoute && (
            <div className="flex items-center space-x-2">
              <span className="w-5 h-0.5 bg-emerald-500"></span>
              <span>Dijkstra Optimal Path</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. ROUTE PLANNING CONTROLS (Right Panel) */}
      <div className="w-72 flex flex-col gap-4 shrink-0 select-none">

        {/* Selector Panel */}
        <div className="card p-5 space-y-4">
          <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-green-500" />
            Path Optimization Setup
          </h4>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Origin Depot (Warehouse)</label>
              <select
                value={selectedWH}
                onChange={(e) => setSelectedWH(e.target.value)}
                className="input-light"
              >
                {warehouses.map(wh => (
                  <option key={wh.warehouseId} value={wh.warehouseId}>
                    {wh.name} ({wh.warehouseId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Target Node (Destination)</label>
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="input-light"
              >
                {destinations.map(dest => (
                  <option key={dest.destinationId} value={dest.destinationId}>
                    {dest.name} ({dest.destinationId})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Execute Dijkstra Solver
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optimized Output Panel */}
        {optimizedRoute && (
          <div className="card p-5 space-y-3 animate-fade-in-up">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Optimization Result</h5>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
                RESOLVED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Route ID', value: optimizedRoute.routeId },
                { label: 'Distance', value: `${optimizedRoute.distance} km` },
                { label: 'Duration', value: `${optimizedRoute.estimatedTime} min` },
                { label: 'Battery Usage', value: `${optimizedRoute.batteryUsage}%` },
                { label: 'Efficiency Score', value: `${optimizedRoute.optimizationScore}%` },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="font-bold text-gray-800">{row.value}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <p className="text-gray-400 mb-1.5">Flight Path</p>
                <div className="flex flex-wrap gap-1">
                  {optimizedRoute.pathCoordinates.map((_: any, idx: number) => {
                    const nodeId = idx === 0 ? selectedWH : idx === optimizedRoute.pathCoordinates.length - 1 ? selectedDest : `Node ${idx}`;
                    return (
                      <span key={idx} className="flex items-center text-[10px]">
                        <MapPin className="w-2.5 h-2.5 mr-0.5 text-emerald-500" />
                        <span className="font-semibold text-emerald-700">{nodeId}</span>
                        {idx < optimizedRoute.pathCoordinates.length - 1 && <span className="mx-1 text-gray-300">→</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
export default RouteOptimization;
