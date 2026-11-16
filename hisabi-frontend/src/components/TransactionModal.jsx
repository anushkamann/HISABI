import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DUMMY_CATEGORIES } from '../services/dummyData';

const EMPTY = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: '',
  status: 'completed'
};

const Field = ({ label, error, children }) => (
  <div>
    <label
      style={{
        fontSize: 12,
        color: 'var(--text-muted)',
        display: 'block',
        marginBottom: 6,
        fontWeight: 500
      }}
    >
      {label}
    </label>
    {children}
    {error && (
      <span
        style={{
          fontSize: 11,
          color: '#ff6b6b',
          marginTop: 4,
          display: 'block'
        }}
      >
        {error}
      </span>
    )}
  </div>
);

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  categories = DUMMY_CATEGORIES
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || editData.description || '',
        amount: Math.abs(editData.amount),
        type: editData.type || (editData.amount < 0 ? 'expense' : 'income'),
        category: editData.category || '',
        date: editData.transaction_date
          ? editData.transaction_date.slice(0, 10)
          : '',
        status: editData.status || 'completed',
      });
    } else {
      setForm({
        ...EMPTY,
        date: new Date().toISOString().slice(0, 10)
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = 'Enter a valid amount';
    if (!form.category) e.category = 'Select a category';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);

    // ✅ FIXED: Backend expects positive amount + type
    const finalAmount = Math.abs(Number(form.amount));

    // ✅ FIXED: Correct field names for backend
    await onSubmit({
      amount: finalAmount,
      type: form.type,
      category: form.category,
      status: form.status,
      transaction_date: form.date,
      description: form.title
    });

    setLoading(false);
    onClose();
  };

  // const Field = ({ label, error, children }) => (
  //   <div>
  //     <label
  //       style={{
  //         fontSize: 12,
  //         color: 'var(--text-muted)',
  //         display: 'block',
  //         marginBottom: 6,
  //         fontWeight: 500
  //       }}
  //     >
  //       {label}
  //     </label>
  //     {children}
  //     {error && (
  //       <span
  //         style={{
  //           fontSize: 11,
  //           color: '#ff6b6b',
  //           marginTop: 4,
  //           display: 'block'
  //         }}
  //       >
  //         {error}
  //       </span>
  //     )}
  //   </div>
  // );

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <h2
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              fontSize: 18
            }}
          >
            {editData ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Type toggle */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            padding: 4,
            background: 'var(--surface-3)',
            borderRadius: 10
          }}
        >
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                fontFamily: 'Manrope, sans-serif',
                transition: 'all 0.2s',
                background:
                  form.type === t
                    ? t === 'expense'
                      ? '#ff6b6b'
                      : '#BDFF00'
                    : 'transparent',
                color: form.type === t ? '#0a1015' : 'var(--text-dim)',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Description" error={errors.title}>
            <input
              className="input-field"
              placeholder="e.g. Netflix Subscription"
              maxLength={255}
              value={form.title}
              onChange={(e) => {
                const value = e.target.value;
                setForm(prev => ({ ...prev, title: value }));
              }}
            />
          </Field>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label="Amount ($)" error={errors.amount}>
              <input
                className="input-field"
                type="number"
                placeholder="0.00"
                min="0"
                max="1000000000"
                step="0.01"
                value={form.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm(prev => ({ ...prev, amount: value }));
                }}
              />
            </Field>

            <Field label="Date" error={errors.date}>
              <input
                className="input-field"
                type="date"
                value={form.date}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm(prev => ({ ...prev, date: value }));
                }}
              />
            </Field>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <Field label="Category" error={errors.category}>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm(prev => ({ ...prev, category: value }));
                }}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm(prev => ({ ...prev, status: value }));
                }}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? 'Saving...'
              : editData
              ? 'Update'
              : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

