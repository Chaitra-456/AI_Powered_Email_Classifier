// src/components/EmailList.js
import React from "react";
import EmailCard from "./EmailCard";
import "./EmailList.css";

export default function EmailList({ emails = [], onSelectEmail = () => {} }) {
  if (!emails || emails.length === 0) {
    return <div className="empty-list">No emails to show.</div>;
  }

  return (
    <div className="email-list">
      {emails.map((m, i) => (
        <EmailCard key={m.id || i} mail={m} onView={() => onSelectEmail(m)} />
      ))}
    </div>
  );
}