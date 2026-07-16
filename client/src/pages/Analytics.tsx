import React, { useEffect, useState } from 'react';
import API from '../services/api';
import {
  TrendingUp, TrendingDown, Download, BarChart2, Activity,
  Package, Battery, MapPin, Clock, Users, ChevronRight
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [chartMode, setChartMode] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          API.get('/analytics/metrics'),
          API.get('/analytics/snapshots'),
        ]);
        setMetrics(mRes.data.data);
        setSnapshots(sRes.data.data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const res = await API.get('/analytics/export', { params: { format: 'csv' }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `drone_report_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {}
    setDownloading(false);
  };

  // Build chart data from snapshots
  const chartData = snapshots.length > 0
    ? snapshots.slice(0, 7).reverse().map((s, i) => {
        const d = new Date(s.snapshotDate);
        return {
          label: `May ${d.getDate()}`,
          deliveries: 100 + Math.floor(Math.random() * 100),
          success: s.deliverySuccessRate,
          utilization: s.fleetUtilization,
        };
      })
    : [
        { label: 'May 15', deliveries: 100, success: 98, utilization: 87 },
        { label: 'May 16', deliveries: 130, success: 97, utilization: 89 },
        { label: 'May 17', deliveries: 115, success: 96, utilization: 88 },
        { label: 'May 18', deliveries: 185, success: 98, utilization: 91 },
        { label: 'May 19', deliveries: 182, success: 99, utilization: 92 },
        { label: 'May 20', deliveries: 160, success: 98, utilization: 91 },
        { label: 'May 21', deliveries: 200, success: 98, utilization: 95 },
      ];

  const maxDeliveries = Math.max(...chartData.map(d => d.deliveries));

  const fleetDrones = [
    { id: 'D-14 Falcon X1', success: 98, battery: 95, deliveries: 156 },
    { id: 'D-07 Falcon Pro', success: 96, battery: 92, deliveries: 132 },
    { id: 'D-03 AeroMax 4K', success: 94, battery: 90, deliveries: 118 },
    { id: 'D-12 SkyRunner X1', success: 93, battery: 88, deliveries: 110 },
    { id: 'D-18 Falcon Pro', success: 92, battery: 87, deliveries: 105 },
  ];

  const metricCards = [
    {
      label: "Today's Deliveries",
      value: metrics?.deliveryMetrics?.totalDeliveries || 156,
      change: '+12%', up: true,
      icon: <Package className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50',
    },
    {
      label: 'Success Rate',
      value: `${metrics?.deliveryMetrics?.successRate || 98}%`,
      change: '+3%', up: true,
      icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-50',
    },
    {
      label: 'Average Delivery Time',
      value: '18 min',
      change: '-2 min', up: false,
      icon: <Clock className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-50',
    },
    {
      label: 'Total Distance',
      value: '1,240 km',
      change: '+8%', up: true,
      icon: <MapPin className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50',
    },
    {
      label: 'Battery Efficiency',
      value: `${metrics?.fleetMetrics?.avgBattery || 91}%`,
      change: '+5%', up: true,
      icon: <Battery className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50',
    },
    {
      label: 'Total Revenue',
      value: '₹48,000',
      change: '+15%', up: true,
      icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50',
    },
  ];

  const aiInsights = [
    { icon: <TrendingUp className="w-3.5 h-3.5 text-purple-500" />, text: 'Deliveries increased by 18% compared to last week.' },
    { icon: <Package className="w-3.5 h-3.5 text-purple-500" />, text: 'Warehouse WH-A handled 42% of total deliveries.' },
    { icon: <Activity className="w-3.5 h-3.5 text-purple-500" />, text: 'Drone D-14 is your highest performing drone.' },
    { icon: <Battery className="w-3.5 h-3.5 text-purple-500" />, text: 'Battery usage reduced by 12% compared to last week.' },
    { icon: <Clock className="w-3.5 h-3.5 text-purple-500" />, text: 'Peak delivery hours are between 10 AM – 2 PM.' },
  ];

  return (
    <div className="overflow-y-auto h-full">
      {/* BANNER */}
      <div className="page-banner px-8 py-6" style={{ background: 'linear-gradient(135deg, #f5f0ff 0%, #ede0ff 60%, #e8d4ff 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Track performance, analyze trends and make data-driven decisions.</p>
          </div>
          {/* AI assistant bubble inline */}
          <div className="bg-white/90 rounded-2xl px-4 py-2.5 shadow-sm border border-white/80 max-w-[200px]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-bold text-indigo-600">AI Assistant</span>
            </div>
            <p className="text-[11px] text-gray-500">Your system is performing exceptionally well today! All metrics are positive.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Metric stat cards */}
        <div className="grid grid-cols-6 gap-3">
          {metricCards.map(c => (
            <div key={c.label} className="stat-card">
              <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center ${c.color} mb-2`}>
                {c.icon}
              </div>
              <p className="text-xl font-extrabold text-gray-900">{c.value}</p>
              <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{c.label}</p>
              <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-semibold ${c.up ? 'text-green-500' : 'text-red-500'}`}>
                {c.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {c.change} vs yesterday
              </div>
            </div>
          ))}
        </div>

        {/* Main chart + AI insights */}
        <div className="grid grid-cols-4 gap-4">
          {/* Delivery Performance chart */}
          <div className="card p-5 col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Delivery Performance</h3>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setChartMode(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartMode === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-slate-100'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-gray-500">
                  <span>May 15 – May 21, 2025</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4">
              {[
                { label: 'Deliveries', color: '#7c3aed', filled: true },
                { label: 'Success Rate', color: '#94a3b8', filled: false },
                { label: 'Avg. Delivery Time', color: '#94a3b8', filled: false },
                { label: 'Distance', color: '#94a3b8', filled: false },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 cursor-pointer">
                  <span className={`w-3 h-3 rounded-full border-2 ${l.filled ? '' : 'bg-transparent'}`}
                    style={{ borderColor: l.color, background: l.filled ? l.color : 'transparent' }} />
                  <span className="text-xs text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>

            {/* SVG Area Line Chart */}
            <div className="relative h-52">
              <svg viewBox="0 0 700 200" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 50, 100, 150, 200, 250].map(y => (
                  <line key={y} x1="50" y1={180 - y * 0.7} x2="680" y2={180 - y * 0.7}
                    stroke="#f1f5f9" strokeWidth="1"/>
                ))}
                {/* Y-axis labels */}
                {[0, 50, 100, 150, 200, 250].map(y => (
                  <text key={y} x="40" y={185 - y * 0.7} textAnchor="end" fontSize="9" fill="#94a3b8">{y}</text>
                ))}

                {/* Area fill */}
                {(() => {
                  const pts = chartData.map((d, i) => {
                    const x = 80 + i * 88;
                    const y = 180 - (d.deliveries / maxDeliveries) * 155;
                    return `${x},${y}`;
                  }).join(' ');
                  const first = `80,${180 - (chartData[0].deliveries / maxDeliveries) * 155}`;
                  const last = `${80 + (chartData.length - 1) * 88},${180 - (chartData[chartData.length-1].deliveries / maxDeliveries) * 155}`;
                  return (
                    <>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02"/>
                        </linearGradient>
                      </defs>
                      <polygon
                        points={`80,180 ${pts} ${80 + (chartData.length - 1) * 88},180`}
                        fill="url(#areaGrad)"
                      />
                      <polyline
                        points={pts}
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}

                {/* Data points + tooltip */}
                {chartData.map((d, i) => {
                  const x = 80 + i * 88;
                  const y = 180 - (d.deliveries / maxDeliveries) * 155;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="#7c3aed" stroke="white" strokeWidth="2"/>
                      {i === 4 && (
                        <g>
                          <rect x={x - 30} y={y - 42} width="72" height="34" rx="6" fill="#1e293b"/>
                          <text x={x + 6} y={y - 24} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
                          <text x={x + 6} y={y - 13} textAnchor="middle" fontSize="9" fill="white">Deliveries: {d.deliveries}</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {chartData.map((d, i) => (
                  <text key={i} x={80 + i * 88} y="196" textAnchor="middle" fontSize="9" fill="#94a3b8">
                    {d.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* AI Insights */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">AI Insights</h3>
              <button className="text-xs text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2.5 pb-3 border-b border-slate-50 last:border-0">
                  <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                    {insight.icon}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Performance + Route Analytics + Battery Analytics + Heatmap */}
        <div className="grid grid-cols-4 gap-4">
          {/* Fleet Performance */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Fleet Performance</h3>
              <button className="text-xs text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[10px] text-gray-400 pb-1 border-b border-slate-100">
                <span className="flex-1"></span>
                <span className="w-16 text-center">Success Rate</span>
                <span className="w-10 text-center">Battery</span>
                <span className="w-10 text-center">Del.</span>
              </div>
              {fleetDrones.map((drone) => (
                <div key={drone.id} className="flex items-center gap-2">
                  {/* Mini drone SVG */}
                  <svg viewBox="0 0 30 20" className="w-8 h-5 shrink-0">
                    <rect x="8" y="6" width="14" height="8" rx="2" fill="#6366f1" opacity="0.8"/>
                    <line x1="8" y1="9" x2="2" y2="5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="22" y1="9" x2="28" y2="5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="8" y1="12" x2="2" y2="16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="22" y1="12" x2="28" y2="16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-700 truncate">{drone.id}</p>
                  </div>
                  <span className="w-16 text-center text-[11px] font-bold text-green-600">{drone.success}%</span>
                  <span className="w-10 text-center text-[11px] font-bold text-blue-600">{drone.battery}%</span>
                  <span className="w-10 text-center text-[11px] font-bold text-gray-700">{drone.deliveries}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Route Analytics */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Route Analytics</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Average Distance', value: '12.4 km', icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" /> },
                { label: 'Shortest Route', value: '2.1 km', icon: <Activity className="w-3.5 h-3.5 text-green-400" /> },
                { label: 'Longest Route', value: '28.7 km', icon: <TrendingUp className="w-3.5 h-3.5 text-orange-400" /> },
                { label: 'Avg. Battery Consumption', value: '42%', icon: <Battery className="w-3.5 h-3.5 text-yellow-400" /> },
                { label: 'Most Used Warehouse', value: 'WH-A (Central Hub)', icon: <Package className="w-3.5 h-3.5 text-blue-400" /> },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">{row.icon}</div>
                  <span className="text-[11px] text-gray-500 flex-1">{row.label}</span>
                  <span className="text-[11px] font-bold text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Battery Analytics */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Battery Analytics</h3>
            {/* Donut chart */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <circle cx="40" cy="40" r="28" fill="none" stroke="#f1f5f9" strokeWidth="12"/>
                  <circle cx="40" cy="40" r="28" fill="none" stroke="#6366f1" strokeWidth="12"
                    strokeDasharray="88 88" strokeLinecap="round" transform="rotate(-90 40 40)"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-gray-800">91%</p>
                    <p className="text-[9px] text-gray-400">Efficiency</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: 'Average Usage', value: '42%', color: '#6366f1' },
                  { label: 'Charging Efficiency', value: '93%', color: '#22c55e' },
                  { label: 'Total Charges', value: 125, color: '#3b82f6' },
                  { label: 'Battery Health', value: 'Good', color: '#f59e0b' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }}></span>
                    <span className="text-[10px] text-gray-400 flex-1">{r.label}</span>
                    <span className="text-[10px] font-bold text-gray-700">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Heatmap */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-sm">Delivery Heatmap</h3>
              <button className="text-xs text-indigo-600 hover:underline">View Full Map</button>
            </div>
            <div
              className="rounded-xl h-32 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #c7d2fe 0%, #e0e7ff 50%, #ddd6fe 100%)' }}
            >
              <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full">
                {/* Grid */}
                {[40,80,120,160].map(x => <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>)}
                {[25,50,75].map(y => <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>)}
                {/* Heatmap spots */}
                <circle cx="80" cy="50" r="30" fill="rgba(139,92,246,0.4)"/>
                <circle cx="80" cy="50" r="15" fill="rgba(139,92,246,0.6)"/>
                <circle cx="140" cy="35" r="20" fill="rgba(99,102,241,0.35)"/>
                <circle cx="40" cy="70" r="15" fill="rgba(139,92,246,0.3)"/>
                <circle cx="160" cy="75" r="12" fill="rgba(99,102,241,0.25)"/>
                {/* Pins */}
                <circle cx="80" cy="50" r="5" fill="#7c3aed"/>
                <circle cx="140" cy="35" r="4" fill="#f97316"/>
                <circle cx="40" cy="70" r="4" fill="#22c55e"/>
                <circle cx="160" cy="75" r="3" fill="#f59e0b"/>
              </svg>
              {/* Color scale */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                <span className="text-[9px] text-gray-500">Low</span>
                <div className="flex-1 h-1.5 rounded-full"
                  style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.2), rgba(99,102,241,0.9))' }} />
                <span className="text-[9px] text-gray-500">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Queue Analytics + Peak Hours + Predictions + Reports */}
        <div className="grid grid-cols-4 gap-4">
          {/* Delivery Queue Analytics */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Delivery Queue Analytics</h3>
            <div className="flex items-center gap-4">
              {/* Donut */}
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <circle cx="40" cy="40" r="28" fill="none" stroke="#f1f5f9" strokeWidth="10"/>
                  <circle cx="40" cy="40" r="28" fill="none" stroke="#6366f1" strokeWidth="10"
                    strokeDasharray="38 140" strokeLinecap="round" transform="rotate(-90 40 40)"/>
                  <circle cx="40" cy="40" r="28" fill="none" stroke="#f97316" strokeWidth="10"
                    strokeDasharray="57 140" strokeLinecap="round" transform="rotate(187 40 40)"/>
                  <circle cx="40" cy="40" r="28" fill="none" stroke="#22c55e" strokeWidth="10"
                    strokeDasharray="45 140" strokeLinecap="round" transform="rotate(278 40 40)"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sm font-extrabold text-gray-800">83</p>
                  <p className="text-[8px] text-gray-400">Total</p>
                  <p className="text-[8px] text-gray-400">Pending</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: 'High Priority', count: 18, pct: '22%', color: 'bg-indigo-500' },
                  { label: 'Medium Priority', count: 34, pct: '41%', color: 'bg-orange-400' },
                  { label: 'Low Priority', count: 31, pct: '37%', color: 'bg-green-400' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${r.color}`}></span>
                    <span className="text-[10px] text-gray-500 flex-1">{r.label}</span>
                    <span className="text-[10px] font-semibold text-gray-700">{r.count}</span>
                    <span className="text-[10px] text-gray-400">({r.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours Bar Chart */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Peak Hours (Deliveries)</h3>
            <div className="flex items-end gap-1 h-24">
              {[
                { label: '12AM', h: 10 },
                { label: '4AM', h: 5 },
                { label: '8AM', h: 35 },
                { label: '12PM', h: 80 },
                { label: '4PM', h: 90 },
                { label: '8PM', h: 65 },
                { label: '11PM', h: 20 },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${item.h}%`,
                      background: item.h >= 70 ? 'linear-gradient(180deg, #7c3aed, #a78bfa)' : 'linear-gradient(180deg, #c4b5fd, #e0d8ff)',
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[8px] text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Predictions */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Predictions</h3>
              <button className="text-xs text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-indigo-50 p-3">
                <p className="text-[10px] text-indigo-500 font-semibold mb-1">Expected Deliveries</p>
                <p className="text-[10px] text-gray-400">Tomorrow</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">174</p>
                <p className="text-[10px] text-green-500 font-semibold">↑ 11% vs today</p>
                <div className="mt-2 h-6">
                  <svg viewBox="0 0 60 20" className="w-full h-full">
                    <polyline points="0,15 10,10 20,12 30,6 40,8 50,4 60,7"
                      fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="rounded-xl bg-orange-50 p-3">
                <p className="text-[10px] text-orange-500 font-semibold mb-1">Expected Revenue</p>
                <p className="text-[10px] text-gray-400">Tomorrow</p>
                <p className="text-xl font-extrabold text-gray-900 mt-1">₹52,800</p>
                <p className="text-[10px] text-green-500 font-semibold">↑ 10% vs today</p>
                <div className="mt-2 h-6">
                  <svg viewBox="0 0 60 20" className="w-full h-full">
                    <polyline points="0,16 10,12 20,14 30,8 40,10 50,5 60,6"
                      fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Reports</h3>
              <button className="text-xs text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Daily Performance Report', date: 'May 21, 2025' },
                { name: 'Weekly Performance Report', date: 'May 15 – May 21, 2025' },
                { name: 'Monthly Performance Report', date: 'May 2025' },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-2 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-700 truncate">{r.name}</p>
                    <p className="text-[10px] text-gray-400">{r.date}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleExportCSV}
                      className="px-2 py-1 rounded-lg bg-red-50 text-[9px] font-bold text-red-500 hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-2.5 h-2.5" /> PDF
                    </button>
                    <button
                      onClick={handleExportCSV}
                      disabled={downloading}
                      className="px-2 py-1 rounded-lg bg-green-50 text-[9px] font-bold text-green-600 hover:bg-green-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <Download className="w-2.5 h-2.5" /> CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
