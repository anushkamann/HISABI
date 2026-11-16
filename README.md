# HISABI – Personal Finance & Subscription Tracker

**Hisabi** is a personal finance management application designed to help users track their income, monitor expenses, manage budgets, and gain insights into their financial activities through an intuitive dashboard.

The platform brings essential financial management features together in one place, helping users understand their spending patterns and manage their money more effectively.

---

## ✨ Key Features

### 1. User Authentication
- User registration and login.
- Secure password hashing.
- JWT-based authentication.
- Protected application routes.

### 2. Financial Dashboard
- Overview of income and expenses.
- Net balance monitoring.
- Spending visualizations.
- Financial activity overview.

### 3. Transaction Management
- Add income and expense transactions.
- View and manage transaction records.
- Edit and delete transactions.
- Search and filter transactions.

### 4. Budget Management
- Create category-based budgets.
- Set spending limits.
- Monitor budget utilization.
- Track spending against allocated budgets.

### 5. Reports & Analytics
- Income and expense summaries.
- Category-wise spending analysis.
- Financial reports with visual charts.
- Better understanding of spending patterns.

### 6. Subscription Management
- Backend support for subscription management.
- Support for recurring subscription frequencies.
- Weekly, monthly, and yearly subscription intervals.

### 7. Additional Features
- Category management.
- Alerts and notifications support.
- Brand management.
- Activity logging.

---

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT, bcryptjs |
| API Communication | Axios |
| Charts & Visualization | Recharts |
| Icons | Lucide React |
| Development Tools | Git, GitHub, VS Code |

---

## 📂 Project Structure

```text
HISABI/
│
├── hisabi-frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── Hisabi-BACKEND-main/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── app.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

Follow these instructions to run Hisabi locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/samarthyaaa/HISABI.git
```

Navigate into the project directory:

```bash
cd HISABI
```

### 2. Database Configuration

1. Start your MySQL server.
2. Open MySQL Workbench.
3. Execute the database schema:

```sql
SOURCE path/to/HISABI/Hisabi-BACKEND-main/database/schema.sql;
```

To insert sample data, execute:

```sql
SOURCE path/to/HISABI/Hisabi-BACKEND-main/database/seed.sql;
```

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd Hisabi-BACKEND-main
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hisabi

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
```

Start the backend:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

### 4. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd hisabi-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL provided by Vite, usually:

```text
http://localhost:5173
```

---

## 🔗 Backend API Modules

The backend provides REST API endpoints for the following modules:

| Module | Base Endpoint |
|---|---|
| Authentication | `/api/auth` |
| Categories | `/api/categories` |
| Transactions | `/api/transactions` |
| Subscriptions | `/api/subscriptions` |
| Budgets | `/api/budgets` |
| Reports | `/api/reports` |
| Alerts | `/api/alerts` |
| Brands | `/api/brands` |
| Activity Logs | `/api/activity-logs` |

---

## 🔐 Security

- Passwords are hashed using bcryptjs.
- JWT authentication is used for protected resources.
- Environment variables are used for sensitive configuration.
- Database credentials and secret keys should never be committed to GitHub.

---

## 🚀 Future Enhancements

- Integration with payment platforms.
- Automated subscription renewal reminders.
- Advanced financial analytics.
- Monthly and yearly financial insights.
- Exportable financial reports.
- Improved financial planning recommendations.

---

## 👨‍💻 Project Repository

**GitHub:** https://github.com/samarthyaaa/HISABI

---

## 📄 License

No license has been specified yet. A license can be added to define permissions for using, modifying, and distributing this project.

---

**Hisabi – Take Control of Your Finances.**