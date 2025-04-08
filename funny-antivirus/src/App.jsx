import { useState } from 'react';
import './App.css';

function App() {

  const [url, setUrl] = useState('');
  const [checkResult, setCheckResult] = useState('');

  const [reportUrl, setReportUrl] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  const [darkMode, setDarkMode] = useState(false);

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // link checking basic logic
  const checkLink = () => {
    if (!url) return;
    const isScam = Math.random() > 0.5;
    setCheckResult(isScam ? 'Scam Detected! 🚨' : 'Link Appears Safe 👍');
  };

  // reporting basic logic
  const submitReport = () => {
    if (!reportUrl) return;
    setReportMessage("Thank you for the report. We'll review it shortly.");
    setReportUrl('');
    setReportDetails('');
  };

  // feedback thing basic logic
  const submitFeedback = () => {
    if (feedbackRating === 0) return;
    setFeedbackMessage('Thank you for your feedback!');

    setFeedbackRating(0);
    setFeedbackText('');
  };

  return (
    <div className={darkMode ? 'App dark' : 'App'}>
      <header className="header">
        <div className="brand">Scammurai</div>
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
          <button onClick={checkLink}>Check Link</button>
        </div>
        {checkResult && <div className="result">{checkResult}</div>}
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
              <li>If something seems off, it probably is—verify before clicking.</li>
            </ul>
          </div>
          <div className="education-card">
            <h3>Preventative Measures</h3>
            <ul>
              <li>Use strong, unique passwords with multi-factor authentication.</li>
              <li>Keep your software and security patches up to date.</li>
              <li>Monitor accounts regularly for suspicious activity.</li>
            </ul>
          </div>
          <div className="education-card">
            <h3>Stay Informed</h3>
            <ul>
              <li>Follow reputable cybersecurity blogs and websites.</li>
              <li>Be aware of the latest phishing trends and techniques.</li>
              <li>Report scams to authorities and organizations promptly.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="feedback" className="section feedback-section">
        <h2>Feedback</h2>
        <p className="feedback-intro">
          We value your feedback. Please let us know how we can improve your experience.
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
        <p>&copy; 2025 Scammurai. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
