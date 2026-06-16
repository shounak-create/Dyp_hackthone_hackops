import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Analize() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing...');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // History State
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Authentication Check
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userJson);
      setUser(parsedUser);
      fetchHistory(parsedUser.id);
    }
  }, [navigate]);

  // Fetch History from API
  const fetchHistory = async (userId) => {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analysis/${userId}/`);
      if (res.ok) {
        const data = await res.json();
        data.sort((a, b) => b.id - a.id);
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const fetchAudit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuditData(null);

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
    }, 2000);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/audit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch from backend');
      }

      const data = await response.json();
      setAuditData(data);

      // Save Audit to History in Backend
      if (user) {
        try {
          await fetch('http://127.0.0.1:8000/api/analysis/create/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              summary: `${username} || ${data.brutal_summary}`,
              skill_gaps: JSON.stringify(data.skill_gaps),
              roadmap: JSON.stringify(data.roadmap_90_days),
              estimated_level: data.estimated_level,
              score: 0
            })
          });
          // Refresh local history list
          fetchHistory(user.id);
        } catch (saveErr) {
          console.error("Failed to save audit to history:", saveErr);
        }
      }

    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(loadingInterval);
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    let github_username = "Developer";
    let brutal_summary = item.summary;

    if (item.summary.includes(" || ")) {
      const parts = item.summary.split(" || ");
      github_username = parts[0];
      brutal_summary = parts[1];
    }

    let parsedGaps = [];
    try {
      parsedGaps = JSON.parse(item.skill_gaps);
    } catch {
      parsedGaps = item.skill_gaps ? [item.skill_gaps] : [];
    }

    let parsedRoadmap = [];
    try {
      parsedRoadmap = JSON.parse(item.roadmap);
    } catch {
      parsedRoadmap = [];
    }

    setAuditData({
      github_username: github_username,
      estimated_level: item.estimated_level,
      brutal_summary: brutal_summary,
      skill_gaps: parsedGaps,
      roadmap_90_days: parsedRoadmap
    });

    setHistoryOpen(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      color: 'var(--text-light)',
      fontFamily: 'var(--sans)',
      paddingBottom: '100px'
    }}>
      
      {/* GLASS TOP BAR */}
      <header className="glass-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg height="16" viewBox="0 0 75 65" fill="#f0f6fc">
            <polygon points="37.5,0 75,65 0,65" />
          </svg>
          <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-h)' }}>
            DevInsight
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#3fb950',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '11px', color: 'var(--text)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
              Active
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'var(--mono)' }}>
            {user?.email}
          </span>
          <button 
            onClick={() => setHistoryOpen(true)}
            className="vercel-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            History
          </button>
          <button 
            onClick={handleLogout}
            className="vercel-btn-primary"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* CORE CONTAINER */}
      <main style={{
        maxWidth: '800px',
        margin: '60px auto 0 auto',
        padding: '0 24px'
      }}>
        
        {/* INPUT VIEW */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="gradient-heading" style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            marginBottom: '8px'
          }}>
            AI Career Auditor
          </h1>
          <p className="sub-heading" style={{ margin: '0 auto 32px auto', maxWidth: '500px' }}>
            Enter a developer's GitHub username for a clean, brutal technical review.
          </p>

          <form onSubmit={fetchAudit} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '500px',
            margin: '0 auto',
            position: 'relative'
          }}>
            {/* INLINE GITHUB ICON */}
            <div style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <svg height="16" width="16" viewBox="0 0 16 16" fill="var(--text)">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="github_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="vercel-input"
              style={{
                paddingLeft: '42px',
                height: '42px'
              }}
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="vercel-btn-primary"
              style={{
                height: '42px',
                whiteSpace: 'nowrap'
              }}
            >
              Analyze Profile
            </button>
          </form>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '60px',
            border: '1px solid var(--border)',
            padding: '40px',
            borderRadius: '6px',
            background: 'var(--card-bg)'
          }}>
            <div style={{
              display: 'inline-block',
              width: '24px',
              height: '24px',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--text-h)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '16px'
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '6px', color: 'var(--text-h)' }}>{loadingText}</h2>
            <p style={{ color: 'var(--text)', fontSize: '0.85rem', margin: 0, fontFamily: 'var(--mono)' }}>
              processing audit metrics...
            </p>
          </div>
        )}

        {/* ERROR BOX */}
        {error && !loading && (
          <div style={{
            background: 'var(--error-bg)',
            color: 'var(--error)',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid var(--error-border)',
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            <strong style={{ display: 'block', marginBottom: '2px', fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Execution Error
            </strong>
            {error}
          </div>
        )}

        {/* STACKED CARDS RESULTS VIEW */}
        {auditData?.github_username && !loading && (
          <div className="fade-in-up" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            marginTop: '10px'
          }}>
            
            {/* AUDIT SUMMARY STATS BANNER */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '20px',
              marginBottom: '8px'
            }}>
              <div>
                <span className="mono-badge">
                  Audited Developer
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.8px', color: 'var(--text-h)' }}>
                  {auditData.github_username}
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="mono-badge">
                  Estimated Level
                </span>
                <div style={{
                  background: '#21262d',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  marginTop: '6px',
                  display: 'inline-block',
                  fontFamily: 'var(--mono)'
                }}>
                  {auditData.estimated_level?.toUpperCase()}
                </div>
              </div>
            </div>

            {/* CARD 1: BRUTAL REALITY CHECK */}
            <section className="glow-card">
              <div className="mono-badge" style={{ marginBottom: '16px' }}>
                01 / Brutal Reality Check Summary
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-h)', marginBottom: '12px' }}>
                Brutal Summary
              </h3>
              <p style={{
                color: 'var(--text-light)',
                lineHeight: '1.6',
                fontSize: '0.9rem',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {auditData.brutal_summary}
              </p>
            </section>

            {/* CARD 2: MAJOR SKILL GAPS (HIGHLY CONCISE 2-COLUMN LIST) */}
            <section className="glow-card">
              <div className="mono-badge" style={{ marginBottom: '16px' }}>
                02 / Major Skill Gaps
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-h)', marginBottom: '16px' }}>
                Critical Deficiencies
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '12px 24px'
              }}>
                {auditData.skill_gaps?.map((gap, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.875rem',
                      color: 'var(--text-light)',
                      lineHeight: '1.4'
                    }}
                  >
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--error)',
                      flexShrink: 0
                    }} />
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* CARD 3: 90-DAY ROADMAP (3-COLUMN GRID) */}
            <section className="glow-card">
              <div className="mono-badge" style={{ marginBottom: '16px' }}>
                03 / 90-Day Skill Roadmap
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-h)', marginBottom: '20px' }}>
                Timeline Focus
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {auditData.roadmap_90_days?.map((step, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'rgba(22, 27, 34, 0.5)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      textTransform: 'uppercase'
                    }}>
                      Phase {idx + 1}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-h)' }}>
                      Month {step.month}
                    </h4>
                    <p style={{ color: 'var(--text)', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                      {step.focus}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* AUDIT ANOTHER BUTTON */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                onClick={() => setAuditData(null)}
                className="vercel-btn-secondary"
                style={{ fontSize: '13px' }}
              >
                Audit Another Username
              </button>
            </div>

          </div>
        )}

      </main>

      {/* SIDE HISTORY DRAWER (SMOOTH SLIDE AND BLUR ANIMATIONS) */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        opacity: historyOpen ? 1 : 0,
        pointerEvents: historyOpen ? 'auto' : 'none',
        transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={() => setHistoryOpen(false)}
      >
        {/* DRAWER BODY */}
        <div style={{
          width: '400px',
          maxWidth: '100%',
          height: '100%',
          background: 'var(--card-bg)',
          borderLeft: '1px solid var(--border)',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          transform: historyOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '16px'
          }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '600', margin: 0, color: 'var(--text-h)' }}>Audit History</h2>
            <button 
              onClick={() => setHistoryOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 0.5,
                transition: 'color 0.15s ease'
              }}
              onMouseOver={(e) => e.target.style.color = 'var(--text-h)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text)'}
            >
              &times;
            </button>
          </div>

          {/* HISTORY LIST */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {historyLoading ? (
              <div style={{ color: 'var(--text)', textAlign: 'center', marginTop: '20px', fontFamily: 'var(--mono)' }}>
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div style={{ color: 'var(--text)', textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
                No previous audits found.
              </div>
            ) : (
              history.map((item) => {
                let parsedUser = "Developer";
                if (item.summary.includes(" || ")) {
                  parsedUser = item.summary.split(" || ")[0];
                }
                
                const auditDate = new Date(item.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div 
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    style={{
                      background: '#0d1117',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text)';
                      e.currentTarget.style.backgroundColor = 'var(--card-bg-hover)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.backgroundColor = '#0d1117';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ color: 'var(--text-h)', fontSize: '0.875rem', fontWeight: '600' }}>{parsedUser}</strong>
                      <span style={{ 
                        background: '#21262d', 
                        color: 'var(--text-h)', 
                        border: '1px solid var(--border)',
                        fontSize: '10px', 
                        fontWeight: '600', 
                        padding: '1px 5px', 
                        borderRadius: '3px',
                        fontFamily: 'var(--mono)'
                      }}>
                        {item.estimated_level?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text)', fontSize: '11px', fontFamily: 'var(--mono)' }}>
                      {auditDate}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}