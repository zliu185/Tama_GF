interface StatusBarsProps {
  stats: Array<{ label: string; value: number }>;
}

function pickBarColor(value: number) {
  if (value <= 25) return 'bg-red-400';
  if (value <= 55) return 'bg-amber-400';
  return 'bg-emerald-400';
}

export function StatusBars({ stats }: StatusBarsProps) {
  return (
    <div className="space-y-3">
      {stats.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-plum/80">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-rosemilk/70">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${pickBarColor(item.value)}`}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
