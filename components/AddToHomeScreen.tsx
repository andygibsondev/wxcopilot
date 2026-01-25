'use client';

import React, { useState, useEffect } from 'react';

export const AddToHomeScreen: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Check if app is already installed (standalone mode)
    const standalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    if (standalone) {
      return;
    }

    // For Android - listen for beforeinstallprompt event
    if (android) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Show immediately
      setShowPrompt(true);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    // For iOS - show immediately
    if (iOS) {
      setShowPrompt(true);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android - trigger native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    // Only dismiss temporarily, don't save to localStorage
    // This way it will show again on next page load
    setShowPrompt(false);
    // Show again after 30 seconds
    setTimeout(() => {
      if (!isStandalone) {
        setShowPrompt(true);
      }
    }, 30000);
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="add-to-home-screen">
      <div className="add-to-home-screen-content">
        <div className="add-to-home-screen-icon">📱</div>
        <div className="add-to-home-screen-text">
          <h3>Add to Home Screen</h3>
          {isIOS ? (
            <p>
              Tap <span className="share-icon">📤</span> then &quot;Add to Home Screen&quot;
            </p>
          ) : isAndroid && deferredPrompt ? (
            <p>Install this app for quick access</p>
          ) : (
            <p>
              Tap the menu <span className="menu-icon">⋮</span> then &quot;Add to Home Screen&quot;
            </p>
          )}
        </div>
        <div className="add-to-home-screen-actions">
          {isAndroid && deferredPrompt ? (
            <button onClick={handleInstall} className="install-btn">
              Install
            </button>
          ) : null}
          <button onClick={handleDismiss} className="dismiss-btn" aria-label="Dismiss">
            ✕
          </button>
        </div>
      </div>
      <style jsx>{`
        .add-to-home-screen {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.98) 0%, rgba(139, 92, 246, 0.98) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-top: 3px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .add-to-home-screen-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .add-to-home-screen-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .add-to-home-screen-text {
          flex: 1;
          color: white;
        }

        .add-to-home-screen-text h3 {
          font-size: 1.125rem;
          font-weight: 800;
          margin: 0 0 0.375rem 0;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .add-to-home-screen-text p {
          font-size: 0.9375rem;
          margin: 0;
          color: rgba(255, 255, 255, 0.98);
          line-height: 1.5;
          font-weight: 500;
        }

        .share-icon,
        .menu-icon {
          display: inline-block;
          font-size: 1rem;
          margin: 0 0.25rem;
          vertical-align: middle;
        }

        .add-to-home-screen-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .install-btn {
          padding: 0.75rem 1.5rem;
          background: white;
          color: #6366f1;
          border: none;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 200ms;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .install-btn:active {
          transform: scale(0.95);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        .install-btn:hover {
          background: #f8fafc;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        }

        .dismiss-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 200ms;
          flex-shrink: 0;
        }

        .dismiss-btn:active {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0.9);
        }

        @media (min-width: 768px) {
          .add-to-home-screen {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

