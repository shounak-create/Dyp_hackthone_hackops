import { useState } from "react";
import axios from "axios";
import { redirect } from "react-router";

function Signup() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/signup/",
        form
      );

      alert("Signup successful!");
      redirect("/")
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Signup</h2>

      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />

      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
    margin: "100px auto",
  },
};

export default Signup;