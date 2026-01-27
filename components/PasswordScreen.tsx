'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface PasswordScreenProps {
  onSuccess: () => void;
}

const STORAGE_KEY = 'wxcopilot_authenticated';

export const PasswordScreen: React.FC<PasswordScreenProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/validate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.valid) {
        // Store authentication in localStorage
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {
          console.error('Error saving authentication:', e);
        }
        onSuccess();
      } else {
        setError(data.error || 'Incorrect password. Please try again.');
        setPassword('');
        setIsSubmitting(false);
        inputRef.current?.focus();
      }
    } catch (err) {
      console.error('Password validation error:', err);
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="password-screen">
      <div className="password-content">
        <div className="password-logo">
          <Image 
            src="/wxcopilot.jpg" 
            alt="WxCoPilot" 
            width={280} 
            height={100}
            priority
          />
        </div>
        
        <div className="password-form-container">
          <h2 className="password-title">Enter Password</h2>
          <p className="password-subtitle">Please enter the password to access WxCoPilot</p>
          
          <form onSubmit={handleSubmit} className="password-form">
            <div className="password-input-wrapper">
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Password"
                className="password-input"
                disabled={isSubmitting}
                autoComplete="off"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="password-error">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="password-submit-btn"
              disabled={isSubmitting || !password.trim()}
            >
              {isSubmitting ? 'Verifying...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .password-screen {
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
          z-index: 10000;
          overflow: hidden;
        }

        .password-content {
          text-align: center;
          color: white;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
        }

        .password-logo {
          margin-bottom: 3rem;
          animation: float 2s ease-in-out infinite;
          border-radius: 20px;
          overflow: hidden;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .password-form-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .password-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .password-subtitle {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 1.5rem 0;
        }

        .password-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(6, 182, 212, 0.3);
          border-radius: 8px;
          color: white;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .password-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .password-input:focus {
          border-color: #06b6d4;
          background: rgba(255, 255, 255, 0.15);
        }

        .password-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-error {
          color: #ef4444;
          font-size: 0.875rem;
          text-align: center;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .password-submit-btn {
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .password-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        }

        .password-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .password-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (e) {
    return false;
  }
};

// Helper function to clear authentication (for logout if needed)
export const clearAuthentication = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing authentication:', e);
  }
};
