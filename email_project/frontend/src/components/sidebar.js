// src/components/sidebar.js
import React from "react";
import "./sidebar.css";

export default function Sidebar({ active, categories = [], onSelectCategory }) {
  return (
    <div className="sidebar">
      {categories.map((c) => (
        <button
          key={c}
          className={c === active ? "active" : ""}
          onClick={() => onSelectCategory(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}