import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", form);
      
      // Save user and redirect
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/analyze"); // ✅ Correct way to redirect in React

    } catch (err) {
      console.error(err);
      // Failsafe error message if the backend doesn't send one
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a', /* Matches main app background */
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px'
    }}>
      
      {/* INJECTED CSS */}
      <style>{`
        .login-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div style={{
        background: '#1e293b',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        border: '1px solid #334155'
      }}>
        
        {/* BRANDING */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '800', 
            margin: '0 0 5px 0', 
            background: 'linear-gradient(to right, #60a5fa, #c084fc)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            DevInsight
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(239,68,68,0.3)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
            <input 
              name="email" 
              type="email"
              className="login-input"
              placeholder="developer@example.com" 
              onChange={handleChange} 
              required
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '15px',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
            <input 
              name="password" 
              type="password" 
              className="login-input"
              placeholder="••••••••" 
              onChange={handleChange} 
              required
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '15px',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '5px'
            }}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
          
        </form>
      </div>
    </div>
  );
}