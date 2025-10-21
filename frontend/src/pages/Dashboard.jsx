import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [transactionType, setTransactionType] = useState("expense");
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err?.response?.data || err.message);
      const status = err?.response?.status;
      if (status === 401 || status === 422) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/login");
        return;
      }
      setError("Failed to load transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    if (!amount || !date) {
      setError("Please provide amount and date.");
      return;
    }
    try {
      await api.post("/transactions", {
        amount: parseFloat(amount),
        description: description,
        date: date,
        transaction_type: transactionType,
      });
      setAmount("");
      setDescription("");
      setDate("");
      setTransactionType("expense");
      await fetchTransactions();
    } catch (err) {
      console.error("Failed to add transaction:", err?.response?.data || err.message);
      const status = err?.response?.status;
      if (status === 401 || status === 422) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/login");
        return;
      }
      setError("Failed to add transaction.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const totalIncome = transactions
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netTotal = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your income and expenses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold income-amount">${totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                  <span className="text-danger-600 text-lg">💸</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold expense-amount">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${netTotal >= 0 ? 'bg-primary-100' : 'bg-danger-100'}`}>
                  <span className={`text-lg ${netTotal >= 0 ? 'text-primary-600' : 'text-danger-600'}`}>
                    {netTotal >= 0 ? '📈' : '📉'}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Total</p>
                <p className={`text-2xl font-bold ${netTotal >= 0 ? 'income-amount' : 'expense-amount'}`}>
                  ${netTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Transaction Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Transaction</h2>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="input-field"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Transaction description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button type="submit" className="w-full btn-primary">
                Add Transaction
              </button>
            </form>
          </div>

          {/* Transactions List */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <p className="text-gray-600">No transactions yet.</p>
                <p className="text-sm text-gray-500">Add your first transaction to get started!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        t.transaction_type === 'income' ? 'bg-primary-100' : 'bg-danger-100'
                      }`}>
                        <span className={`text-sm ${
                          t.transaction_type === 'income' ? 'text-primary-600' : 'text-danger-600'
                        }`}>
                          {t.transaction_type === 'income' ? '💰' : '💸'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t.description || 'No description'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(t.date).toLocaleDateString()} at {new Date(t.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        t.transaction_type === 'income' ? 'income-amount' : 'expense-amount'
                      }`}>
                        {t.transaction_type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{t.transaction_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;