export function Warnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
        <span>⚠</span> Предупреждения и замечания
      </h3>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
            <span className="mt-0.5 shrink-0">•</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
