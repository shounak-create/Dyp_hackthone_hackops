import { useState } from 'react';

export default function Analize() {
  const [username, setUsername] = useState('');
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing...');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  const fetchAudit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuditData(null);
    setActiveTab('summary');

    const messages = [
      "Fetching repositories...",
      "Analyzing commit history...",
      "Evaluating architecture...",
      "Preparing reality check..."
    ];

    let i = 0;
    const loadingInterval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 3000);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/audit/', {
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
    <div style={{
      maxWidth: '900px',
      margin: '50px auto',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>

      {/* INPUT */}
      {!auditData && !loading && (
        <div style={{ textAlign: 'center' }}>
          <h1>AI Career Auditor</h1>
          <p>Enter a GitHub username for a brutal reality check.</p>

          <form onSubmit={fetchAudit}>
            <input
              type="text"
              placeholder="e.g., octocat"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: '12px',
                fontSize: '16px',
                width: '280px',
                borderRadius: '6px',
                border: '1px solid #ccc'
              }}
              required
            />

            <button
              type="submit"
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                marginLeft: '10px',
                cursor: 'pointer',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#000',
                color: '#fff'
              }}
            >
              Analyze
            </button>
          </form>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>{loadingText}</h2>
          <p>Please wait. AI is analyzing the code...</p>
        </div>
      )}

      {/* RESULT */}
      {auditData?.github_username && !loading && (
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '10px',
          padding: '25px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          minHeight: '500px',                 // ✅ FIXED CONTAINER HEIGHT
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>

          {/* HEADER */}
          <div>
            <h2 style={{
              color: '#111',
              fontWeight: '600',
              marginBottom: '5px'
            }}>
              {auditData.github_username}
            </h2>

            <p style={{ color: '#555', marginBottom: '20px' }}>
              Estimated Level: <strong>{auditData.estimated_level}</strong>
            </p>

            {/* TABS */}
            <div style={{
              display: 'flex',
              width: '100%',
              borderBottom: '2px solid #eee',
              marginBottom: '20px'
            }}>
              {[
                { key: 'summary', label: 'Summary' },
                { key: 'gaps', label: 'Skill Gaps' },
                { key: 'roadmap', label: 'Roadmap' }
              ].map(tab => (
                <div
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '12px 0',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab.key ? '600' : '400',
                    borderBottom: activeTab === tab.key
                      ? '3px solid #000'
                      : '3px solid transparent',
                    color: activeTab === tab.key ? '#000' : '#777',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>

            {/* FIXED CONTENT BOX */}
            <div style={{
              height: '260px',                 // ✅ FIXED HEIGHT
              overflowY: 'auto',               // ✅ SCROLL
              padding: '15px',
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
              backgroundColor: '#fafafa'
            }}>

              {/* SUMMARY */}
              {activeTab === 'summary' && (
                <div>
                  <h4 style={{ marginTop: '0px' }}>Brutal Reality Check</h4>
                  <p style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.6'
                  }}>
                    {auditData.brutal_summary}
                  </p>
                </div>
              )}

              {/* GAPS */}
              {activeTab === 'gaps' && (
                <div>
                  <h4 style={{ marginTop: '0px' }}>Major Skill Gaps</h4>
                  <ul style={{
                    color: '#d9534f',
                    lineHeight: '1.8',
                    paddingLeft: '20px'
                  }}>
                    {auditData.skill_gaps?.map((gap, idx) => (
                      <li key={idx} style={{ wordBreak: 'break-word' }}>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ROADMAP */}
              {activeTab === 'roadmap' && (
                <div>
                  <h4 style={{ marginTop: '0px' }}>90-Day Roadmap</h4>
                  <ul style={{
                    color: '#28a745',
                    lineHeight: '1.8',
                    paddingLeft: '20px'
                  }}>
                    {auditData.roadmap_90_days?.map((step, idx) => (
                      <li key={idx} style={{ wordBreak: 'break-word' }}>
                        <strong>Month {step.month}:</strong> {step.focus}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          {/* FOOTER BUTTON */}
          <button
            onClick={() => setAuditData(null)}
            style={{
              marginTop: '20px',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: '#f5f5f5'
            }}
          >
            Audit Another User
          </button>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p style={{
          color: 'red',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          Error: {error}
        </p>
      )}

    </div>
  );
}