import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import {
  getTransactions, addTransaction, updateTransaction,
  deleteTransaction, getCategories,
} from '../services/api';
import { DUMMY_TRANSACTIONS, DUMMY_CATEGORIES } from '../services/dummyData';

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

function normCategories(data) {
  if (!Array.isArray(data)) return DUMMY_CATEGORIES;
  return data.map(c => (typeof c === 'string' ? c : c.name || c.label || 'Other'));
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories,   setCategories]   = useState(DUMMY_CATEGORIES);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editData,     setEditData]     = useState(null);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('all');
  const [catFilter,    setCatFilter]    = useState('');
  const [loading,      setLoading]      = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [txRes, catRes] = await Promise.allSettled([getTransactions(), getCategories()]);

      if (txRes.status === 'fulfilled') {
        const raw  = txRes.value?.data;
        const list = Array.isArray(raw) ? raw
          : Array.isArray(raw?.transactions) ? raw.transactions
          : Array.isArray(raw?.data) ? raw.data : [];
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

  const filtered = transactions.filter(tx => {
    const title     = (tx.title || tx.description || '').toLowerCase();
    const matchSearch = title.includes(search.toLowerCase());
    const matchType   = filter === 'all'
      || (filter === 'income'  && tx.amount >= 0)
      || (filter === 'expense' && tx.amount <  0);
    const matchCat  = !catFilter || tx.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  const handleAdd = async (data) => {
    try {
      const res     = await addTransaction(data);
      const created = normTx(res.data?.transaction || res.data?.data || res.data);
      setTransactions(prev => [created, ...prev]);
    } catch {
      setTransactions(prev => [normTx({ ...data, _id: Date.now().toString() }), ...prev]);
    }
  };

  const handleEdit = async (data) => {
    const id = editData._id;
    try {
      const res     = await updateTransaction(id, data);
      const updated = normTx(res.data?.transaction || res.data?.data || res.data);
      setTransactions(prev => prev.map(t => t._id === id ? updated : t));
    } catch {
      setTransactions(prev => prev.map(t => t._id === id ? normTx({ ...t, ...data }) : t));
    }
    setEditData(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteTransaction(id); } catch {}
    setTransactions(prev => prev.filter(t => t._id !== id));
  };

  const totalIncome  = transactions.filter(t => t.amount >= 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.amount <  0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const fmt = (n) => `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22 }}>Transactions</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {loading ? 'Loading…' : `${filtered.length} records found`}
          </p>
        </div>
        <button className="btn-primary"
          onClick={() => { setEditData(null); setModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add Transaction
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Income',   value: `+${fmt(totalIncome)}`,               color: '#BDFF00' },
          { label: 'Total Expenses', value: `-${fmt(totalExpense)}`,               color: '#ff6b6b' },
          { label: 'Net Balance',    value: fmt(totalIncome - totalExpense),       color: 'var(--primary)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search transactions…"
            value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'income', 'expense'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                background: filter === f ? 'rgba(0,240,255,0.1)' : 'transparent',
                color: filter === f ? 'var(--primary)' : 'var(--text-dim)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s',
              }}>{f}</button>
          ))}
        </div>
        <select className="input-field" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 150 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="card" style={{ padding: '8px 20px' }}>
        {loading
          ? <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading transactions…</div>
          : <TransactionList
              transactions={filtered}
              onEdit={(tx) => { setEditData(tx); setModalOpen(true); }}
              onDelete={handleDelete}
              showActions
            />
        }
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSubmit={editData ? handleEdit : handleAdd}
        editData={editData}
        categories={categories}
      />
    </div>
  );
}
