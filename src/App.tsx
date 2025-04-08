import React, { useState, useEffect } from 'react';
import './App.css';

const API_ENABLE_PROTECTION = 'http://localhost:8000/api/enable-protection';

interface CheckResponse {
  distraction: boolean;
}

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [checkResult, setCheckResult] = useState<string>('');
  const [reportUrl, setReportUrl] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportMessage, setReportMessage] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [protectionEnabled, setProtectionEnabled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('check');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  // Get current URL when extension opens
  useEffect(() => {
    if (chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          setUrl(tabs[0].url);
        }
      });
    }
  }, []);

  // Load saved settings (for dark mode and protection status)
  useEffect(() => {
    if (chrome?.storage?.sync) {
      chrome.storage.sync.get(['darkMode', 'protectionEnabled'], (result) => {
        if (result.darkMode !== undefined) setDarkMode(result.darkMode);
        if (result.protectionEnabled !== undefined) setProtectionEnabled(result.protectionEnabled);
      });
    } else {
      const storedDarkMode = localStorage.getItem('darkMode');
      const storedProtection = localStorage.getItem('protectionEnabled');
      if (storedDarkMode) setDarkMode(storedDarkMode === 'true');
      if (storedProtection) setProtectionEnabled(storedProtection === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ darkMode: newMode });
    } else {
      localStorage.setItem('darkMode', String(newMode));
    }
  };

  const checkLink = async () => {
    if (!url) {
      setCheckResult('No URL provided.');
      return;
    }
    setCheckResult('Checking link...');
    const startTime = performance.now();

    try {
      const apiEndpoint = `http://localhost:8000/api/check?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error('Network response was not OK');

      const data: CheckResponse = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (data.distraction) {
        // Instead of immediately showing a result, present the modal popup.
        setShowModal(true);
        // Clear previous check result.
        setCheckResult('');
      } else {
        setCheckResult(`Not Distracting (Response Time: ${elapsed}ms) 👍`);
      }
    } catch (error: any) {
      setCheckResult(`Error: ${error.message}`);
    }
  };

  const enableProtection = () => {
    const newValue = !protectionEnabled;
    setProtectionEnabled(newValue);
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ protectionEnabled: newValue });
    } else {
      localStorage.setItem('protectionEnabled', String(newValue));
    }
    if (chrome?.runtime) {
      chrome.runtime.sendMessage({ 
        action: 'toggleProtection', 
        enabled: newValue 
      });
    }
  };

  const submitReport = () => {
    if (!reportUrl) return;
    setReportMessage("Thank you for the report. We'll review it shortly.");
    setReportUrl('');
    setReportDetails('');
  };

  const submitFeedback = () => {
    if (feedbackRating === 0) return;
    setFeedbackMessage('Thank you for your feedback!');
    setFeedbackRating(0);
    setFeedbackText('');
  };

  // Modal "No" button handler to close distracting tab.
  const handleModalNo = () => {
    if (chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length && tabs[0].id) {
          chrome.tabs.remove(tabs[0].id);
        }
      });
    } else {
      window.close();
    }
    setShowModal(false);
  };

  // Modal "Yes" button handler simply dismisses the modal.
  const handleModalYes = () => {
    setShowModal(false);
  };

  return (
    <div className={darkMode ? 'App dark' : 'App'}>
      <header className="header">
        <div className="brand">FocusFlow</div>
        <nav className="navbar">
          <ul>
            <li><a href="#check" onClick={() => setActiveTab('check')}>Check</a></li>
            <li><a href="#report" onClick={() => setActiveTab('report')}>Report</a></li>
            <li><a href="#education" onClick={() => setActiveTab('education')}>Info</a></li>
            <li><a href="#feedback" onClick={() => setActiveTab('feedback')}>Feedback</a></li>
          </ul>
        </nav>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {activeTab === 'check' && (
        <section id="check" className="section check-section">
          <div className="input-group">
            <input
              type="text"
              placeholder="URL to check..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="check-btn" onClick={checkLink}>Check</button>
          </div>
          {checkResult && <div className="result">{checkResult}</div>}
          <div className="protection-toggle">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={protectionEnabled} 
                onChange={enableProtection}
              />
              <span className="toggle-slider"></span>
            </label>
            <span>Protection {protectionEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </section>
      )}

      {activeTab === 'report' && (
        <section id="report" className="section report-section">
          <div className="report-form">
            <input
              type="text"
              placeholder="Suspicious URL"
              value={reportUrl}
              onChange={(e) => setReportUrl(e.target.value)}
            />
            <textarea
              placeholder="Add details about this link..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
            />
            <button onClick={submitReport}>Submit Report</button>
          </div>
          {reportMessage && <div className="report-message">{reportMessage}</div>}
        </section>
      )}

      {activeTab === 'education' && (
        <section id="education" className="section education-section">
          <div className="education-card">
            <h3>How to Spot Scams</h3>
            <ul>
              <li>Check for urgent language or unbelievable offers</li>
              <li>Examine URLs carefully for misspellings</li>
              <li>Verify before clicking suspicious links</li>
            </ul>
          </div>
          <div className="education-card">
            <h3>Focus Tips</h3>
            <ul>
              <li>Use website blockers during study time</li>
              <li>Set specific goals for online sessions</li>
              <li>Take regular breaks from screen time</li>
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'feedback' && (
        <section id="feedback" className="section feedback-section">
          <div className="feedback-form">
            <div className="rating">
              <label htmlFor="rating">Rate us:</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${feedbackRating >= star ? 'filled' : ''}`}
                    onClick={() => setFeedbackRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Tell us more..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <button onClick={submitFeedback}>Submit Feedback</button>
          </div>
          {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
        </section>
      )}

      <footer className="footer">
        <p>FocusFlow © 2025</p>
      </footer>

      {/* Modal popup for distracting link confirmation */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>This link is distracting!</h2>
            <p style={{ marginBottom: '20px' }}>
              Are you sure you want to continue?
            </p>
            <div className="modal-buttons">
              <button className="modal-yes" onClick={handleModalYes}>
                Yes, continue
              </button>
              <button className="modal-no" onClick={handleModalNo}>
                No, close the link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;