import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, change, changeLabel, icon: Icon, accent = 'primary', style = {} }) {
  const accentColors = {
    primary: '#00F0FF',
    secondary: '#BDFF00',
    tertiary: '#BF5AF2',
    danger: '#ff6b6b',
  };
  const color = accentColors[accent] || accentColors.primary;
  const isPositive = change >= 0;

  return (
    <div className="card animate-fade-up" style={{
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 100, height: 100, borderRadius: '50%',
        background: color, opacity: 0.05, filter: 'blur(30px)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}14`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={color} />
          </div>
        )}
      </div>

      <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>

      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '2px 8px', borderRadius: 20,
            background: isPositive ? 'rgba(189,255,0,0.1)' : 'rgba(255,107,107,0.1)',
            color: isPositive ? '#BDFF00' : '#ff6b6b',
            fontSize: 11, fontWeight: 700,
          }}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isPositive ? '+' : ''}{change}%
          </div>
          {changeLabel && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
