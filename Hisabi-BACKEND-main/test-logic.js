const testLogic = async () => {
    const API_BASE = 'http://localhost:5000/api';
    const num = Math.floor(Math.random() * 100000);
    const email = `testuser${num}@example.com`;
    const password = 'password123';

    let res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: 'Test User', email, password })
    });
    let data = await res.json();
    const token = data.token;
    console.log('✅ Auth Token Acquired');

    console.log('\n[1] Creating a new budget for Investment (Limit: 500)');
    res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ category: 'Investment', limit: 500 })
    });
    let budgetData = await res.json();
    console.log('Budget Create Response:', budgetData);

    console.log('\n[2] Creating an expense transaction for Investment (Amount: 100)');
    res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: 'Stocks', amount: 100, type: 'expense', category: 'Investment', date: new Date().toISOString().split('T')[0] })
    });
    let txData = await res.json();
    console.log('Transaction Create Response:', txData);

    console.log('\n[3] Fetching all budgets to check spent amount');
    res = await fetch(`${API_BASE}/budgets`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log('Budgets Response:', JSON.stringify(data, null, 2));

    const txId = txData.transaction.id;
    const bdId = budgetData.budget.id;

    console.log('\n[4] Deleting Transaction and Budget');
    await fetch(`${API_BASE}/transactions/${txId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    await fetch(`${API_BASE}/budgets/${bdId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    console.log('Cleanup Done');
};

testLogic().catch(console.error);