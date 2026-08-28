interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  change?: { value: number; isPositive: boolean };
}

const colorConfig = {
  blue: {
    gradient: 'from-[#8B8CFF] to-[#a5a6ff]',
    soft: 'bg-soft-violet',
    ring: 'ring-primary-100',
    iconBg: 'bg-gradient-to-br from-[#8B8CFF] to-[#6a6acc]',
  },
  green: {
    gradient: 'from-emerald-400 to-teal-400',
    soft: 'bg-soft-mint',
    ring: 'ring-emerald-100',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
  },
  purple: {
    gradient: 'from-fuchsia-400 to-purple-400',
    soft: 'bg-soft-lavender',
    ring: 'ring-purple-100',
    iconBg: 'bg-gradient-to-br from-violet-400 to-fuchsia-400',
  },
  amber: {
    gradient: 'from-amber-400 to-orange-400',
    soft: 'bg-soft-peach',
    ring: 'ring-amber-100',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-400',
  },
  red: {
    gradient: 'from-rose-400 to-pink-400',
    soft: 'bg-soft-pink',
    ring: 'ring-rose-100',
    iconBg: 'bg-gradient-to-br from-[#ff6b80] to-[#ff8e9e]',
  },
};

const iconMap: Record<string, string> = {
  users: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  currency: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  default: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
};

export default function StatsCard({ label, value, icon, color, change }: StatsCardProps) {
  const cfg = colorConfig[color];
  const path = iconMap[icon] || iconMap.default;
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ${cfg.ring} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
      {/* soft decorative blob */}
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${cfg.soft} opacity-60 blur-2xl transition-opacity group-hover:opacity-80`} />
      <div className={`absolute -right-4 top-6 h-16 w-16 rounded-full bg-gradient-to-br ${cfg.gradient} opacity-10`} />
      <div className="relative flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.iconBg} shadow-md ring-1 ring-white/20`}>
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={path} />
          </svg>
        </div>
        {change && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${change.isPositive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'}`}>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={change.isPositive ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} /></svg>
            {Math.abs(change.value)}%
          </span>
        )}
      </div>
      <p className="relative mt-4 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="relative mt-1 text-sm font-medium text-gray-500">{label}</p>
      <div className={`mt-3 h-1 w-12 rounded-full bg-gradient-to-r ${cfg.gradient} opacity-80`} />
    </div>
  );
}
