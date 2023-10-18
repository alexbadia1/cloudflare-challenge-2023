import React, { useState } from "react";

import "./toolbar.css";

const Toolbar = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={`legend ${isOpen ? "open" : "closed"}`}>
      <div className={`legend--text ${isOpen ? "" : "invisible"}`}>
        <ul>
          <lh>
            <h3>Tips</h3>
          </lh>
          <li>Use +/- buttons to Zoom In/Zoom Out</li>
          <li>You can drag around the canvas</li>
          <li>Click on cards to expand Hierarchy:</li>
          <ul>
            <li>
              Organization &rsaquo; Department &rsaquo; Boss &rsaquo; Grunt
            </li>
          </ul>
          <li>
            Click "Download as PDF Image" to download screenshot as Image.
          </li>
          <li>Click "Download as PDF Button" to download screenshot as PDF.</li>
          <li>
            "GitHub" link, is the link to the source code for this challenge
          </li>
        </ul>
      </div>
      <button className="legend--button" onClick={(_) => setIsOpen(!isOpen)}>
        <svg
          className={isOpen ? "" : "rotate-180"}
          xmlns="http://www.w3.org/2000/svg"
          height="1.5rem"
          viewBox="0 0 512 512"
        >
          <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
        </svg>
      </button>
    </div>
  );
};

export default Toolbar;
