import { useState } from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onAddTransaction }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 28px', borderBottom: '1px solid var(--border)',
      background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 30,
    }}>
      {/* Greeting */}
      <div>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>
          {greeting}, {firstName}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Here's what's happening with your portfolio today.
        </p>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            style={{ paddingLeft: 34, width: 200, fontSize: 13 }}
          />
        </div>

        {/* Bell */}
        <button style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dim)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          <Bell size={15} />
        </button>

        {/* Add Expense */}
        <button className="btn-primary" onClick={onAddTransaction} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} />
          Add Expense
        </button>

        {/* Markets badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          background: 'rgba(189,255,0,0.08)', border: '1px solid rgba(189,255,0,0.2)',
          borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#BDFF00',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#BDFF00', animation: 'pulse 2s infinite' }} />
          MARKETS OPEN
        </div>
      </div>
    </header>
  );
}
