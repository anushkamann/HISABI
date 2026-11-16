-- ============================================================
-- HISABI FINAL SEED DATA (MERGED OLD + NEW)
-- ============================================================

USE hisabi;

-- ============================================================
-- USERS
-- ============================================================
-- Insert 5 Sample Users
INSERT INTO users (name, email, password, phone_nos) VALUES
('John Doe', 'john.doe@hisabi.com', 'plainpassword', JSON_ARRAY('1234567890')),
('Alice Smith', 'alice.smith@hisabi.com', 'plainpassword', JSON_ARRAY('0987654321')),
('Robert Chen', 'robert.chen@hisabi.com', 'plainpassword', JSON_ARRAY('5551234567')),
('Sarah Johnson', 'sarah.johnson@hisabi.com', 'plainpassword', JSON_ARRAY('4449876543')),
('Michael Lee', 'michael.lee@hisabi.com', 'plainpassword', JSON_ARRAY('3332221111'))
ON DUPLICATE KEY UPDATE id=id;

-- ============================================================
-- CATEGORIES (NEW + OLD MERGED)
-- ============================================================
-- Insert 10 Sample Categories for User 1 (John Doe)
INSERT INTO categories (user_id, name, type, color, monthly_budget) VALUES
(1, 'Salary',             'income',  '#22c55e', 0.00),
(1, 'Freelance',          'income',  '#3b82f6', 0.00),
(1, 'Food & Dining',      'expense', '#f97316', 600.00),
(1, 'Transport',          'expense', '#8b5cf6', 300.00),
(1, 'Utilities',          'expense', '#06b6d4', 250.00),
(1, 'Entertainment',      'expense', '#ec4899', 150.00),
(1, 'Healthcare',         'expense', '#ef4444', 100.00),
(1, 'Shopping',           'expense', '#f59e0b', 400.00),
(1, 'Housing & Rent',     'expense', '#64748b', 2000.00),
(1, 'Investments',        'expense', '#10b981', 1000.00)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================================
-- BRANDS (OLD KEPT)
-- ============================================================
-- Insert 8 Sample Brands tied to appropriate categories
INSERT INTO brands (name, category_id) VALUES
('Zomato', 3),
('Swiggy', 3),
('Uber', 4),
('Lyft', 4),
('Amazon', 8),
('Walmart', 8),
('Netflix', 6),
('Apollo Pharmacy', 7)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================================
-- TRANSACTIONS (MERGED)
-- ============================================================
-- Insert 10 Sample Transactions with notes and non-null values
INSERT INTO transactions (user_id, category_id, brand_id, type, amount, description, note, transaction_date) VALUES
(1, 1, NULL, 'income',  6000.00, 'April Salary', 'Direct deposit from TechCorp', '2026-04-01'),
(1, 9, NULL, 'expense', 2000.00, 'Monthly Rent', 'Transferred to landlord', '2026-04-02'),
(1, 3, 1,    'expense',  45.00,  'Dinner Delivery', 'Ordered pizza from Zomato for the family', '2026-04-03'),
(1, 5, NULL, 'expense',  120.00, 'Electricity Bill', 'Paid via online portal', '2026-04-05'),
(1, 4, 3,    'expense',  25.00,  'Office Commute', 'Uber ride to the downtown office', '2026-04-08'),
(1, 8, 5,    'expense',  180.00, 'New Headphones', 'Amazon purchase for remote work', '2026-04-10'),
(1, 6, 7,    'expense',  15.99,  'Streaming Sub', 'Netflix monthly renewal', '2026-04-14'),
(1, 7, 8,    'expense',  40.00,  'Vitamins', 'Monthly medical restock at Apollo', '2026-04-18'),
(1, 2, NULL, 'income',  1200.00, 'Web Design Gig', 'Payment from client for landing page', '2026-04-20'),
(1, 10, NULL,'expense',  500.00, 'Stock Market', 'Transferred to brokerage account', '2026-04-25');

-- ============================================================
-- BUDGETS (OLD KEPT)
-- ============================================================
-- Insert 5 Sample Budgets
INSERT INTO budgets (user_id, category_id, year, amount) VALUES
(1, 3, 2026, 7200.00),
(1, 4, 2026, 3600.00),
(1, 8, 2026, 4800.00),
(1, 9, 2026, 24000.00),
(1, 10, 2026, 12000.00)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================================
-- ACTIVITY LOGS (OLD KEPT)
-- ============================================================
-- Insert 6 Sample Activity Logs
INSERT INTO activity_logs (user_id, action, description) VALUES
(1, 'LOGIN', 'User John Doe logged in from Windows PC'),
(1, 'ADD_TRANSACTION', 'Recorded April Salary income of $6000'),
(1, 'ADD_TRANSACTION', 'Recorded rent payment of $2000'),
(1, 'UPDATE_BUDGET', 'Modified Shopping yearly budget to $4800'),
(1, 'ADD_SUBSCRIPTION', 'Added Netflix to active subscriptions'),
(1, 'LOGOUT', 'User John Doe logged out successfully');

-- ============================================================
-- SUBSCRIPTIONS (NEW)
-- ============================================================
-- Insert 5 Sample Subscriptions with notes
INSERT INTO subscriptions (user_id, category_id, name, amount, billing_cycle, next_billing_date, notes) VALUES
(1, 6, 'Netflix Premium', 15.99, 'monthly', '2026-05-14', 'Shared with family members'),
(1, 6, 'Spotify Duo',     12.99, 'monthly', '2026-05-01', 'Music streaming for me and wife'),
(1, 5, 'AWS Hosting',     25.00, 'monthly', '2026-05-10', 'Cloud hosting for freelance projects'),
(1, 8, 'Amazon Prime',   139.00, 'yearly',  '2027-01-15', 'Annual prime membership for free shipping'),
(1, 6, 'Gym Membership',  45.00, 'monthly', '2026-05-05', 'Local fitness center access');

-- ============================================================
-- ALERTS (NEW)
-- ============================================================
-- Insert 5 Sample Alerts
INSERT INTO alerts (user_id, category_id, type, message, threshold, actual_amount, is_read) VALUES
(1, 3, 'overspending', 'Food & Dining budget exceeded by $20', 600.00, 620.00, FALSE),
(1, 4, 'warning', 'Transport budget is at 90% capacity', 300.00, 270.00, TRUE),
(1, 8, 'info', 'Shopping expenses are lower than usual this month', 400.00, 180.00, FALSE),
(1, 5, 'warning', 'Utilities approaching monthly limit', 250.00, 230.00, FALSE),
(1, 10, 'success', 'Investment goal reached for the quarter', 1000.00, 1000.00, TRUE);