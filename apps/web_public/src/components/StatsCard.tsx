interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  change?: { value: number; isPositive: boolean };
}

const colorMap = {
  blue: { bg: 'bg-[#e8f2ff]', text: 'text-[#5a7ab3]', ring: 'ring-[#dbe9ff]', iconBg: 'from-[#e8f2ff] to-[#e8e8ff]' },
  green: { bg: 'bg-[#e6f7ee]', text: 'text-emerald-600', ring: 'ring-emerald-100', iconBg: 'from-[#e6f7ee] to-[#e8f2ff]' },
  purple: { bg: 'bg-[#f0e8ff]', text: 'text-[#8B8CFF]', ring: 'ring-[#e8e8ff]', iconBg: 'from-[#f0e8ff] to-[#e8e8ff]' },
  amber: { bg: 'bg-[#fff4d6]', text: 'text-amber-600', ring: 'ring-amber-100', iconBg: 'from-[#fff4d6] to-[#ffe8ec]' },
  red: { bg: 'bg-[#ffe8ec]', text: 'text-rose-600', ring: 'ring-rose-100', iconBg: 'from-[#ffe8ec] to-[#fff4d6]' },
};

export default function StatsCard({ label, value, icon, color, change }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ${c.ring} transition-all hover:shadow-md hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.iconBg} ${c.text} shadow-sm`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        {change && (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              change.isPositive ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
            }`}
          >
            {change.isPositive ? (
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {Math.abs(change.value)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-black text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${c.iconBg} opacity-60`} />
    </div>
  );
}
