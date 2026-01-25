'use client';

import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <Image 
            src="/wxcopilot.jpg" 
            alt="WxCoPilot" 
            width={280} 
            height={100}
            priority
          />
        </div>
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
          width: 100vw;
          height: 100vh;
          min-height: 100vh;
          background: radial-gradient(ellipse at center, #0c1929 0%, #070d15 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }

        .loading-content {
          text-align: center;
          color: white;
          padding: 2rem;
        }

        .loading-logo {
          margin-bottom: 2rem;
          animation: float 2s ease-in-out infinite;
          border-radius: 20px;
          overflow: hidden;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(6, 182, 212, 0.2);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-message {
          font-size: 0.875rem;
          color: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
};

