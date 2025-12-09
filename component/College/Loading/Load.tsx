import React from "react";
import "./Load.css";

export default function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>Finding best universities for you... 🎓✨</p>
    </div>
  );
}
