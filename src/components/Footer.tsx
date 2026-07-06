import React from 'react';

export default function Footer() {
  return (
    <footer className="pob-footer">
      <div className="share-container">
        <span className="share-label">Build Share Code:</span>
        <input type="text" placeholder="Base64..." />
        <button className="btn btn-secondary">Import</button>
      </div>
    </footer>
  );
}