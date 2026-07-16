import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface DashboardProps {
  user: { name: string; email: string; role: string } | null;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    API.get('/analytics/metrics').then(r => setMetrics(r.data.data)).catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Arjun';

  const moduleCards = [
    {
      id: 'fleet',
      title: 'Fleet\nManagement',
      description: 'Monitor and control your entire drone fleet in real time.',
      iconColor: 'from-blue-400 to-cyan-400',
      bgGradient: 'bg-fleet-gradient',
      iconBg: 'bg-blue-100',
      arrow: 'bg-blue-500',
      img: (
        <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Hangar floor */}
          <ellipse cx="100" cy="105" rx="90" ry="10" fill="rgba(59,130,246,0.15)" />
          {/* Grid lines */}
          <line x1="10" y1="110" x2="190" y2="110" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5"/>
          {/* Drone body */}
          <rect x="75" y="55" width="50" height="20" rx="5" fill="#2563eb" opacity="0.9"/>
          {/* Drone arms */}
          <line x1="75" y1="65" x2="45" y2="50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
          <line x1="125" y1="65" x2="155" y2="50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
          <line x1="75" y1="70" x2="45" y2="85" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
          <line x1="125" y1="70" x2="155" y2="85" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
          {/* Rotors */}
          <ellipse cx="45" cy="50" rx="18" ry="5" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.6"/>
          <ellipse cx="155" cy="50" rx="18" ry="5" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.6"/>
          <ellipse cx="45" cy="85" rx="18" ry="5" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.6"/>
          <ellipse cx="155" cy="85" rx="18" ry="5" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.6"/>
          {/* Landing light */}
          <circle cx="100" cy="65" r="3" fill="#60a5fa" opacity="0.8"/>
          {/* Glow ring below drone */}
          <ellipse cx="100" cy="90" rx="30" ry="6" fill="rgba(59,130,246,0.2)"/>
        </svg>
      ),
    },
    {
      id: 'route',
      title: 'Route\nOptimization',
      description: 'Calculate optimal paths and avoid restricted zones.',
      iconColor: 'from-green-400 to-emerald-400',
      bgGradient: 'bg-route-gradient',
      iconBg: 'bg-green-100',
      arrow: 'bg-green-500',
      img: (
        <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* City grid */}
          {[0,1,2,3,4].map(i => (
            <rect key={`h${i}`} x={20+i*36} y="60" width="28" height="35" rx="3"
              fill={`rgba(16,185,129,${0.1+i*0.05})`} />
          ))}
          {/* Route path */}
          <path d="M30 100 Q60 50 100 70 Q140 90 170 30"
            fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray="none" opacity="0.9"/>
          {/* Start pin */}
          <circle cx="30" cy="100" r="6" fill="#3b82f6"/>
          <circle cx="30" cy="100" r="3" fill="white"/>
          {/* End pin */}
          <circle cx="170" cy="30" r="6" fill="#ef4444"/>
          <circle cx="170" cy="30" r="3" fill="white"/>
          {/* Waypoint */}
          <circle cx="100" cy="70" r="4" fill="#10b981"/>
          {/* Neon glow */}
          <path d="M30 100 Q60 50 100 70 Q140 90 170 30"
            fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'delivery',
      title: 'Delivery\nManagement',
      description: 'Monitor, track and manage all your deliveries in real-time.',
      iconColor: 'from-violet-400 to-purple-500',
      bgGradient: 'bg-delivery-gradient',
      iconBg: 'bg-violet-100',
      arrow: 'bg-violet-500',
      img: (
        <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Package box */}
          <rect x="70" y="70" width="60" height="45" rx="4" fill="#f97316" opacity="0.85"/>
          <rect x="70" y="70" width="60" height="12" rx="4" fill="#ea580c" opacity="0.9"/>
          <line x1="100" y1="70" x2="100" y2="115" stroke="#fdba74" strokeWidth="1"/>
          <line x1="70" y1="82" x2="130" y2="82" stroke="#fdba74" strokeWidth="1"/>
          {/* Drone above */}
          <rect x="85" y="40" width="30" height="12" rx="3" fill="#7c3aed" opacity="0.9"/>
          <line x1="85" y1="46" x2="65" y2="36" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="115" y1="46" x2="135" y2="36" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="65" cy="36" rx="12" ry="3" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
          <ellipse cx="135" cy="36" rx="12" ry="3" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7"/>
          {/* Wire from drone to package */}
          <line x1="100" y1="52" x2="100" y2="70" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
          {/* Location pin */}
          <circle cx="40" cy="100" r="8" fill="#6366f1"/>
          <circle cx="40" cy="100" r="4" fill="white"/>
          <path d="M40 108 L40 120" stroke="#6366f1" strokeWidth="2"/>
        </svg>
      ),
    },
    {
      id: 'analytics',
      title: 'Analytics\nDashboard',
      description: 'Track performance, analyze trends and make data-driven decisions.',
      iconColor: 'from-orange-400 to-amber-400',
      bgGradient: 'bg-analytics-gradient',
      iconBg: 'bg-orange-100',
      arrow: 'bg-orange-500',
      img: (
        <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Chart bars */}
          <rect x="25" y="80" width="20" height="35" rx="3" fill="#f97316" opacity="0.7"/>
          <rect x="55" y="60" width="20" height="55" rx="3" fill="#f97316" opacity="0.8"/>
          <rect x="85" y="45" width="20" height="70" rx="3" fill="#f97316" opacity="0.9"/>
          <rect x="115" y="55" width="20" height="60" rx="3" fill="#f97316" opacity="0.8"/>
          <rect x="145" y="35" width="20" height="80" rx="3" fill="#f97316"/>
          {/* Line trend */}
          <polyline points="35,75 65,55 95,40 125,50 155,30"
            fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="35" cy="75" r="3" fill="#fbbf24"/>
          <circle cx="65" cy="55" r="3" fill="#fbbf24"/>
          <circle cx="95" cy="40" r="3" fill="#fbbf24"/>
          <circle cx="125" cy="50" r="3" fill="#fbbf24"/>
          <circle cx="155" cy="30" r="3" fill="#fbbf24"/>
          {/* Donut chart */}
          <circle cx="170" cy="30" r="18" fill="none" stroke="#e0e7ff" strokeWidth="6"/>
          <circle cx="170" cy="30" r="18" fill="none" stroke="#6366f1" strokeWidth="6"
            strokeDasharray="85 28" strokeLinecap="round" transform="rotate(-90 170 30)"/>
          <text x="170" y="34" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#6366f1">91%</text>
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      {/* WELCOME BANNER */}
      <div
        className="relative rounded-3xl overflow-hidden mb-6 p-8"
        style={{
          background: 'linear-gradient(135deg, #eef4ff 0%, #e8f0fe 40%, #f5f0ff 100%)',
          border: '1px solid #dde6ff',
          minHeight: '160px',
        }}
      >
        {/* Text */}
        <div className="relative z-10">
          <p className="text-gray-500 text-base font-medium">Welcome back,</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-1 flex items-center gap-2">
            Captain {firstName}
            <span className="text-3xl" role="img" aria-label="wave">👋</span>
          </h1>
        </div>

        {/* AI Robot mascot illustration (decorative SVG) */}
        <div className="absolute right-80 bottom-0 h-full flex items-end" style={{ top: 0 }}>
          <svg viewBox="0 0 120 150" className="h-full" style={{ maxHeight: '155px' }}>
            {/* Drone body */}
            <ellipse cx="60" cy="80" rx="35" ry="25" fill="rgba(200,220,255,0.4)" />
            <rect x="40" y="65" width="40" height="28" rx="8" fill="#93c5fd"/>
            {/* Arms */}
            <line x1="40" y1="72" x2="15" y2="60" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round"/>
            <line x1="80" y1="72" x2="105" y2="60" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round"/>
            {/* Rotors */}
            <ellipse cx="15" cy="60" rx="14" ry="4" fill="rgba(96,165,250,0.4)" stroke="#60a5fa" strokeWidth="1"/>
            <ellipse cx="105" cy="60" rx="14" ry="4" fill="rgba(96,165,250,0.4)" stroke="#60a5fa" strokeWidth="1"/>
            {/* Camera lens */}
            <circle cx="60" cy="79" r="6" fill="#1e40af"/>
            <circle cx="60" cy="79" r="3" fill="#60a5fa"/>
            {/* Glow */}
            <ellipse cx="60" cy="100" rx="25" ry="6" fill="rgba(99,102,241,0.2)"/>
          </svg>
        </div>

        {/* Header widgets inline */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {/* Date */}
          <div className="bg-white/90 rounded-2xl px-4 py-3 flex flex-col items-center shadow-sm border border-white min-w-[90px]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-indigo-500 mb-1" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            </svg>
            <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">May 21, 2025</span>
            <span className="text-[10px] text-gray-400">Tuesday</span>
          </div>

          {/* AI Assistant  */}
          <div className="bg-white/90 rounded-2xl px-4 py-3 flex flex-col shadow-sm border border-white max-w-[160px]">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] font-bold text-green-600">AI Assistant</span>
            </div>
            <span className="text-[11px] text-gray-600 leading-snug">All systems operational. 16 drones are flying efficiently.</span>
          </div>
        </div>

        {/* Stats strip */}
        {metrics && (
          <div className="absolute bottom-4 left-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-indigo-700">{metrics.deliveryMetrics?.totalDeliveries || 156}</span>
              <div>
                <p className="text-[10px] text-gray-500 font-medium">Total Deliveries</p>
                <p className="text-[10px] text-green-500">↑ 12% vs yesterday</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOUR MODULE CARDS GRID */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {moduleCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={`relative rounded-3xl overflow-hidden ${card.bgGradient} border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left group`}
            style={{ minHeight: '200px' }}
          >
            {/* Top left: icon + title */}
            <div className="absolute top-5 left-5 z-10">
              {/* Icon Box */}
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center mb-3 shadow-sm`}>
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${card.iconColor} flex items-center justify-center`}>
                  {card.id === 'fleet' && (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M17 12h-1.5a2.5 2.5 0 0 0-5 0H9M5 12c0 0-1-7 7-7s7 7 7 7M12 19v-7" />
                    </svg>
                  )}
                  {card.id === 'route' && (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  )}
                  {card.id === 'delivery' && (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  )}
                  {card.id === 'analytics' && (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight whitespace-pre-line">
                {card.title}
              </h2>
            </div>

            {/* Bottom right: SVG illustration */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-end justify-center p-3 opacity-90">
              {card.img}
            </div>

            {/* Arrow button */}
            <div className={`absolute bottom-5 right-5 w-9 h-9 rounded-full ${card.arrow} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
