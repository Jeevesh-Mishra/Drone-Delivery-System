import React, { useEffect, useState } from 'react';
import API from '../services/api';
import {
  Search, Plus, X, ChevronDown, Wifi, Battery, MapPin, MoreVertical,
  Zap, Home, AlertOctagon, Navigation, Activity, Thermometer, Signal,
  Clock, Package
} from 'lucide-react';

const Fleet: React.FC = () => {
  const [drones, setDrones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedDrone, setSelectedDrone] = useState<any>(null);
  const [commandMsg, setCommandMsg] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newDroneId, setNewDroneId] = useState('');
  const [newModel, setNewModel] = useState('Falcon X1');
  const [newCapacity, setNewCapacity] = useState('5');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Auto-suggest next unique drone ID
  const getNextDroneId = () => {
    const nums = drones
      .map((d: any) => {
        const m = d.droneId?.match(/(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(Boolean);
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `D-${max + 1}`;
  };

  const openAddModal = () => {
    setNewDroneId(getNextDroneId());
    setNewModel('Falcon X1');
    setNewCapacity('5');
    setAddError('');
    setShowAddModal(true);
  };

  const fetchDrones = async () => {
    try {
      const res = await API.get('/fleet/drones', { params: { q: search, status: statusFilter === 'All Status' ? '' : statusFilter } });
      setDrones(res.data.data);
      if (!selectedDrone && res.data.data.length > 0) {
        setSelectedDrone(res.data.data[0]);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchDrones(); }, [search, statusFilter]);

  const handleCommand = async (cmd: string) => {
    if (!selectedDrone) return;
    try {
      await API.post(`/fleet/drones/${selectedDrone.droneId}/command`, { command: cmd });
      setCommandMsg(`✓ ${cmd} command sent to ${selectedDrone.droneId}`);
      setTimeout(() => { setCommandMsg(''); fetchDrones(); }, 2000);
    } catch (e: any) {
      setCommandMsg(`✗ ${e.response?.data?.message || 'Command failed'}`);
      setTimeout(() => setCommandMsg(''), 3000);
    }
  };

  const handleAddDrone = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const trimmedId = newDroneId.trim();
    if (!trimmedId) {
      setAddError('Drone ID cannot be empty.');
      return;
    }
    setAddLoading(true);
    try {
      await API.post('/fleet/drones', {
        droneId: trimmedId,
        model: newModel,
        maxPayload: parseFloat(newCapacity) || 5,
        name: `${trimmedId} ${newModel}`,
        speed: 60,
        latitude: 37.7749,
        longitude: -122.4194,
        batteryLevel: 100,
        status: 'Available',
      });
      setShowAddModal(false);
      setNewDroneId('');
      setNewModel('Falcon X1');
      setNewCapacity('5');
      setAddError('');
      fetchDrones();
    } catch (e: any) {
      setAddError(e.response?.data?.message || 'Failed to register drone. Please try again.');
    }
    setAddLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; dot: string }> = {
      'Available': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
      'Busy': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
      'Charging': { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
      'Maintenance': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    };
    const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse-soft`}></span>
        {status === 'Available' ? 'Online' : status === 'Busy' ? 'Flying' : status}
      </span>
    );
  };

  const getBatteryColor = (level: number) => {
    if (level >= 60) return 'bg-green-500';
    if (level >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const statsCards = [
    { label: 'Total Drones', value: drones.length, icon: '🚁', color: 'text-indigo-600' },
    { label: 'Flying', value: drones.filter(d => d.status === 'Busy').length, icon: '✈️', color: 'text-blue-600' },
    { label: 'Charging', value: drones.filter(d => d.status === 'Charging').length, icon: '⚡', color: 'text-yellow-600' },
    { label: 'Maintenance', value: drones.filter(d => d.status === 'Maintenance').length, icon: '🔧', color: 'text-orange-600' },
    {
      label: 'Avg. Battery',
      value: drones.length ? `${Math.round(drones.reduce((s, d) => s + d.batteryLevel, 0) / drones.length)}%` : '—',
      icon: '🔋', color: 'text-green-600'
    },
    { label: "Today's Flights", value: 132, icon: '📊', color: 'text-purple-600' },
  ];

  return (
    <div className="flex h-full">
      {/* Main left content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* PAGE BANNER */}
        <div className="page-banner px-8 py-6" style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #e8f0fe 60%, #dde8ff 100%)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Fleet Management</h1>
              <p className="text-gray-500 text-sm mt-1">Monitor and control your entire drone fleet in real time.</p>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* AI assistant bubble */}
              <div className="bg-white/90 rounded-2xl px-4 py-2.5 shadow-sm border border-white/80 max-w-[200px]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft inline-block"></span>
                  <span className="text-[10px] font-bold text-green-600">All systems operational.</span>
                </div>
                <p className="text-[11px] text-gray-500">16 drones are flying efficiently.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stat cards row */}
          <div className="grid grid-cols-6 gap-3 mb-5">
            {statsCards.map((s) => (
              <div key={s.label} className="stat-card text-center">
                <div className="text-2xl mb-0.5">{s.icon}</div>
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-gray-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input-light pl-9"
                placeholder="Search Drone ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {['All Status', 'Available', 'Busy', 'Charging', 'Maintenance'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  statusFilter === f
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {f} {f !== 'All Status' && <ChevronDown className="w-3 h-3" />}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={openAddModal}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Drone
            </button>
          </div>

          {/* Drone grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {drones.map((drone) => (
                <div
                  key={drone.droneId}
                  onClick={() => setSelectedDrone(drone)}
                  className={`drone-card ${selectedDrone?.droneId === drone.droneId ? 'selected' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{drone.droneId}</p>
                      <p className="text-xs text-gray-400">{drone.model || 'Falcon X1'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusBadge(drone.status)}
                      <button className="p-1 text-gray-300 hover:text-gray-500">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Drone SVG illustration */}
                  <div className="flex justify-center my-3">
                    <svg viewBox="0 0 80 50" className="w-24 h-16">
                      <ellipse cx="40" cy="42" rx="28" ry="4" fill="rgba(99,102,241,0.1)"/>
                      <rect x="28" y="22" width="24" height="12" rx="4"
                        fill={drone.status === 'Busy' ? '#3b82f6' : drone.status === 'Charging' ? '#eab308' : drone.status === 'Maintenance' ? '#ef4444' : '#6366f1'}
                        opacity="0.9"/>
                      <line x1="28" y1="27" x2="12" y2="19" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="52" y1="27" x2="68" y2="19" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="28" y1="30" x2="12" y2="38" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="52" y1="30" x2="68" y2="38" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                      <ellipse cx="12" cy="19" rx="10" ry="3" fill="rgba(148,163,184,0.4)" stroke="#cbd5e1" strokeWidth="0.5"/>
                      <ellipse cx="68" cy="19" rx="10" ry="3" fill="rgba(148,163,184,0.4)" stroke="#cbd5e1" strokeWidth="0.5"/>
                      <ellipse cx="12" cy="38" rx="10" ry="3" fill="rgba(148,163,184,0.4)" stroke="#cbd5e1" strokeWidth="0.5"/>
                      <ellipse cx="68" cy="38" rx="10" ry="3" fill="rgba(148,163,184,0.4)" stroke="#cbd5e1" strokeWidth="0.5"/>
                      <circle cx="40" cy="28" r="3" fill="white" opacity="0.8"/>
                    </svg>
                  </div>

                  {/* Status + Battery */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {drone.status === 'Busy' ? (
                        <><Navigation className="w-3 h-3 text-blue-500" /><span className="font-medium text-blue-600">Flying</span></>
                      ) : drone.status === 'Charging' ? (
                        <><Zap className="w-3 h-3 text-yellow-500" /><span className="font-medium text-yellow-600">Charging</span></>
                      ) : drone.status === 'Maintenance' ? (
                        <><AlertOctagon className="w-3 h-3 text-red-500" /><span className="font-medium text-red-600">Maintenance</span></>
                      ) : (
                        <><Wifi className="w-3 h-3 text-green-500" /><span className="font-medium text-green-600">Idle</span></>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Battery className="w-3 h-3 text-gray-400" />
                      <div className="w-16 progress-bar">
                        <div
                          className={`progress-bar-fill ${getBatteryColor(drone.batteryLevel)}`}
                          style={{ width: `${drone.batteryLevel}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-600">{drone.batteryLevel}%</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{drone.status === 'Busy' ? 'Mission: WH-A → C-14' : drone.status === 'Charging' ? 'Charging Station 2' : 'Warehouse A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom strip */}
          <div className="mt-4 flex justify-center">
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors">
              <ChevronDown className="w-4 h-4" />
              Load More Drones
            </button>
          </div>
        </div>

        {/* Bottom panels */}
        <div className="px-6 pb-6 grid grid-cols-3 gap-4">
          {/* Live Fleet Map */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Live Fleet Map</h3>
            </div>
            <div
              className="rounded-xl h-32 flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}
            >
              <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-60">
                {/* Grid lines */}
                {[30,60,90,120,150].map(x => <line key={x} x1={x} y1="0" x2={x} y2="120" stroke="rgba(99,102,241,0.2)" strokeWidth="0.5"/>)}
                {[30,60,90].map(y => <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="rgba(99,102,241,0.2)" strokeWidth="0.5"/>)}
                {/* Routes */}
                <line x1="30" y1="30" x2="170" y2="90" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"/>
                <line x1="50" y1="90" x2="160" y2="40" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"/>
                {/* Drone dots */}
                <circle cx="80" cy="55" r="5" fill="#ef4444" opacity="0.9"/>
                <circle cx="80" cy="55" r="10" fill="rgba(239,68,68,0.2)"/>
                <circle cx="130" cy="70" r="5" fill="#22c55e" opacity="0.9"/>
                <circle cx="130" cy="70" r="10" fill="rgba(34,197,94,0.2)"/>
                <circle cx="60" cy="90" r="5" fill="#f59e0b" opacity="0.9"/>
              </svg>
              <button className="absolute bottom-2 left-2 text-[10px] text-blue-300 bg-blue-900/50 px-2 py-1 rounded-lg">View Full Map</button>
            </div>
          </div>

          {/* Battery Distribution */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Battery Distribution</h3>
            </div>
            <div className="flex items-center gap-4">
              {/* Donut chart */}
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#e0e7ff" strokeWidth="10"/>
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" strokeWidth="10"
                    strokeDasharray="70 118" strokeLinecap="round" transform="rotate(-90 40 40)"/>
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#3b82f6" strokeWidth="10"
                    strokeDasharray="40 118" strokeLinecap="round" transform="rotate(104 40 40)"/>
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="10"
                    strokeDasharray="18 118" strokeLinecap="round" transform="rotate(226 40 40)"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800">{drones.length}</p>
                    <p className="text-[9px] text-gray-400">Drones</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {[
                  { label: '80% – 100%', count: Math.max(0, drones.filter(d=>d.batteryLevel>=80).length), color: 'bg-green-500' },
                  { label: '50% – 80%', count: Math.max(0, drones.filter(d=>d.batteryLevel>=50&&d.batteryLevel<80).length), color: 'bg-blue-500' },
                  { label: '20% – 50%', count: Math.max(0, drones.filter(d=>d.batteryLevel>=20&&d.batteryLevel<50).length), color: 'bg-yellow-500' },
                  { label: '0% – 20%', count: Math.max(0, drones.filter(d=>d.batteryLevel<20).length), color: 'bg-red-500' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r.color}`}></span>
                    <span className="text-[11px] text-gray-500 flex-1">{r.label}</span>
                    <span className="text-[11px] font-semibold text-gray-700">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Recommendation</h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Drone D-14 is closest to the next delivery location and has 85% battery. Recommend assigning the next mission.
              </p>
            </div>
            <button className="mt-3 w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition">
              Assign D-14
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT DETAIL PANEL */}
      {selectedDrone && (
        <div className="w-72 card rounded-none border-l border-t-0 border-b-0 border-r-0 flex flex-col shrink-0 overflow-y-auto">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">{selectedDrone.droneId} {selectedDrone.model || 'Falcon X1'}</p>
              {getStatusBadge(selectedDrone.status)}
            </div>
            <button onClick={() => setSelectedDrone(null)} className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-4 flex-1">
            {/* Battery arc */}
            <div className="flex justify-center">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M 15,50 A 35,35 0 1,1 85,50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M 15,50 A 35,35 0 1,1 85,50" fill="none"
                    stroke={selectedDrone.batteryLevel >= 60 ? '#22c55e' : selectedDrone.batteryLevel >= 30 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${selectedDrone.batteryLevel * 1.1} 110`}/>
                  <text x="50" y="52" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">{selectedDrone.batteryLevel}%</text>
                  <text x="50" y="65" textAnchor="middle" fontSize="8" fill="#94a3b8">Battery</text>
                </svg>
              </div>
            </div>

            {/* Drone SVG */}
            <div className="flex justify-center">
              <svg viewBox="0 0 120 80" className="w-36 h-24">
                <ellipse cx="60" cy="68" rx="38" ry="6" fill="rgba(99,102,241,0.1)"/>
                <rect x="38" y="30" width="44" height="20" rx="7"
                  fill={selectedDrone.status === 'Busy' ? '#3b82f6' : selectedDrone.status === 'Charging' ? '#eab308' : selectedDrone.status === 'Maintenance' ? '#ef4444' : '#6366f1'}
                  opacity="0.9"/>
                <line x1="38" y1="37" x2="10" y2="25" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
                <line x1="82" y1="37" x2="110" y2="25" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
                <line x1="38" y1="43" x2="10" y2="55" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
                <line x1="82" y1="43" x2="110" y2="55" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
                <ellipse cx="10" cy="25" rx="14" ry="4" fill="rgba(148,163,184,0.5)" stroke="#cbd5e1" strokeWidth="0.7"/>
                <ellipse cx="110" cy="25" rx="14" ry="4" fill="rgba(148,163,184,0.5)" stroke="#cbd5e1" strokeWidth="0.7"/>
                <ellipse cx="10" cy="55" rx="14" ry="4" fill="rgba(148,163,184,0.5)" stroke="#cbd5e1" strokeWidth="0.7"/>
                <ellipse cx="110" cy="55" rx="14" ry="4" fill="rgba(148,163,184,0.5)" stroke="#cbd5e1" strokeWidth="0.7"/>
                <circle cx="60" cy="40" r="5" fill="white" opacity="0.9"/>
              </svg>
            </div>

            {/* Mission info */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-[10px] text-gray-400">Current Mission</p>
                <p className="text-xs font-bold text-gray-800">WH-A → C-14</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-[10px] text-gray-400">ETA</p>
                <p className="text-xs font-bold text-gray-800">12 min</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-[10px] text-gray-400">Distance</p>
                <p className="text-xs font-bold text-gray-800">4.2 km</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
              {['Overview', 'Telemetry', 'Health', 'History'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Navigation className="w-3.5 h-3.5 text-blue-500" />, label: 'Altitude', value: '120 m' },
                  { icon: <Activity className="w-3.5 h-3.5 text-green-500" />, label: 'Speed', value: '32 km/h' },
                  { icon: <Thermometer className="w-3.5 h-3.5 text-orange-500" />, label: 'Temperature', value: '38°C' },
                  { icon: <Signal className="w-3.5 h-3.5 text-indigo-500" />, label: 'Signal', value: 'Strong' },
                  { icon: <Clock className="w-3.5 h-3.5 text-purple-500" />, label: 'Flight Time', value: '18 min' },
                  { icon: <Package className="w-3.5 h-3.5 text-amber-500" />, label: 'Payload', value: '2.4 kg' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <div className="flex justify-center mb-1">{item.icon}</div>
                    <p className="text-[10px] text-gray-400">{item.label}</p>
                    <p className="text-xs font-bold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Command feedback */}
            {commandMsg && (
              <div className={`px-3 py-2 rounded-xl text-xs text-center font-medium ${commandMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {commandMsg}
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleCommand('assign_mission')} className="btn-primary text-xs py-2 justify-center">
                  <Navigation className="w-3.5 h-3.5" /> Assign Mission
                </button>
                <button onClick={() => handleCommand('return_home')} className="btn-success text-xs py-2 flex items-center justify-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> Return Home
                </button>
                <button onClick={() => handleCommand('recharge')} className="btn-warning text-xs py-2 flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Recharge
                </button>
                <button onClick={() => handleCommand('emergency_stop')} className="btn-danger text-xs py-2 flex items-center justify-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5" /> Emergency Stop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD DRONE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="card p-6 w-[380px] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Register New Drone</h3>
              <button onClick={() => { setShowAddModal(false); setAddError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDrone} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Drone ID</label>
                <input
                  className="input-light"
                  placeholder="e.g. D-25 (no spaces)"
                  value={newDroneId}
                  onChange={e => { setNewDroneId(e.target.value); setAddError(''); }}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Model</label>
                <select className="input-light" value={newModel} onChange={e => setNewModel(e.target.value)}>
                  <option>Falcon X1</option>
                  <option>AeroMax 4K</option>
                  <option>SkyRunner X1</option>
                  <option>Falcon Pro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Max Payload (kg)</label>
                <input type="number" className="input-light" placeholder="5" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} required />
              </div>
              {/* Inline error message */}
              {addError && (
                <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  ⚠ {addError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(''); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={addLoading} className="btn-primary flex-1 justify-center disabled:opacity-60">
                  {addLoading ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Registering...
                    </span>
                  ) : 'Register Drone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fleet;
