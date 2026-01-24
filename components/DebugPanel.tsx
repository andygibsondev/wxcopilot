'use client';

import React, { useState } from 'react';

interface DebugPanelProps {
  data: any;
  title?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  data,
  title = 'Debug Data',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="debug-panel">
      <button
        className="debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="debug-icon">{isOpen ? '▼' : '▶'}</span>
        <span className="debug-title">{title}</span>
        <span className="debug-badge">DEBUG</span>
      </button>
      
      {isOpen && (
        <div className="debug-content">
          <div className="debug-actions">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
              }}
              className="debug-copy-btn"
              type="button"
            >
              📋 Copy JSON
            </button>
          </div>
          <pre className="debug-json">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <style jsx>{`
        .debug-panel {
          background: #1e1e1e;
          border-radius: 12px;
          margin-top: 2rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .debug-toggle {
          width: 100%;
          background: #2d2d2d;
          border: none;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .debug-toggle:hover {
          background: #3d3d3d;
        }
        .debug-icon {
          font-size: 0.75rem;
          color: #888;
        }
        .debug-title {
          flex: 1;
          text-align: left;
        }
        .debug-badge {
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .debug-content {
          padding: 1.5rem;
          background: #1e1e1e;
        }
        .debug-actions {
          margin-bottom: 1rem;
          display: flex;
          justify-content: flex-end;
        }
        .debug-copy-btn {
          background: #3d3d3d;
          color: #fff;
          border: 1px solid #555;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .debug-copy-btn:hover {
          background: #4d4d4d;
        }
        .debug-json {
          background: #0d0d0d;
          color: #d4d4d4;
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
          font-size: 0.75rem;
          line-height: 1.6;
          margin: 0;
          border: 1px solid #333;
          max-height: 600px;
          overflow-y: auto;
        }
        .debug-json::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .debug-json::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        .debug-json::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }
        .debug-json::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </div>
  );
};

