import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { PortfolioChart, SpendingDonut } from '../components/ChartComponent';
import { getReports, getTransactions } from '../services/api';
import { DUMMY_TRANSACTIONS, DUMMY_CHART_DATA, DUMMY_DONUT_DATA } from '../services/dummyData';


const COLORS = ['#00F0FF', '#BF5AF2', '#BDFF00', '#ff9500', '#ff6b6b', '#8892A4'];

function normTx(t) {
  return {
    ...t,
    _id:      t._id || t.id,
    title:    t.title || t.description || 'Transaction',
    amount:   Number(t.amount) || 0,
    category: t.category || 'Other',
    date:     t.date || t.createdAt || new Date().toISOString(),
  };
}

function buildMonthlyChart(transactions) {
  const map = {};
  transactions.forEach(t => {
    const d   = new Date(t.date);
    const key = d.toLocaleString('en-US', { month: 'short' });
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0, order: d.getTime() };
    if (t.amount >= 0) map[key].income  += t.amount;
    else               map[key].expense += Math.abs(t.amount);
  });
  const rows = Object.values(map).sort((a, b) => a.order - b.order).slice(-6);
  return rows.length >= 2 ? rows : DUMMY_CHART_DATA;
}

function buildDonut(transactions) {
  const map = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    const key = t.category || 'Other';
    map[key] = (map[key] || 0) + Math.abs(t.amount);
  });
  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
  const rows = Object.entries(map)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, val], i) => ({ name, value: Math.round((val / total) * 100), color: COLORS[i % COLORS.length] }));
  return rows.length ? rows : DUMMY_DONUT_DATA;
}

// ── Try to extract useful data from /api/reports response ────────────────────
// Backend shape is unknown, so we do a best-effort extraction
function extractReportChart(reportData) {
  if (!reportData) return null;
  // Common shapes: { monthly: [...] } | { chartData: [...] } | { data: [...] }
  const arr =
    reportData.monthly        ||
    reportData.monthlyData    ||
    reportData.chartData      ||
    reportData.incomeExpense  ||
    (Array.isArray(reportData.data) ? reportData.data : null) ||
    (Array.isArray(reportData) ? reportData : null);
  if (!Array.isArray(arr) || arr.length < 2) return null;
  // Normalise keys
  return arr.map(r => ({
    month:   r.month || r.name || r.period || '',
    income:  Number(r.income  || r.totalIncome  || r.inflow  || 0),
    expense: Number(r.expense || r.totalExpense || r.outflow || 0),
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: ${p.value?.toLocaleString()}</div>)}
    </div>
  );
};

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [reportData,   setReportData]   = useState(null);
  const [period,       setPeriod]       = useState('monthly');
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [txRes, repRes] = await Promise.allSettled([getTransactions(), getReports()]);

        if (txRes.status === 'fulfilled') {
          const raw  = txRes.value?.data;
          const list = Array.isArray(raw) ? raw
            : Array.isArray(raw?.transactions) ? raw.transactions
            : Array.isArray(raw?.data) ? raw.data : [];
          setTransactions(list.map(normTx));
        } else {
          setTransactions(DUMMY_TRANSACTIONS.map(normTx));
        }

        if (repRes.status === 'fulfilled') {
          setReportData(repRes.value?.data || null);
        }
      } catch {
        setTransactions(DUMMY_TRANSACTIONS.map(normTx));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalIncome  = useMemo(() => transactions.filter(t => t.amount >= 0).reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.amount <  0).reduce((s, t) => s + Math.abs(t.amount), 0), [transactions]);
  const savingsRate  = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : '0.0';

  const chartData = useMemo(() => extractReportChart(reportData) || buildMonthlyChart(transactions), [reportData, transactions]);
  const donutData = useMemo(() => buildDonut(transactions), [transactions]);
  const donutTotal = useMemo(() => transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [transactions]);

  const categoryBreakdown = useMemo(() => {
    return Object.values(
      transactions.reduce((acc, t) => {
        const key = t.category || 'Other';
        if (!acc[key]) acc[key] = { category: key, income: 0, expense: 0 };
        if (t.amount >= 0) acc[key].income  += t.amount;
        else               acc[key].expense += Math.abs(t.amount);
        return acc;
      }, {})
    ).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
  }, [transactions]);

  const fmt = (n) => `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22 }}>Reports & Analytics</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Comprehensive overview of your financial health</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['monthly', 'quarterly', 'yearly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: period === p ? 'rgba(0,240,255,0.1)' : 'transparent',
              color: period === p ? 'var(--primary)' : 'var(--text-dim)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Income',   value: fmt(totalIncome),                       color: '#BDFF00' },
          { label: 'Total Expenses', value: fmt(totalExpense),                      color: '#ff6b6b' },
          { label: 'Net Savings',    value: fmt(totalIncome - totalExpense),        color: 'var(--primary)' },
          { label: 'Savings Rate',   value: `${savingsRate}%`,                      color: '#BF5AF2' },
        ].map(s => (
          <div key={s.label} className="card animate-fade-up" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: s.color }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Income vs Expenses</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Monthly comparison over time</p>
          <PortfolioChart data={chartData} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Spending Mix</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Category allocation</p>
          <SpendingDonut data={donutData} total={Math.round(donutTotal)} />
        </div>
      </div>

      {/* Bar chart */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Category Breakdown</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryBreakdown} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: '#5A6478', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5A6478', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-dim)' }} />
            <Bar dataKey="income"  fill="#BDFF00" name="Income"  radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#BF5AF2" name="Expense" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Category Summary</h2>
        {loading
          ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Category', 'Income', 'Expenses', 'Net'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 12px 0', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map(row => (
                  <tr key={row.category} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, fontWeight: 600 }}>{row.category}</td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: '#BDFF00', fontWeight: 600 }}>
                      {row.income > 0 ? `+${fmt(row.income)}` : '—'}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: '#ff6b6b', fontWeight: 600 }}>
                      {row.expense > 0 ? `-${fmt(row.expense)}` : '—'}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, fontWeight: 700, color: (row.income - row.expense) >= 0 ? 'var(--primary)' : '#ff6b6b' }}>
                      {fmt(row.income - row.expense)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}
