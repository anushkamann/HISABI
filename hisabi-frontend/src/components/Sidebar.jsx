import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, BarChart2, ArrowLeftRight, FileText, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: Wallet, label: 'Budgets' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'H';

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 24px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#0a1015', fontFamily: 'Manrope, sans-serif',
          flexShrink: 0,
        }}>H</div>
        <div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>Hisabi</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Finance</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Pro Upgrade */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(191,90,242,0.08))',
        border: '1px solid rgba(0,240,255,0.15)',
        borderRadius: 12, padding: '14px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Manrope, sans-serif', marginBottom: 4 }}>PRO PLAN</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 12 }}>Access advanced analytics & deeper insights</div>
        <button className="btn-primary" style={{ width: '100%', fontSize: 12, padding: '8px 14px' }}>Upgrade to Pro</button>
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="nav-item">
          <HelpCircle size={16} />
          <span>Support</span>
        </div>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      {/* User */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 8px 0', borderTop: '1px solid var(--border)', marginTop: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#0a1015',
        }}>{initials}</div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || ''}
          </div>
        </div>
      </div>
    </aside>
  );
}
