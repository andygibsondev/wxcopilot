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
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 
            0 -4px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
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
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-radius: 16px;
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        .add-to-home-screen-text {
          flex: 1;
          min-width: 0;
        }

        .add-to-home-screen-text h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.375rem 0;
          color: var(--color-text, #1e293b);
          letter-spacing: -0.02em;
        }

        .add-to-home-screen-text p {
          font-size: 0.875rem;
          margin: 0;
          color: var(--color-text-muted, #64748b);
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
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-base, 200ms cubic-bezier(0.4, 0, 0.2, 1));
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
          -webkit-tap-highlight-color: transparent;
        }

        .install-btn:active {
          transform: scale(0.98);
          box-shadow: 0 1px 6px rgba(99, 102, 241, 0.4);
        }

        .dismiss-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(248, 250, 252, 0.8);
          color: var(--color-text-muted, #64748b);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 50%;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all var(--transition-base, 200ms cubic-bezier(0.4, 0, 0.2, 1));
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }

        .dismiss-btn:active {
          background: rgba(241, 245, 249, 0.9);
          transform: scale(0.95);
          border-color: rgba(203, 213, 225, 0.9);
        }

        @media (min-width: 768px) {
          .add-to-home-screen {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .add-to-home-screen {
            padding: 1rem;
          }
          .add-to-home-screen-content {
            gap: 0.875rem;
          }
          .add-to-home-screen-icon {
            width: 48px;
            height: 48px;
            font-size: 1.75rem;
          }
          .add-to-home-screen-text h3 {
            font-size: 0.9375rem;
          }
          .add-to-home-screen-text p {
            font-size: 0.8125rem;
          }
          .install-btn {
            padding: 0.5625rem 1rem;
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
};

