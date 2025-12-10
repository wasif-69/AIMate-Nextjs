"use client";

import { createUserWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, DocumentData } from "firebase/firestore";
import { auth, db } from "../../Firebase/firebaseConfig";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./Signin.css";

export default function Signin() {
  const [info, setInfo] = useState<DocumentData | null>(null);
  const [userState, setUserState] = useState<User | null>(null); // ✅ type User | null
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
        setUserState(currentUser); // ✅ type-safe
      } else {
        setUserState(null);
        setInfo(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle signup
  const handleForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const student = formData.get("Student") as string;
    const school = formData.get("school") as string;
    const model = formData.get("model") as string;

    try {
      await registerNewUser(email, password, student, school, model);
      console.log("User registered successfully!");
      Router.push("/"); // ✅ fixed navigation
    } catch (err) {
      console.error("Error registering user:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const registerNewUser = async (
    email: string,
    password: string,
    studentName: string,
    institute: string,
    modelInfo: string
  ) => {
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

  const getInfo = async (uid: string): Promise<DocumentData | null> => {
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
          <textarea name="model" rows={4} placeholder="Tell us about yourself..." required />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-filled">
            Register
          </button>
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
