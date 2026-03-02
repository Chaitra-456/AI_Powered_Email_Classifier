// src/components/EmailCard.js
import React from "react";
import "./EmailCard.css";

export default function EmailCard({ mail, onView = () => {} }) {
  const date = mail.date || mail.receivedDate || "";
  return (
    <div className="email-card">
      <div className="email-left">
        <input type="checkbox" className="email-checkbox" />
      </div>

      <div className="email-body">
        <div className="email-from">{mail.from}</div>
        <div className="email-subject">{mail.subject}</div>
        <div className="email-preview">{mail.preview ? mail.preview.slice(0, 120) : ""}</div>
      </div>

      <div className="email-right">
        <div className="email-date">{date}</div>
        <button className="view-btn" onClick={onView}>View Email</button>
      </div>
    </div>
  );
}