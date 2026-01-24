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
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          margin-bottom: 1.25rem;
          overflow: hidden;
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .debug-toggle {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: none;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          color: #f8fafc;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .debug-toggle:hover {
          background: rgba(51, 65, 85, 0.8);
        }
        .debug-icon {
          font-size: 0.75rem;
          color: #64748b;
        }
        .debug-title {
          flex: 1;
          text-align: left;
        }
        .debug-badge {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        .debug-content {
          padding: 1.25rem;
          background: rgba(15, 23, 42, 0.9);
        }
        .debug-actions {
          margin-bottom: 1rem;
          display: flex;
          justify-content: flex-end;
        }
        .debug-copy-btn {
          background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 600;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .debug-copy-btn:hover {
          background: linear-gradient(135deg, #475569 0%, #334155 100%);
        }
        .debug-json {
          background: rgba(0, 0, 0, 0.4);
          color: #a5b4fc;
          padding: 1.25rem;
          border-radius: 12px;
          overflow-x: auto;
          font-family: 'SF Mono', 'Fira Code', 'Monaco', monospace;
          font-size: 0.75rem;
          line-height: 1.6;
          margin: 0;
          border: 1px solid rgba(255, 255, 255, 0.05);
          max-height: 500px;
          overflow-y: auto;
        }
        .debug-json::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .debug-json::-webkit-scrollbar-track {
          background: transparent;
        }
        .debug-json::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
        }
        .debug-json::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

