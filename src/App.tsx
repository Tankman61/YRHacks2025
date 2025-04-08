import React, { useState } from 'react';
import './App.css';

const API_ENABLE_PROTECTION = 'http://localhost:8000/api/enable-protection';

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
  const [protectionEnabled, setProtectionEnabled] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const checkLink = async () => {
    if (!url) {
      setCheckResult('No URL provided.');
      return;
    }
    setCheckResult('Checking link...');
    const startTime = performance.now();

    try {
      const response = await fetch(`http://localhost:8000/api/check?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Network response was not OK');
      const data = await response.json();
      const elapsed = Math.round(performance.now() - startTime);
      setCheckResult(
        data.distraction
          ? `Dangerous (Response Time: ${elapsed}ms) 🚨`
          : `Not Dangerous (Response Time: ${elapsed}ms) 👍`
      );
    } catch (error: any) {
      setCheckResult(`Error: ${error.message}`);
    }
  };

  const enableProtection = async () => {
    try {
      const response = await fetch(API_ENABLE_PROTECTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      });
      if (!response.ok) throw new Error('Failed to enable protection');

      setProtectionEnabled(true);
    } catch (error: any) {
      console.error('Enable protection failed:', error.message);
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

  return (
    <div className={darkMode ? 'App dark' : 'App'}>
      <header className="header">
        <div className="brand">FocusFlow</div>
        <nav className="navbar">
          <ul>
            <li><a href="#check">Check</a></li>
            <li><a href="#report">Report</a></li>
            <li><a href="#education">Education</a></li>
            <li><a href="#feedback">Feedback</a></li>
          </ul>
        </nav>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

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

        <div className="protection-controls">
          <button onClick={enableProtection}>
            {protectionEnabled ? 'Protection Enabled ✅' : 'Enable Protection 🔒'}
          </button>
          <button onClick={() => setKeyboardVisible(prev => !prev)}>
            {keyboardVisible ? 'Hide On-Screen Keyboard ⌨️' : 'Show On-Screen Keyboard ⌨️'}
          </button>
          <button onClick={() => alert('Redirect to phishing report page')}>
            Report Phishing 🚩
          </button>
        </div>
      </section>

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
            placeholder="Add details or context about this link..."
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
          />
          <button onClick={submitReport}>Submit Report</button>
        </div>
        {reportMessage && <div className="report-message">{reportMessage}</div>}
      </section>

      <section id="education" className="section education-section">
        <h2>Learn About Scams</h2>
        <p className="education-intro">
          Understanding common scam tactics and how to protect yourself is essential.
          Below are some quick tips to keep in mind:
        </p>
        <div className="education-cards">
          <div className="education-card">
            <h3>How to Spot a Scam</h3>
            <ul>
              <li>Check for urgent, threatening language or unbelievable offers.</li>
              <li>Examine URLs carefully; watch out for subtle spelling differences.</li>
              <li>If something seems off, verify before clicking.</li>
            </ul>
          </div>
          <div className="education-card">
            <h3>Preventative Measures</h3>
            <ul>
              <li>Use strong, unique passwords with multi-factor authentication.</li>
              <li>Keep your software up-to-date.</li>
              <li>Review your browsing habits regularly.</li>
            </ul>
          </div>
          <div className="education-card">
            <h3>Stay Informed</h3>
            <ul>
              <li>Follow reputable cybersecurity blogs.</li>
              <li>Be aware of the latest phishing trends.</li>
              <li>Report scams to authorities promptly.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="feedback" className="section feedback-section">
        <h2>Feedback</h2>
        <p className="feedback-intro">
          We value your feedback. Let us know how we can improve FocusFlow.
        </p>
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

      <footer className="footer">
        <p>&copy; 2025 FocusFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
