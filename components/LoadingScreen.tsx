'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">✈️</div>
        <h1 className="loading-title">WxCopilot</h1>
        <p className="loading-tagline">Your weather copilot for every flight</p>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>

      <style jsx>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          text-align: center;
          color: white;
          padding: 2rem;
        }

        .loading-logo {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: float 2s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .loading-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .loading-tagline {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-message {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

