const testAllAPIs = async () => {
    const API_BASE = 'http://localhost:5000/api';
    const email = `fulltest_${Date.now()}@example.com`;
    const password = 'password123';

    console.log('--- STARTING AMOUNT SIGN TEST ---\n');

    // 1. Auth (POST)
    let res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: 'System Tester', email, password })
    });
    let data = await res.json();
    const token = data.token;

    // 3. Transactions (POST - POSITIVE Amount)
    console.log('[1] POST /api/transactions (type: expense, amount: +150)');
    res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: 'Test Expense', amount: 150, type: 'expense', category: 'Investment', date: '2026-05-02' })
    });
    let txData = await res.json();
    console.log('  ↳ Result from POST:', txData.transaction.amount, '(Should be -150)');
    const txId = txData.transaction.id;

    console.log('[2] GET /api/transactions (Verify mapping)');
    res = await fetch(`${API_BASE}/transactions`, { headers: { 'Authorization': `Bearer ${token}` } });
    data = await res.json();
    console.log('  ↳ Result from GET:', data.transactions[0].amount, '(Should be -150)');

    console.log('[3] PUT /api/transactions (Change amount to 300, keep expense)');
    res = await fetch(`${API_BASE}/transactions/${txId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: 300 })
    });
    txData = await res.json();
    console.log('  ↳ Result from PUT:', txData.transaction.amount, '(Should be -300)');

    // DELETE TEST
    console.log('\n[4] DELETE /api/transactions/:id');
    res = await fetch(`${API_BASE}/transactions/${txId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    console.log('  ↳ Result from DELETE:', res.ok ? '✅ Deleted Transaction' : '❌ Failed');
    
    // Test completed
    console.log('\n--- TEST FINISHED SUCCESSFULLY ---');
};

testAllAPIs().catch(console.error);