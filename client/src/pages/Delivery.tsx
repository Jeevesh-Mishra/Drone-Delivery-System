import React, { useEffect, useState, useRef, useCallback } from 'react';
import API from '../services/api';
import {
  Search, ChevronDown, X, Package, MapPin, Clock, CheckCircle,
  AlertCircle, TrendingUp, Navigation, Truck, Plus, QrCode,
  Phone, RefreshCw, Zap, AlertTriangle, RotateCw, Play,
  ChevronRight, Activity, Send
} from 'lucide-react';

// Journey step definitions per delivery status
const JOURNEY_STEPS = [
  { key: 'booked', label: 'Warehouse', sub: 'Package Packed' },
  { key: 'assigned', label: 'Drone Assigned', sub: '' },
  { key: 'transit', label: 'In Transit', sub: 'En Route to Customer' },
  { key: 'out', label: 'Out for Delivery', sub: '' },
  { key: 'delivered', label: 'Delivered', sub: '' },
];

function getJourneyIndex(status: string) {
  switch (status) {
    case 'Pending': return 0;
    case 'Assigned': return 1;
    case 'In Transit': return 2;
    case 'Out for Delivery': return 3;
    case 'Delivered': return 4;
    default: return 0;
  }
}

function getStatusStyle(s: string) {
  const m: Record<string, string> = {
    'Pending': 'bg-slate-100 text-slate-600',
    'Assigned': 'bg-blue-100 text-blue-700',
    'In Transit': 'bg-violet-100 text-violet-700',
    'Out for Delivery': 'bg-orange-100 text-orange-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };
  return m[s] || 'bg-gray-100 text-gray-600';
}

function getPriorityStyle(p: string) {
  if (p === 'High') return 'text-orange-600 bg-orange-50 border-orange-200';
  if (p === 'Medium') return 'text-blue-600 bg-blue-50 border-blue-200';
  return 'text-green-600 bg-green-50 border-green-200';
}

function getProgressPct(status: string) {
  switch (status) {
    case 'Pending': return 5;
    case 'Assigned': return 30;
    case 'In Transit': return 65;
    case 'Out for Delivery': return 85;
    case 'Delivered': return 100;
    case 'Cancelled': return 0;
    default: return 0;
  }
}

function getProgressColor(status: string) {
  if (status === 'Delivered') return 'bg-green-500';
  if (status === 'In Transit' || status === 'Out for Delivery') return 'bg-orange-500';
  if (status === 'Assigned') return 'bg-blue-500';
  if (status === 'Cancelled') return 'bg-red-500';
  return 'bg-slate-400';
}

// Tiny drone SVG
const DroneSVG = ({ color = '#6366f1' }: { color?: string }) => (
  <svg viewBox="0 0 60 40" className="w-14 h-10">
    <rect x="18" y="13" width="24" height="12" rx="4" fill={color} opacity="0.9" />
    <line x1="18" y1="17" x2="6" y2="11" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="17" x2="54" y2="11" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="22" x2="6" y2="28" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="22" x2="54" y2="28" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="6" cy="11" rx="7" ry="2" fill="rgba(148,163,184,0.5)" />
    <ellipse cx="54" cy="11" rx="7" ry="2" fill="rgba(148,163,184,0.5)" />
    <ellipse cx="6" cy="28" rx="7" ry="2" fill="rgba(148,163,184,0.5)" />
    <ellipse cx="54" cy="28" rx="7" ry="2" fill="rgba(148,163,184,0.5)" />
    <circle cx="30" cy="19" r="2.5" fill="white" opacity="0.9" />
  </svg>
);

// Animated drone position on map
function LiveMap({ delivery }: { delivery: any }) {
  const [pos, setPos] = useState(0.4); // 0 = start, 1 = end
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!delivery || delivery.status === 'Delivered' || delivery.status === 'Pending') return;
    const interval = setInterval(() => {
      setPos(p => {
        const next = p + 0.005;
        return next > 0.85 ? 0.4 : next;
      });
      setTick(t => t + 1);
    }, 200);
    return () => clearInterval(interval);
  }, [delivery?.deliveryId, delivery?.status]);

  const cx = 30 + pos * 140;
  const cy = 65 - Math.sin(pos * Math.PI) * 40;

  return (
    <div
      className="rounded-2xl h-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #1e4a7c 100%)' }}
    >
      <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full">
        {/* City skyline */}
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
          <rect key={i} x={i*18} y={55 + Math.sin(i) * 15} width="14"
            height={45 - Math.sin(i) * 15} rx="1"
            fill={`rgba(100,140,200,${0.15+i%3*0.07})`} />
        ))}
        {/* Flight path curve */}
        <path d="M30 75 Q100 20 170 60"
          fill="none" stroke="rgba(249,115,22,0.4)" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 75 Q100 20 170 60"
          fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4,3" />
        {/* Start pin */}
        <circle cx="30" cy="75" r="5" fill="#22c55e" />
        <circle cx="30" cy="75" r="2.5" fill="white" />
        {/* End pin */}
        <circle cx="170" cy="60" r="5" fill="#ef4444" />
        <circle cx="170" cy="60" r="2.5" fill="white" />
        {/* Animated drone */}
        {delivery?.status !== 'Pending' && delivery?.status !== 'Delivered' && (
          <g transform={`translate(${cx},${cy})`}>
            <circle r="10" fill="rgba(249,115,22,0.25)" />
            <circle r="5" fill="#f97316" />
            <line x1="-8" y1="0" x2="-14" y2="-5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="0" x2="14" y2="-5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
      {/* Overlay cards */}
      <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg px-2 py-1.5 text-xs shadow-sm">
        <p className="font-semibold text-gray-700 text-[10px]">Live Update</p>
        <p className="text-gray-500 text-[10px]">
          {delivery?.status === 'Delivered' ? 'Package delivered ✓' :
           delivery?.status === 'Pending' ? 'Awaiting dispatch...' :
           'Drone flying smoothly.'}
        </p>
      </div>
      <div className="absolute top-2 right-2 bg-white/90 rounded-lg px-2 py-1.5 text-xs shadow-sm text-right">
        <p className="text-[10px] text-gray-400">Distance Left</p>
        <p className="font-bold text-gray-800 text-xs">
          {delivery?.status === 'Delivered' ? '0 km' :
           delivery?.status === 'Pending' ? '—' :
           `${(3.2 - pos * 2.5).toFixed(1)} km`}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">ETA</p>
        <p className="font-bold text-orange-600 text-xs">
          {delivery?.estimatedArrival
            ? new Date(delivery.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '—'}
        </p>
      </div>
    </div>
  );
}

const Delivery: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [availableDrones, setAvailableDrones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Book form state
  const [bCustomer, setBCustomer] = useState('');
  const [bWH, setBWH] = useState('');
  const [bDest, setBDest] = useState('');
  const [bPriority, setBPriority] = useState('Medium');
  const [bWeight, setBWeight] = useState('');
  const [bType, setBType] = useState('Electronics');
  const [bFragile, setBFragile] = useState(false);
  const [booking, setBooking] = useState(false);

  // Manual assign state
  const [assignDeliveryId, setAssignDeliveryId] = useState('');
  const [assignDroneId, setAssignDroneId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Dispatch state
  const [dispatching, setDispatching] = useState(false);

  // Queue data
  const [queueData, setQueueData] = useState<any>(null);

  const pollingRef = useRef<any>(null);
  const prevDeliveriesRef = useRef<Record<string, string>>({}); // deliveryId → last known status

  // Status labels for toast messages
  const STATUS_LABELS: Record<string, string> = {
    'Assigned':        '📦 Package packed & Drone assigned!',
    'In Transit':      '🚀 Drone is airborne — In Transit!',
    'Out for Delivery':'📍 Out for Delivery — almost there!',
    'Delivered':       '✅ Package delivered successfully!',
  };

  const showMsg = (msg: string, ok = true) => {
    setActionMsg(msg);
    setActionSuccess(ok);
    setTimeout(() => setActionMsg(''), 3500);
  };

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params: any = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      if (searchQ) params.q = searchQ;

      const [delRes, whRes, dstRes, droneRes, queueRes] = await Promise.all([
        API.get('/deliveries', { params }),
        API.get('/routes/warehouses'),
        API.get('/routes/destinations'),
        API.get('/fleet/drones', { params: { status: 'Available' } }),
        API.get('/deliveries/queue'),
      ]);

      const dels = delRes.data.data || [];

      // Detect status changes and show toast notifications
      dels.forEach((d: any) => {
        const prev = prevDeliveriesRef.current[d.deliveryId];
        if (prev && prev !== d.status && STATUS_LABELS[d.status]) {
          showMsg(`${d.deliveryId}: ${STATUS_LABELS[d.status]}`);
        }
        prevDeliveriesRef.current[d.deliveryId] = d.status;
      });

      setDeliveries(dels);
      setWarehouses(whRes.data.data || []);
      setDestinations(dstRes.data.data || []);
      setAvailableDrones(droneRes.data.data || []);
      setQueueData(queueRes.data.data || null);

      // Keep selected in sync
      if (selected) {
        const updated = dels.find((d: any) => d.deliveryId === selected.deliveryId);
        if (updated) setSelected(updated);
      } else if (dels.length > 0) {
        setSelected(dels[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setRefreshing(false);
  }, [statusFilter, priorityFilter, searchQ, selected?.deliveryId]);

  // Initial load + auto-refresh every 5 seconds for live status tracking
  useEffect(() => {
    fetchAll();
    pollingRef.current = setInterval(() => fetchAll(true), 5000);
    return () => clearInterval(pollingRef.current);
  }, [statusFilter, priorityFilter, searchQ]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchAll();
  }, [statusFilter, priorityFilter]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);
    try {
      const res = await API.post('/deliveries', {
        customerName: bCustomer,
        warehouseId: bWH,
        destinationId: bDest,
        priority: bPriority,
        packageWeight: parseFloat(bWeight),
        packageType: bType,
        fragile: bFragile,
      });
      setShowBookModal(false);
      setBCustomer(''); setBWH(''); setBDest(''); setBWeight('');
      setBPriority('Medium'); setBType('Electronics'); setBFragile(false);
      showMsg(`✓ Shipment ${res.data.data.deliveryId} booked successfully!`);
      await fetchAll(true);
    } catch (err: any) {
      showMsg(`✗ ${err.response?.data?.message || 'Booking failed'}`, false);
    }
    setBooking(false);
  };

  const handleDispatch = async () => {
    setDispatching(true);
    try {
      const res = await API.post('/deliveries/dispatch');
      showMsg(`✓ ${res.data.message}`);
      await fetchAll(true);
    } catch (err: any) {
      showMsg(`✗ ${err.response?.data?.message || 'Dispatch failed'}`, false);
    }
    setDispatching(false);
  };

  const handleManualAssign = async () => {
    if (!assignDeliveryId || !assignDroneId) {
      showMsg('✗ Select a delivery and a drone first', false);
      return;
    }
    setAssigning(true);
    try {
      // First generate a route or find existing one
      const deliveryToAssign = deliveries.find(d => d.deliveryId === assignDeliveryId);
      if (!deliveryToAssign) { showMsg('✗ Delivery not found', false); setAssigning(false); return; }

      // Use a fallback route
      let routeId = 'R-SEED-01';
      try {
        const routeRes = await API.post('/routes/optimize', {
          warehouseId: deliveryToAssign.warehouseId,
          destinationId: deliveryToAssign.destinationId,
        });
        routeId = routeRes.data.data.routeId;
      } catch {}

      await API.post(`/deliveries/${assignDeliveryId}/assign`, {
        droneId: assignDroneId,
        routeId,
      });
      showMsg(`✓ Drone ${assignDroneId} assigned to ${assignDeliveryId}`);
      await fetchAll(true);
    } catch (err: any) {
      showMsg(`✗ ${err.response?.data?.message || 'Assignment failed'}`, false);
    }
    setAssigning(false);
  };

  const handleUpdateStatus = async (deliveryId: string, status: string) => {
    try {
      await API.patch(`/deliveries/${deliveryId}/status`, { status });
      showMsg(`✓ ${deliveryId} marked as ${status}`);
      await fetchAll(true);
    } catch (err: any) {
      showMsg(`✗ ${err.response?.data?.message || 'Update failed'}`, false);
    }
  };

  const journeyIndex = selected ? getJourneyIndex(selected.status) : 0;

  const statCards = [
    { label: "Today's Deliveries", value: deliveries.length, icon: <Package className="w-4 h-4" />, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'In Transit', value: deliveries.filter(d => d.status === 'In Transit').length, icon: <Truck className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Delivered', value: deliveries.filter(d => d.status === 'Delivered').length, icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Pending', value: deliveries.filter(d => d.status === 'Pending').length, icon: <Clock className="w-4 h-4" />, color: 'text-slate-500', bg: 'bg-slate-50' },
    { label: 'Assigned', value: deliveries.filter(d => d.status === 'Assigned').length, icon: <Activity className="w-4 h-4" />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    {
      label: 'Success Rate',
      value: deliveries.length > 0
        ? `${Math.round((deliveries.filter(d => d.status === 'Delivered').length / deliveries.length) * 100)}%`
        : '—',
      icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-50'
    },
  ];

  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending');

  return (
    <div className="flex h-full overflow-hidden">
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* BANNER */}
        <div className="px-8 py-5 border-b border-slate-100"
          style={{ background: 'linear-gradient(135deg, #fff8f0 0%, #fff3e0 60%, #ffe8cc 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Delivery Management</h1>
              <p className="text-gray-500 text-sm mt-0.5">Monitor, track and manage all deliveries in real-time.</p>
            </div>
            <div className="flex items-center gap-2">
              {refreshing && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-600">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
              <button
                onClick={() => fetchAll(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button onClick={() => setShowBookModal(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Book Shipment
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Action message */}
          {actionMsg && (
            <div className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${actionSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {actionSuccess ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {actionMsg}
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-6 gap-3">
            {statCards.map(s => (
              <div key={s.label} className="stat-card">
                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center ${s.color} mb-2`}>
                  {s.icon}
                </div>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Delivery Journey */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Delivery Journey</h3>
              {selected && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-700">{selected.deliveryId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusStyle(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
              )}
            </div>

            {/* Journey Steps */}
            <div className="flex items-start gap-0 mb-5">
              {JOURNEY_STEPS.map((step, i) => {
                const done = i < journeyIndex;
                const active = i === journeyIndex;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center relative">
                    {i < JOURNEY_STEPS.length - 1 && (
                      <div
                        className="absolute top-5 left-1/2 w-full h-0.5 transition-all duration-500"
                        style={{
                          background: done ? '#22c55e' : active ? '#f97316' : '#e2e8f0',
                        }}
                      />
                    )}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-300 ${
                        active
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                          : done
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-200 text-gray-300'
                      }`}
                    >
                      {done ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : active ? (
                        <Navigation className="w-5 h-5" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                      )}
                    </div>
                    <p className={`text-xs font-semibold text-center ${active ? 'text-orange-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400 text-center">{step.sub}</p>
                    {active && selected?.estimatedArrival && (
                      <p className="text-[10px] text-orange-500 font-medium">
                        ETA {new Date(selected.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Animated Live Map */}
            <LiveMap delivery={selected} />

            {/* Quick status actions for selected delivery */}
            {selected && selected.status !== 'Delivered' && selected.status !== 'Cancelled' && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400 font-medium">Quick Update:</span>
                {selected.status === 'Assigned' && (
                  <button
                    onClick={() => handleUpdateStatus(selected.deliveryId, 'In Transit')}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3" /> Mark In Transit
                  </button>
                )}
                {selected.status === 'In Transit' && (
                  <button
                    onClick={() => handleUpdateStatus(selected.deliveryId, 'Out for Delivery')}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition flex items-center gap-1.5"
                  >
                    <Truck className="w-3 h-3" /> Out for Delivery
                  </button>
                )}
                {(selected.status === 'Out for Delivery' || selected.status === 'In Transit') && (
                  <button
                    onClick={() => handleUpdateStatus(selected.deliveryId, 'Delivered')}
                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3 h-3" /> Mark Delivered
                  </button>
                )}
                {selected.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleUpdateStatus(selected.deliveryId, 'Cancelled')}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition flex items-center gap-1.5"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            )}
          </div>

          {/* All Deliveries list */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h3 className="font-bold text-gray-800">All Deliveries</h3>
              <div className="relative flex-1 min-w-[180px] max-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="input-light pl-9 py-2 text-xs"
                  placeholder="Search Package ID / Customer..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
              </div>
              <select
                className="input-light max-w-[130px] py-2 text-xs"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Pending</option>
                <option>Assigned</option>
                <option>In Transit</option>
                <option>Out for Delivery</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
              <select
                className="input-light max-w-[130px] py-2 text-xs"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
              >
                <option>All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <span className="text-xs text-gray-400 ml-auto">{deliveries.length} total</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            ) : deliveries.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No deliveries found</p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {deliveries.map((d) => (
                  <div
                    key={d.deliveryId}
                    onClick={() => setSelected(d)}
                    className={`drone-card shrink-0 w-44 cursor-pointer transition-all ${selected?.deliveryId === d.deliveryId ? 'selected' : ''}`}
                  >
                    <p className="font-bold text-gray-900 text-xs">{d.deliveryId}</p>
                    <p className="text-[10px] text-gray-400 mb-1">{d.package?.type || 'Package'} • {d.customerName}</p>
                    <div className="flex justify-center my-2">
                      <DroneSVG
                        color={d.status === 'In Transit' ? '#7c3aed' : d.status === 'Delivered' ? '#22c55e' : d.status === 'Assigned' ? '#3b82f6' : '#94a3b8'}
                      />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusStyle(d.status)}`}>
                        {d.status}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${getPriorityStyle(d.priority)}`}>
                        {d.priority}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mb-1.5">
                      ETA: {d.estimatedArrival
                        ? new Date(d.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'TBD'}
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${getProgressColor(d.status)}`}
                        style={{ width: `${getProgressPct(d.status)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom section: Queue + Manual Assign + Dispatch */}
          <div className="grid grid-cols-3 gap-4">
            {/* Priority Queue Viewer */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Priority Queue (Heap)</h3>
                <span className="badge-pro">DSA</span>
              </div>
              {queueData && queueData.priorityQueue?.length > 0 ? (
                <div className="space-y-2">
                  {queueData.priorityQueue.slice(0, 5).map((item: any, i: number) => (
                    <div key={item.deliveryId || i} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? 'bg-orange-500' : 'bg-gray-300'}`}>
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{item.deliveryId}</p>
                          <p className="text-[10px] text-gray-400">{item.customerName}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityStyle(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                  {queueData.count > 5 && (
                    <p className="text-[10px] text-gray-400 text-center">+{queueData.count - 5} more in queue</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Queue empty — no pending deliveries</p>
              )}
            </div>

            {/* Manual Mission Assignment */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Manual Mission Assignment</h3>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Select Delivery</label>
                  <select
                    className="input-light text-xs py-2"
                    value={assignDeliveryId}
                    onChange={e => setAssignDeliveryId(e.target.value)}
                  >
                    <option value="">— Choose delivery —</option>
                    {deliveries.filter(d => d.status === 'Pending').map(d => (
                      <option key={d.deliveryId} value={d.deliveryId}>
                        {d.deliveryId} ({d.priority})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Select Drone</label>
                  <select
                    className="input-light text-xs py-2"
                    value={assignDroneId}
                    onChange={e => setAssignDroneId(e.target.value)}
                  >
                    <option value="">— Choose drone —</option>
                    {availableDrones.map(d => (
                      <option key={d.droneId} value={d.droneId}>
                        {d.droneId} — {d.model} ({d.batteryLevel}% battery)
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleManualAssign}
                  disabled={assigning || !assignDeliveryId || !assignDroneId}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {assigning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Assign Mission
                </button>
              </div>
            </div>

            {/* Auto Dispatch */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Auto Dispatch Engine</h3>
              <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">Priority Heap Dispatcher</span>
                </div>
                <p className="text-[11px] text-orange-600 leading-relaxed">
                  Automatically selects the highest priority pending delivery and assigns the best available drone.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Pending: <strong className="text-gray-800">{pendingDeliveries.length}</strong></span>
                <span>Available Drones: <strong className="text-gray-800">{availableDrones.length}</strong></span>
              </div>
              <button
                onClick={handleDispatch}
                disabled={dispatching || pendingDeliveries.length === 0 || availableDrones.length === 0}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {dispatching ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                Priority Dispatch (Heap)
              </button>
              {pendingDeliveries.length === 0 && (
                <p className="text-[10px] text-gray-400 text-center mt-2">No pending deliveries to dispatch</p>
              )}
              {availableDrones.length === 0 && pendingDeliveries.length > 0 && (
                <p className="text-[10px] text-red-400 text-center mt-2">No available drones right now</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT DETAIL PANEL */}
      {selected && (
        <div className="w-72 bg-white border-l border-slate-100 flex flex-col shrink-0 overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Selected Delivery</h3>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusStyle(selected.status)}`}>
                {selected.status}
              </span>
            </div>
            <button onClick={() => setSelected(null)} className="p-1.5 text-gray-300 hover:text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-4 flex-1">
            {/* Package ID + icon */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{selected.deliveryId}</p>
                <p className="text-[11px] text-gray-400">{selected.package?.type || 'Package'}</p>
              </div>
            </div>

            {/* Package SVG */}
            <div className="flex justify-center py-1">
              <svg viewBox="0 0 80 70" className="w-20 h-16">
                <rect x="15" y="20" width="50" height="45" rx="4" fill="#fed7aa" />
                <rect x="15" y="20" width="50" height="14" rx="4" fill="#fdba74" />
                <line x1="40" y1="20" x2="40" y2="65" stroke="#fb923c" strokeWidth="1" />
                <line x1="15" y1="34" x2="65" y2="34" stroke="#fb923c" strokeWidth="1" />
                <rect x="28" y="5" width="24" height="18" rx="2" fill="#e2e8f0" />
                <path d="M28 14 Q40 8 52 14" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                {selected.package?.fragile && (
                  <text x="40" y="50" textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="bold">FRAGILE</text>
                )}
              </svg>
            </div>

            {/* Details rows */}
            <div className="space-y-2">
              {[
                { label: 'Customer', value: selected.customerName, icon: <Phone className="w-3.5 h-3.5 text-gray-400" /> },
                { label: 'From', value: warehouses.find(w => w.warehouseId === selected.warehouseId)?.name || selected.warehouseId, icon: <MapPin className="w-3.5 h-3.5 text-blue-400" /> },
                { label: 'To', value: destinations.find(d => d.destinationId === selected.destinationId)?.name || selected.destinationId, icon: <MapPin className="w-3.5 h-3.5 text-red-400" /> },
                { label: 'Priority', value: <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityStyle(selected.priority)}`}>{selected.priority}</span>, icon: <AlertCircle className="w-3.5 h-3.5 text-gray-400" /> },
                { label: 'Weight', value: selected.package ? `${selected.package.weight} kg` : '—', icon: <Package className="w-3.5 h-3.5 text-gray-400" /> },
                { label: 'Assigned Drone', value: selected.assignedDrone || 'Not yet assigned', icon: <Navigation className="w-3.5 h-3.5 text-indigo-400" /> },
                { label: 'Order ID', value: `ORD-${selected.deliveryId?.replace('PKG-', '')}`, icon: <QrCode className="w-3.5 h-3.5 text-gray-400" /> },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">{row.icon}</div>
                  <div className="flex-1 flex items-start justify-between gap-1">
                    <span className="text-[11px] text-gray-400 shrink-0">{row.label}</span>
                    <span className="text-[11px] font-semibold text-gray-700 text-right">{row.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* QR + Live Map mini */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-gray-700">Live Tracking</p>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <div className="rounded-xl overflow-hidden h-20 relative"
                style={{ background: 'linear-gradient(135deg, #e8f4ff 0%, #dbeafe 100%)' }}>
                <svg viewBox="0 0 200 80" className="absolute inset-0 w-full h-full">
                  <path d="M20 70 Q80 30 120 50 Q160 70 190 15" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 70 Q80 30 120 50 Q160 70 190 15" fill="none" stroke="rgba(249,115,22,0.2)" strokeWidth="8" />
                  {selected.status !== 'Pending' && selected.status !== 'Delivered' && (
                    <>
                      <circle cx="105" cy="51" r="5" fill="#f97316" />
                      <circle cx="105" cy="51" r="9" fill="rgba(249,115,22,0.3)" />
                    </>
                  )}
                  <circle cx="20" cy="70" r="4" fill="#22c55e" />
                  <circle cx="190" cy="15" r="4" fill="#ef4444" />
                </svg>
                <div className="absolute bottom-1 left-1 right-1 flex justify-between text-[9px] text-gray-500 px-0.5">
                  <span>Alt: 120m</span>
                  <span>45 km/h</span>
                  <span>Bat: {selected.assignedDrone ? '78%' : '—'}</span>
                  <span>{selected.assignedDrone ? 'Strong' : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Delivery History */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">Delivery History</p>
              </div>
              {selected.history && selected.history.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selected.history.map((h: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                        h.status === 'Delivered' ? 'bg-green-100' :
                        h.status === 'In Transit' ? 'bg-violet-100' :
                        h.status === 'Cancelled' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {h.status === 'Delivered'
                          ? <CheckCircle className="w-2.5 h-2.5 text-green-600" />
                          : h.status === 'Cancelled'
                          ? <X className="w-2.5 h-2.5 text-red-600" />
                          : <Clock className="w-2.5 h-2.5 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold text-gray-700">{h.status}</p>
                          <span className="text-[9px] text-gray-400">
                            {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-400 leading-tight truncate">{h.remarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 text-center py-2">No history yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOOK SHIPMENT MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="card p-6 w-[420px] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Book Shipment</h3>
                <p className="text-xs text-gray-400 mt-0.5">Create a new delivery manifest</p>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBook} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Customer Name *</label>
                <input
                  className="input-light"
                  placeholder="e.g. Rahul Mehta"
                  value={bCustomer}
                  onChange={e => setBCustomer(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Origin Warehouse *</label>
                  <select className="input-light" value={bWH} onChange={e => setBWH(e.target.value)} required>
                    <option value="">Select...</option>
                    {warehouses.map(w => (
                      <option key={w.warehouseId} value={w.warehouseId}>
                        {w.warehouseId} – {w.name.replace(/WH-[A-Z]\s*\(/, '').replace(')', '')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Destination *</label>
                  <select className="input-light" value={bDest} onChange={e => setBDest(e.target.value)} required>
                    <option value="">Select...</option>
                    {destinations.map(d => (
                      <option key={d.destinationId} value={d.destinationId}>
                        {d.destinationId} – {d.name.substring(0, 20)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Priority</label>
                  <select className="input-light" value={bPriority} onChange={e => setBPriority(e.target.value)}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Package Type</label>
                  <select className="input-light" value={bType} onChange={e => setBType(e.target.value)}>
                    <option>Electronics</option>
                    <option>Medical Supplies</option>
                    <option>Documents</option>
                    <option>Clothing</option>
                    <option>Groceries</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="25"
                    className="input-light"
                    placeholder="e.g. 2.4"
                    value={bWeight}
                    onChange={e => setBWeight(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bFragile}
                      onChange={e => setBFragile(e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-xs font-semibold text-gray-600">Fragile Package</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="btn-primary flex-1 justify-center"
                >
                  {booking ? <RotateCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Book Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;
