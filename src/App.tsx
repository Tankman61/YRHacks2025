import React, { useState, useEffect } from 'react';
import './App.css';

interface CheckResponse {
  distraction: boolean;
}

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [checkResult, setCheckResult] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // On load, retrieve the active tab's URL using the Chrome Tabs API.
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        if (tabs.length > 0 && tabs[0].url) {
          setUrl(tabs[0].url);
        }
      });
    } else {
      console.warn('Chrome Tabs API is not available.');
    }
  }, []);

  // Toggle between dark and light mode.
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Check the current URL by calling your backend API.
  const checkLink = async (): Promise<void> => {
    if (!url) {
      setCheckResult('No URL provided.');
      return;
    }
    setCheckResult('Checking link...');
    const startTime = performance.now();

    try {
      // Replace with your actual API endpoint URL.
      const response = await fetch(`http://localhost:8000/api/check?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Network response was not OK');
      const data: CheckResponse = await response.json();
      const elapsed = Math.round(performance.now() - startTime);
      setCheckResult(
        data.distraction
          ? `Warning: Distraction detected! (${elapsed}ms) 🚨`
          : `Good job! This link is distraction-free. (${elapsed}ms) 👍`
      );
    } catch (error: any) {
      setCheckResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className={darkMode ? 'App dark' : 'App'}>
      <header className="header">
        <h1>FocusFlow</h1>
        <button className="toggle-mode" onClick={toggleDarkMode}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <div className="content">
        <div className="section">
          <h2>Active Tab</h2>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Your active tab URL will appear here..."
          />
          <button className="check-btn" onClick={checkLink}>
            Check Link
          </button>
          {checkResult && <p className="result">{checkResult}</p>}
        </div>

        <div className="section">
          <h2>Productivity Tips</h2>
          <p>
            FocusFlow helps you stay productive by identifying distracting or dangerous websites. Use the
            information to maintain focus during study sessions:
          </p>
          <ul>
            <li>Avoid clicking suspicious links.</li>
            <li>Plan focused time blocks and take breaks.</li>
            <li>Review your browsing habits regularly.</li>
          </ul>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2025 FocusFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
