export const DUMMY_TRANSACTIONS = [
  { _id: '1', title: 'Apple Store – MacBook Pro', amount: -2499.0, type: 'expense', category: 'Technology', date: '2024-10-25', status: 'pending' },
  { _id: '2', title: 'Vanguard Dividend Payment', amount: 1720.45, type: 'income', category: 'Investment', date: '2024-10-24', status: 'completed' },
  { _id: '3', title: 'Tesla Supercharging', amount: -42.1, type: 'expense', category: 'Transport', date: '2024-10-22', status: 'completed' },
  { _id: '4', title: 'Monthly Salary', amount: 8500.0, type: 'income', category: 'Salary', date: '2024-10-01', status: 'completed' },
  { _id: '5', title: 'Netflix Subscription', amount: -15.99, type: 'expense', category: 'Entertainment', date: '2024-10-05', status: 'completed' },
  { _id: '6', title: 'Grocery - Whole Foods', amount: -210.5, type: 'expense', category: 'Food', date: '2024-10-08', status: 'completed' },
  { _id: '7', title: 'Freelance Project', amount: 3200.0, type: 'income', category: 'Freelance', date: '2024-10-12', status: 'completed' },
  { _id: '8', title: 'Gym Membership', amount: -49.0, type: 'expense', category: 'Health', date: '2024-10-03', status: 'completed' },
];

export const DUMMY_BUDGETS = [
  { _id: '1', category: 'Food', limit: 500, spent: 210.5 },
  { _id: '2', category: 'Entertainment', limit: 100, spent: 15.99 },
  { _id: '3', category: 'Transport', limit: 200, spent: 42.1 },
  { _id: '4', category: 'Technology', limit: 3000, spent: 2499.0 },
  { _id: '5', category: 'Health', limit: 150, spent: 49.0 },
];

export const DUMMY_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Health', 'Technology',
  'Investment', 'Salary', 'Freelance', 'Housing', 'Shopping', 'Other'
];

export const DUMMY_CHART_DATA = [
  { month: 'Jun', income: 9200, expense: 4100 },
  { month: 'Jul', income: 8800, expense: 5200 },
  { month: 'Aug', income: 11200, expense: 4800 },
  { month: 'Sep', income: 9600, expense: 6100 },
  { month: 'Oct', income: 13400, expense: 3900 },
  { month: 'Nov', income: 10800, expense: 5600 },
];

export const DUMMY_DONUT_DATA = [
  { name: 'Investments', value: 65, color: '#00F0FF' },
  { name: 'Fixed Costs', value: 25, color: '#BF5AF2' },
  { name: 'Lifestyle', value: 10, color: '#BDFF00' },
];
