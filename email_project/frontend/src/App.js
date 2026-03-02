// src/App.js
import React, { useState } from "react";
import Sidebar from "./components/sidebar";
import EmailList from "./components/EmailList";
import EmailDetail from "./components/EmailDetail";
import { fetchEmails, getCategory } from "./utils/api";
import "./App.css";

export default function App() {
  const [gmail, setGmail] = useState("");
  const [appPass, setAppPass] = useState("");
  const [status, setStatus] = useState("idle");
  const [emails, setEmails] = useState([]);
  const [activeCat, setActiveCat] = useState("Inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);

  const categories = [
    "Inbox",
    "Academic",
    "Administration",
    "Campus Service",
    "Career And Opportunity",
    "Financial Services",
    "Service Notification",
    "Scholarship",
    "Skill Development",
    "Miscellaneous",
    "Spam",
  ];

  async function handleLogin() {
    if (!gmail || !appPass) return alert("Enter Gmail + App Password");
    setStatus("loading");

    try {
      const res = await fetchEmails(gmail, appPass);

      if (Array.isArray(res?.emails)) {
        setEmails(res.emails);
      } else {
        const inbox = await getCategory("Inbox");
        setEmails(inbox || []);
      }

      setStatus("success");
      setActiveCat("Inbox");
    } catch (err) {
      console.error(err);
      alert("Login failed.");
      setStatus("idle");
    }
  }

  async function handleCategorySelect(cat) {
    setActiveCat(cat);
    setSelectedEmail(null);

    try {
      const data = await getCategory(cat);
      setEmails(data || []);
    } catch {
      setEmails([]);
    }
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-title">Email Classifier</div>

        {status === "success" && (
          <div className="app-header-right">
            <div className="logged-as">{gmail}</div>

            <button
              className="logout-btn"
              onClick={() => {
                setStatus("idle");
                setGmail("");
                setAppPass("");
                setEmails([]);
                setSelectedEmail(null);
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <div className="app-main">
        {/* LEFT SIDEBAR */}
        {status === "success" ? (
          <Sidebar
            active={activeCat}
            categories={categories}
            onSelectCategory={handleCategorySelect}
          />
        ) : (
          <div className="sidebar-placeholder" />
        )}

        {/* MAIN CONTENT */}
        <main className="main-column">
          {/* LOGIN SCREEN */}
          {status !== "success" && (
            <div className="login-center">
              <div className="login-card">
                <h2>Load Gmail Inbox</h2>

                <input
                  className="input"
                  placeholder="Enter Gmail ID"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                />

                <input
                  type="password"
                  className="input"
                  placeholder="Enter App Password"
                  value={appPass}
                  onChange={(e) => setAppPass(e.target.value)}
                />

                <button className="btn primary" onClick={handleLogin}>
                  {status === "loading" ? "Fetching..." : "Login & Fetch Inbox"}
                </button>
              </div>
            </div>
          )}

          {/* EMAIL LIST (NO DUPLICATE CATEGORY ROW) */}
          {status === "success" && (
            <div className="inbox-area">
              <EmailList
                emails={emails}
                onSelectEmail={(mail) => setSelectedEmail(mail)}
              />
            </div>
          )}
        </main>

        {/* RIGHT EMAIL DETAIL PANEL */}
        <aside className="detail-column">
          <EmailDetail
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
            onMarkSpam={(mail) => {
              setEmails((prev) => prev.filter((e) => e !== mail));
              setSelectedEmail(null);
            }}
          />
        </aside>
      </div>
    </div>
  );
}