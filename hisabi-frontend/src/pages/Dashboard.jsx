import { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { PortfolioChart, SpendingDonut } from '../components/ChartComponent';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import {
  getTransactions, addTransaction, deleteTransaction,
  updateTransaction, getCategories,
} from '../services/api';
import { DUMMY_TRANSACTIONS, DUMMY_CHART_DATA, DUMMY_DONUT_DATA, DUMMY_CATEGORIES } from '../services/dummyData';

// ── helpers ───────────────────────────────────────────────────────────────────

// Normalise a raw transaction from the backend into a consistent shape
function normTx(t) {
  return {
    ...t,
    _id:         t._id || t.id,
    title:       t.title || t.description || t.name || 'Transaction',
    description: t.description || t.title || '',
    amount:      Number(t.amount) || 0,
    type:        t.type || (Number(t.amount) >= 0 ? 'income' : 'expense'),
    category:    t.category || 'Other',
    date:        t.date || t.createdAt || new Date().toISOString(),
    status:      t.status || 'completed',
  };
}

// Normalise a raw categories response — backend may return [{name}, "string", ...]
function normCategories(data) {
  if (!Array.isArray(data)) return DUMMY_CATEGORIES;
  return data.map(c => (typeof c === 'string' ? c : c.name || c.label || 'Other'));
}

// Build monthly income/expense chart data from transactions
function buildChartData(transactions) {
  const map = {};
  transactions.forEach(t => {
    const d    = new Date(t.date);
    const key  = d.toLocaleString('en-US', { month: 'short' });
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0, order: d.getTime() };
    if (t.amount >= 0) map[key].income  += t.amount;
    else               map[key].expense += Math.abs(t.amount);
  });
  const rows = Object.values(map).sort((a, b) => a.order - b.order).slice(-6);
  return rows.length >= 2 ? rows : DUMMY_CHART_DATA;
}

