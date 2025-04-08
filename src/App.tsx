import React, { useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [checkResult, setCheckResult] = useState<string>('');
  const [reportUrl, setReportUrl] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportMessage, setReportMessage] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [protectionEnabled, setProtectionEnabled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('check');

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
  

  // Load saved settings
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
      // Build the API endpoint using the provided URL.
      const apiEndpoint = `http://localhost:8000/api/check?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error('Network response was not OK');

      // The API returns a JSON object like: { url, distraction, output }
      const data = await response.json();
      const isDistracting: boolean = data.distraction;
      const elapsed = Math.round(performance.now() - startTime);

      setCheckResult(
        isDistracting
          ? `Distracting (Response Time: ${elapsed}ms) 🚨`
          : `Not Distracting (Response Time: ${elapsed}ms) 👍`
      );
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
    
    // In a real extension, you would send this to your API endpoint for reporting.
    setReportMessage("Thank you for the report. We'll review it shortly.");
    setReportUrl('');
    setReportDetails('');
  };

  return (
    <div className={darkMode ? 'App dark' : 'App'}>
      <header className="header">
        <div className="brand">FocusFlow</div>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <nav className="tab-navigation">
        <button 
          className={activeTab === 'check' ? 'active' : ''} 
          onClick={() => setActiveTab('check')}
        >
          Check
        </button>
        <button 
          className={activeTab === 'report' ? 'active' : ''} 
          onClick={() => setActiveTab('report')}
        >
          Report
        </button>
        <button 
          className={activeTab === 'education' ? 'active' : ''} 
          onClick={() => setActiveTab('education')}
        >
          Info
        </button>
      </nav>

      {activeTab === 'check' && (
        <section className="section check-section">
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
        <section className="section report-section">
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
        <section className="section education-section">
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

      <footer className="footer">
        <p>FocusFlow © 2025</p>
      </footer>
    </div>
  );
};

export default App;
