import { useState } from 'react';

export default function App() {
  const [username, setUsername] = useState('');
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing...');
  const [error, setError] = useState('');

  const fetchAudit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuditData(null);

    // Fake loading text cycle to keep judges engaged
    const messages = ["Fetching repositories...", "Analyzing commit history...", "Evaluating architecture...", "Preparing reality check..."];
    let i = 0;
    const loadingInterval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 3000);

    try {
      const response = await fetch('http://127.0.0.1:8000/audit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
      });

      if (!response.ok) throw new Error('Failed to fetch from backend');
      
      const data = await response.json();
      setAuditData(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(loadingInterval);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      
      {/* STATE 1: The Search Bar */}
      {!auditData && (
        <div style={{ textAlign: 'center' }}>
          <h1>AI Career Auditor</h1>
          <p>Enter a GitHub username for a brutal reality check.</p>
          <form onSubmit={fetchAudit}>
            <input 
              type="text" 
              placeholder="e.g., octocat" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '10px', fontSize: '16px', width: '300px' }}
              required
            />
            <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px', cursor: 'pointer' }}>
              Analyze Codebase
            </button>
          </form>
        </div>
      )}

      {/* STATE 2: The Loading Screen */}
      {loading && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>{loadingText}</h2>
          <p>Please wait. AI is reading the code...</p>
        </div>
      )}

      {/* STATE 3: The Result Dashboard */}
      {auditData && !loading && (
        <div style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Profile: {auditData.github_username}</h2>
          <h3 style={{ color: '#d9534f' }}>Level: {auditData.estimated_level}</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>The Brutal Reality Check</h4>
            <p>{auditData.brutal_summary}</p>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h4>Major Skill Gaps</h4>
              <ul style={{ color: '#d9534f' }}>
                {auditData.skill_gaps?.map((gap, idx) => (
                  <li key={idx}>{gap}</li>
                ))}
              </ul>
            </div>

            <div style={{ flex: 1 }}>
              <h4>90-Day Survival Roadmap</h4>
              <ul style={{ color: '#5cb85c' }}>
                {auditData.roadmap_90_days?.map((step, idx) => (
                  <li key={idx}><strong>Month {step.month}:</strong> {step.focus}</li>
                ))}
              </ul>
            </div>
          </div>

          <button onClick={() => setAuditData(null)} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>
            Audit Another User
          </button>
        </div>
      )}

      {/* Error State */}
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>Error: {error}</p>}
      
    </div>
  );
}