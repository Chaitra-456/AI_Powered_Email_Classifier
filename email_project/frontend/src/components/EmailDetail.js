// src/components/EmailDetail.js
import React from "react";
import "./EmailDetail.css";

export default function EmailDetail({ email = null, onClose = () => {}, onMarkSpam = () => {} }) {
  if (!email) {
    return <div className="email-detail hidden"></div>;
  }

  return (
    <div className="email-detail show">
      <div className="detail-header">
        <h3 className="detail-title">Email Details</h3>

        <div className="detail-actions">
          <button className="spam-btn" onClick={() => onMarkSpam(email)}>Move to Spam</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="detail-subject">{email.subject}</div>

      <div className="detail-meta">
        <div><b>From:</b> {email.from}</div>
        <div className="detail-date">{email.date || ""}</div>
      </div>

      <div className="detail-body">
        {email.preview && <p className="plain-text">{email.preview}</p>}
        {email.html && (
          <div className="html-body" dangerouslySetInnerHTML={{ __html: email.html }}></div>
        )}
      </div>
    </div>
  );
}