// Build donut slices from category totals
function buildDonutData(transactions) {
  const COLORS = ['#00F0FF', '#BF5AF2', '#BDFF00', '#ff9500', '#ff6b6b', '#8892A4'];
  const map = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    const key = t.category || 'Other';
    map[key] = (map[key] || 0) + Math.abs(t.amount);
  });
  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
  const rows = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, val], i) => ({ name, value: Math.round((val / total) * 100), color: COLORS[i % COLORS.length] }));
  return rows.length ? rows : DUMMY_DONUT_DATA;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories,   setCategories]   = useState(DUMMY_CATEGORIES);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editData,     setEditData]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [quickForm,    setQuickForm]    = useState({ description: '', amount: '', category: 'Food' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [txRes, catRes] = await Promise.allSettled([getTransactions(), getCategories()]);

      if (txRes.status === 'fulfilled') {
        const raw = txRes.value?.data;
        const list = Array.isArray(raw) ? raw
          : Array.isArray(raw?.transactions) ? raw.transactions
          : Array.isArray(raw?.data) ? raw.data
          : [];
        setTransactions(list.map(normTx));
      } else {
        setTransactions(DUMMY_TRANSACTIONS.map(normTx));
      }

      if (catRes.status === 'fulfilled') {
        const cats = normCategories(catRes.value?.data?.categories || catRes.value?.data);
        if (cats.length) setCategories(cats);
      }
    } catch {
      setTransactions(DUMMY_TRANSACTIONS.map(normTx));
    } finally {
      setLoading(false);
    }
  };

  // ── derived stats ────────────────────────────────────────────────────────────
  const totalIncome  = useMemo(() => transactions.filter(t => t.amount >= 0).reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.amount <  0).reduce((s, t) => s + Math.abs(t.amount), 0), [transactions]);
  const totalAssets  = totalIncome - totalExpense;
  const monthlyYield = useMemo(() => transactions.filter(t => t.category === 'Investment' && t.amount >= 0).reduce((s, t) => s + t.amount, 0), [transactions]);
  const chartData    = useMemo(() => buildChartData(transactions), [transactions]);
  const donutData    = useMemo(() => buildDonutData(transactions), [transactions]);
  const donutTotal   = useMemo(() => transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [transactions]);

  // ── CRUD ──────────────────────────────────────────────────────────────────────
  const handleAddTransaction = async (data) => {
    try {
      const res = await addTransaction(data);
      const created = normTx(res.data?.transaction || res.data?.data || res.data);
      setTransactions(prev => [created, ...prev]);
    } catch {
      setTransactions(prev => [normTx({ ...data, _id: Date.now().toString() }), ...prev]);
    }
  };

  const handleEdit = async (data) => {
    const id = editData._id;
    try {
      const res = await updateTransaction(id, data);
      const updated = normTx(res.data?.transaction || res.data?.data || res.data);
      setTransactions(prev => prev.map(t => t._id === id ? updated : t));
    } catch {
      setTransactions(prev => prev.map(t => t._id === id ? normTx({ ...t, ...data }) : t));
    }
    setEditData(null);
  };

  const handleDelete = async (id) => {
    try { await deleteTransaction(id); } catch {}
    setTransactions(prev => prev.filter(t => t._id !== id));
  };

  const handleQuickAdd = async () => {
    if (!quickForm.description || !quickForm.amount) return;
    const data = {
      title: quickForm.description, description: quickForm.description,
      amount: -Math.abs(Number(quickForm.amount)),
      category: quickForm.category, type: 'expense',
      date: new Date().toISOString().slice(0, 10), status: 'completed',
    };
    await handleAddTransaction(data);
    setQuickForm(f => ({ ...f, description: '', amount: '' }));
  };

  const fmt = (n) => `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onAddTransaction={() => { setEditData(null); setModalOpen(true); }} />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <StatCard label="Total Assets"  value={fmt(totalAssets)}        change={12.4} changeLabel="since last month" icon={DollarSign} accent="primary"   style={{ animationDelay: '0.05s' }} />
          <StatCard label="Monthly Yield" value={fmt(monthlyYield)}       change={2}    changeLabel="avg 1.7% ROI"     icon={TrendingUp} accent="secondary" style={{ animationDelay: '0.1s'  }} />
          <StatCard label="Burn Rate"     value={fmt(totalExpense / 12)}  change={-3}   changeLabel="monthly avg"      icon={Zap}        accent="danger"    style={{ animationDelay: '0.15s' }} />
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
          <div className="card animate-fade-up stagger-3" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16 }}>Portfolio Growth</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Historical performance across all asset classes</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['1M', '6M', '1Y', 'ALL'].map(p => (
                  <button key={p} style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                    background: p === '6M' ? 'rgba(0,240,255,0.1)' : 'transparent',
                    color: p === '6M' ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  }}>{p}</button>
                ))}
              </div>
            </div>
            <PortfolioChart data={chartData} />
          </div>

          <div className="card animate-fade-up stagger-4" style={{ padding: 20 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Spending Breakdown</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Monthly allocation of capital</p>
            <SpendingDonut data={donutData} total={Math.round(donutTotal)} />
          </div>
        </div>

        {/* Transactions + Quick Add */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
          <div className="card animate-fade-up stagger-5" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16 }}>Recent Transactions</h2>
              <a href="/transactions" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View All</a>
            </div>
            {loading
              ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
              : <TransactionList transactions={transactions} limit={5} showActions={false} />
            }
          </div>

          <div className="card animate-fade-up stagger-5" style={{ padding: 20 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Quick Add</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Log new transaction instantly.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Description</label>
                <input className="input-field" placeholder="e.g. S&P 500 Dividend"
                  maxLength={255}
                  value={quickForm.description}
                  onChange={(e) => {
                    setQuickForm(prev => ({ ...prev, description: e.target.value }));
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Amount</label>
                  <input className="input-field" type="number" placeholder="0.00"
                    min="0"
                    max="1000000000"
                    step="0.01"
                    value={quickForm.amount}
                    onChange={(e) => {
                      setQuickForm(prev => ({ ...prev, amount: e.target.value }));
                    }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Category</label>
                  <select className="input-field" value={quickForm.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setQuickForm(prev => ({ ...prev, category: value }));
                    }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn-primary" onClick={handleQuickAdd} style={{ width: '100%', marginTop: 4 }}>
                Confirm Entry
              </button>
            </div>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSubmit={editData ? handleEdit : handleAddTransaction}
        editData={editData}
        categories={categories}
      />
    </div>
  );
}