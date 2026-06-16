import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${API_URL}/api/signup/`,
        form
      );

      alert("Signup successful!");
      navigate("/"); // Redirect to login page
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px'
    }}>
      
      {/* BRANDING IDENTIFIER (OFF-WHITE TRIANGLE) */}
      <div style={{ marginBottom: '24px' }}>
        <svg height="32" viewBox="0 0 75 65" fill="#f0f6fc">
          <polygon points="37.5,0 75,65 0,65" />
        </svg>
      </div>

      <div style={{
        background: '#161b22',
        padding: '32px 40px',
        borderRadius: '6px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #30363d',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        
        {/* BRANDING */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '1.4rem', 
            fontWeight: '600', 
            margin: '0 0 8px 0', 
            color: '#f0f6fc',
            letterSpacing: '-0.5px'
          }}>
            Create an Account
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', margin: 0 }}>
            Enter your details to register for DevInsight
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{
            background: 'var(--error-bg)',
            color: 'var(--error)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--error-border)',
            marginBottom: '24px',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* SIGNUP FORM */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <input 
              name="email" 
              type="email"
              placeholder="developer@example.com" 
              onChange={handleChange} 
              required
              className="vercel-input"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              GitHub Username
            </label>
            <input 
              name="username" 
              type="text"
              placeholder="octocat" 
              onChange={handleChange} 
              required
              className="vercel-input"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              onChange={handleChange} 
              required
              className="vercel-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="vercel-btn-primary"
            style={{
              marginTop: '8px',
              width: '100%'
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '16px', 
            borderTop: '1px solid #30363d',
            paddingTop: '20px'
          }}>
            <span style={{ color: '#8b949e', fontSize: '0.875rem' }}>Already have an account? </span>
            <button 
              type="button"
              onClick={() => navigate("/")}
              style={{
                background: 'none',
                border: 'none',
                color: '#58a6ff',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0',
                textDecoration: 'underline'
              }}
            >
              Sign In
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}