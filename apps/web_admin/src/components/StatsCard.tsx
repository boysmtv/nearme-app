interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  change?: { value: number; isPositive: boolean };
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
};

export default function StatsCard({ label, value, icon, color, change }: StatsCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <span className="text-lg">{icon === 'users' ? '👥' : icon === 'building' ? '🏢' : icon === 'calendar' ? '📅' : icon === 'currency' ? '💰' : icon === 'star' ? '⭐' : '📊'}</span>
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-medium ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
