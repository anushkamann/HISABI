import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { getBudgets, addBudget, getCategories } from '../services/api';
import { DUMMY_BUDGETS, DUMMY_CATEGORIES } from '../services/dummyData';

// Budgets from backend may look like:
// { category, limit, spent }  |  { categoryName, budgetLimit, amountSpent }  |  { name, amount, usedAmount }
function normBudget(b) {
  return {
    _id:      b._id || b.id || `${b.category || b.name || b.categoryName}-${Date.now()}`,
    category: b.category || b.categoryName || b.name || 'Other',
    limit:    Number(b.limit ?? b.budgetLimit ?? b.amount ?? 0),
    spent:    Number(b.spent ?? b.amountSpent ?? b.usedAmount ?? 0),
  };
}

function normCategories(data) {
  if (!Array.isArray(data)) return DUMMY_CATEGORIES;
  return data.map(c => (typeof c === 'string' ? c : c.name || c.label || 'Other'));
}

function BudgetCard({ budget }) {
  const pct       = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
  const status    = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'ok';
  const color     = status === 'danger' ? '#ff6b6b' : status === 'warning' ? '#ff9500' : '#00F0FF';
  const remaining = budget.limit - budget.spent;

  return (
    <div className="card animate-fade-up" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15 }}>{budget.category}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
            ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: status === 'danger' ? 'rgba(255,107,107,0.1)' : status === 'warning' ? 'rgba(255,149,0,0.1)' : 'rgba(0,240,255,0.1)',
          color,
        }}>
          {pct.toFixed(0)}%
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 10, width: `${pct}%`,
          background: color, transition: 'width 0.6s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Spent</span>
        <span style={{ fontSize: 11, color: remaining >= 0 ? '#BDFF00' : '#ff6b6b', fontWeight: 600 }}>
          {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
        </span>
      </div>
    </div>
  );
}

export default function Budgets() {
  const [budgets,    setBudgets]    = useState([]);
  const [categories, setCategories] = useState(DUMMY_CATEGORIES);
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState({ category: '', limit: '' });
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, cRes] = await Promise.allSettled([getBudgets(), getCategories()]);

        if (bRes.status === 'fulfilled') {
          const raw  = bRes.value?.data;
          const list = Array.isArray(raw) ? raw
            : Array.isArray(raw?.budgets) ? raw.budgets
            : Array.isArray(raw?.data)    ? raw.data : [];
          setBudgets(list.length ? list.map(normBudget) : DUMMY_BUDGETS.map(normBudget));
        } else {
          setBudgets(DUMMY_BUDGETS.map(normBudget));
        }

        if (cRes.status === 'fulfilled') {
          const cats = normCategories(cRes.value?.data?.categories || cRes.value?.data);
          if (cats.length) setCategories(cats);
        }
      } catch {
        setBudgets(DUMMY_BUDGETS.map(normBudget));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAdd = async () => {
    const e = {};
    if (!form.category) e.category = 'Required';
    if (!form.limit || isNaN(form.limit) || Number(form.limit) <= 0) e.limit = 'Enter valid amount';
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = { category: form.category, limit: Number(form.limit) };
    try {
      const res     = await addBudget(payload);
      const created = normBudget(res.data?.budget || res.data?.data || res.data);
      setBudgets(prev => [...prev, created]);
    } catch {
      setBudgets(prev => [...prev, normBudget({ ...payload, _id: Date.now().toString(), spent: 0 })]);
    }
    setShowModal(false);
    setForm({ category: '', limit: '' });
    setErrors({});
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget  = budgets.filter(b => b.spent > b.limit).length;

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22 }}>Budgets</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Track and manage spending limits</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Create Budget
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`,                                         color: 'var(--primary)' },
          { label: 'Total Spent',  value: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,   color: '#BDFF00' },
          { label: 'Over Budget',  value: `${overBudget} categories`,                                                 color: overBudget > 0 ? '#ff6b6b' : '#BDFF00' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {loading
          ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading budgets…</div>
          : budgets.length
            ? budgets.map(b => <BudgetCard key={b._id} budget={b} />)
            : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No budgets yet. Click "Create Budget" to start.</div>
        }
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18 }}>Create Budget</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4, display: 'block' }}>{errors.category}</span>}
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Monthly Limit ($)</label>
                <input className="input-field" type="number" placeholder="e.g. 500"
                  value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} />
                {errors.limit && <span style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4, display: 'block' }}>{errors.limit}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-secondary" onClick={() => { setShowModal(false); setErrors({}); }} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary"   onClick={handleAdd} style={{ flex: 1 }}>Create Budget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}