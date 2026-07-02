export function Warnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <div style={{ background: '#FFFBEB', borderRadius: 14, border: '1px solid #FDE68A', padding: '12px 16px' }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>⚠️</span>
        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400E' }}>
          Предупреждения
        </span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {warnings.map((w, i) => (
          <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#78350F' }}>
            <span style={{ color: '#D97706', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>·</span>
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
