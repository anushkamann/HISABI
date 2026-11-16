import { Edit2, Trash2 } from 'lucide-react';

const CATEGORY_ICONS = {
  Food: '🛒', Transport: '🚗', Entertainment: '🎬', Health: '💊',
  Technology: '💻', Investment: '📈', Salary: '💰', Freelance: '🎯',
  Housing: '🏠', Shopping: '🛍️', Other: '📦',
};

const CATEGORY_COLORS = {
  Food: '#BDFF00', Transport: '#00F0FF', Entertainment: '#BF5AF2',
  Health: '#ff6b6b', Technology: '#00F0FF', Investment: '#BDFF00',
  Salary: '#00F0FF', Freelance: '#BF5AF2', Housing: '#ff9500', Shopping: '#ff6b6b', Other: '#8892A4',
};

function TransactionRow({ tx, onEdit, onDelete, showActions = false }) {
  const isIncome = tx.amount > 0 || tx.type === 'income';
  const amount = Math.abs(tx.amount);
  const icon = CATEGORY_ICONS[tx.category] || '💳';
  const color = CATEGORY_COLORS[tx.category] || '#8892A4';
  const date = tx.date ? new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${color}14`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {tx.title || tx.description}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {tx.category} · {date}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14,
            color: isIncome ? '#BDFF00' : '#ff6b6b',
          }}>
            {isIncome ? '+' : '-'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {tx.status && (
            <div style={{
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
              color: tx.status === 'completed' ? '#BDFF00' : tx.status === 'pending' ? '#ff9500' : 'var(--text-muted)',
            }}>
              {tx.status}
            </div>
          )}
        </div>

        {showActions && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onEdit(tx)}
              style={{
                width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--surface-2)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onDelete(tx._id || tx.id)}
              style={{
                width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,80,80,0.2)',
                background: 'rgba(255,80,80,0.08)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#ff6b6b',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,80,80,0.08)'}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransactionList({ transactions, onEdit, onDelete, showActions = false, limit }) {
  const displayed = limit ? transactions.slice(0, limit) : transactions;

  if (!displayed.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        No transactions found
      </div>
    );
  }

  return (
    <div>
      {displayed.map((tx) => (
        <TransactionRow key={tx._id || tx.id} tx={tx} onEdit={onEdit} onDelete={onDelete} showActions={showActions} />
      ))}
    </div>
  );
}
