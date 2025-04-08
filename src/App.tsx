import React, { useState, useEffect } from 'react';
import './App.css';

// Define an interface for the FastAPI backend response.
interface CheckResponse {
  distraction: boolean;
}

// Define the functional component with React.FC
const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [checkResult, setCheckResult] = useState<string>('');

  const [reportUrl, setReportUrl] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportMessage, setReportMessage] = useState<string>('');

  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Retrieve the active tab's URL when the extension popup loads.
  useEffect(() => {
    // Check if chrome is defined and has tabs API.
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        if (tabs && tabs.length > 0 && tabs[0].url) {
          const activeTabUrl = tabs[0].url;
          setUrl(activeTabUrl);
          // Optionally, set the report URL as well.
          setReportUrl(activeTabUrl);
        }
      });
    } else {
      console.warn('Chrome Tabs API is not available.');
    }
  }, []);

  // Link checking function that calls the FastAPI backend.
  const checkLink = async (): Promise<void> => {
    if (!url) return;
    setCheckResult('Checking...');

    // Record the start time.
    const startTime = performance.now();

    try {
      // Replace with your API endpoint URL.
      const response = await fetch(`http://localhost:8000/api/check?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      const data: CheckResponse = await response.json();

      // Record the response completion time.
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Update checkResult based on API output.
      if (data.distraction) {
        setCheckResult(`Link Appears Dangerous (Response Time: ${responseTime}ms) 🚨`);
      } else {
        setCheckResult(`Link Appears Safe (Response Time: ${responseTime}ms) 👍`);
      }
    } catch (error: any) {
      setCheckResult('Error: ' + error.message);
    }
  };

  // Reporting logic remains the same.
  const submitReport = (): void => {
    if (!reportUrl) return;
    setReportMessage("Thank you for the report. We'll review it shortly.");
    setReportUrl('');
    setReportDetails('');
  };

  // Feedback logic remains the same.
  const submitFeedback = (): void => {
    if (feedbackRating === 0) return;
    setFeedbackMessage('Thank you for your feedback!');
    setFeedbackRating(0);
    setFeedbackText('');
  };

  return (
    <div className={darkMode ? 'App dark' : 'App'}>
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <div className="brand">Scammurai</div>
        </div>
        <div className="header-center">
          <nav className="navbar">
            <ul>
              <li><a href="#check">Check</a></li>
              <li><a href="#report">Report</a></li>
              <li><a href="#education">Education</a></li>
            </ul>
          </nav>
        </div>
        <div className="header-right">
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      {/* CHECK SECTION */}
      <section id="check" className="section check-section">
        <h2>Check a Link</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Paste your URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="check-btn" onClick={checkLink}>Check Link</button>
        </div>
        {checkResult && <div className="result">{checkResult}</div>}
      </section>

      {/* REPORT SECTION */}
      <section id="report" className="section report-section">
        <h2>Report Suspicious Link</h2>
        <div className="report-form">
          <input
            type="text"
            placeholder="Suspicious URL"
            value={reportUrl}
            onChange={(e) => setReportUrl(e.target.value)}
          />
          <textarea
            placeholder="Add any details or context about this link"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
          />
          <button className="report-btn" onClick={submitReport}>Submit Report</button>
        </div>
        {reportMessage && <div className="report-message">{reportMessage}</div>}
      </section>

      {/* EDUCATION SECTION */}
      <section id="education" className="section education-section">
        <h2>Learn About Scams</h2>
        <p className="education-intro">
          Understanding common scam tactics and how to protect yourself is essential.
        </p>
      </section>

      {/* Optional: FEEDBACK SECTION can be enabled if needed */}
      {/*
      <section id="feedback" className="section feedback-section">
        <h2>Feedback</h2>
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
      */}

      {/* FOOTER */}
      <footer className="footer">
        <p>&copy; 2025 Scammurai. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
