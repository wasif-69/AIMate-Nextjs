"use client";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../Firebase/firebaseConfig";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./Signin.css";

export default function Signin() {
  const [info, setInfo] = useState(null);
  const [userState, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const Router = useRouter();

  // Watch auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const userInfo = await getInfo(currentUser.uid);
        setInfo(userInfo);
        setUserState(currentUser);
      } else {
        setUserState(null);
        setInfo(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle signup
  const handleForm = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const student = formData.get("Student");
    const school = formData.get("school");
    const model = formData.get("model");

    try {
      await registerNewUser(email, password, student, school, model);
      console.log("User registered successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error registering user:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const registerNewUser = async (email, password, studentName, institute, modelInfo) => {
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredentials.user;

    await setDoc(doc(db, "Student", user.uid), {
      userID: user.uid,
      email,
      Student: studentName,
      ins: institute,
      model: modelInfo,
    });

    return user;
  };

  const getInfo = async (uid) => {
    const data = await getDoc(doc(db, "Student", uid));
    return data.exists() ? data.data() : null;
  };

  return (
    <div className="signin-container">
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : !userState ? (
        <form className="signin-form" onSubmit={handleForm}>
          <h2>Register Your Account</h2>

          <input type="email" name="email" placeholder="Email" required autoFocus />
          <input type="password" name="password" placeholder="Password" required />
          <input type="text" name="Student" placeholder="Full Name" required />
          <input type="text" name="school" placeholder="School / Institute" required />
          <textarea name="model" rows="4" placeholder="Tell us about yourself..." required></textarea>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-filled">Register</button>
        </form>
      ) : (
        <div className="welcome-card">
          <h2>Welcome 🎉</h2>
          <p>{info?.Student ? `Hello, ${info.Student}` : "Your account has been created!"}</p>
        </div>
      )}
    </div>
  );
}
