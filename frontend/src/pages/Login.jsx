import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        form
      );

      // ✅ store user BEFORE redirect
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login successful!");

      // ✅ correct redirect
      navigate("/analyze");

    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;