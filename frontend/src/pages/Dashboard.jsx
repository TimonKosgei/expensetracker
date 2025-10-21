import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
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
        // token missing/invalid -> force logout and redirect to login
        localStorage.removeItem("token");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        description:description,
        date: date,
      });
      setAmount("");
      setDescription("");
      setDate("");
      // refresh the list after successful creation
      await fetchTransactions();
    } catch (err) {
      
      console.log(amount, description, date);
      console.error("Failed to add transaction:", err?.response?.data || err.message);
      const status = err?.response?.status;
      if (status === 401 || status === 422) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setError("Failed to add transaction.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const total = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <section style={{ marginTop: 16 }}>
        <h2>Summary</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div>
            <p>Total: ${total.toFixed(2)}</p>
            <p>Transactions: {transactions.length}</p>
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Add transaction</h2>
        <form onSubmit={handleAdd}>
          <input
            type="number"
            step="0.01"
            placeholder="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="submit">Add</button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Transactions</h2>
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Date</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Description</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: "8px 4px" }}>{new Date(t.date).toLocaleString()}</td>
                  <td style={{ padding: "8px 4px" }}>{t.description}</td>
                  <td style={{ padding: "8px 4px", textAlign: "right" }}>${Number(t.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Dashboard;