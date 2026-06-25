import { cn } from '../../utils/cn';

interface StatisticCardProps {
  name: string;
  value: string | number;
  icon: string;
  iconColorClass?: string;
  bgIconClass?: string;
}

export function StatisticCard({
  name,
  value,
  icon,
  iconColorClass = "text-latte",
  bgIconClass = "bg-latte/10"
}: StatisticCardProps) {
  return (
    <div className="bg-cream p-6 rounded-2xl border border-line flex justify-between items-center shadow-sm">
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">{name}</p>
        <p className="font-display text-2xl text-coffee font-bold">{value}</p>
      </div>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", bgIconClass, iconColorClass)}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
    </div>
  );
}
