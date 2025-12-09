"use client";

import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/Firebase/firebaseConfig";    // ✅ Fix Firebase import
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./Login.css";

export default function LoginPage() {
  const [info, setInfo] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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

    return unsubscribe;
  }, []);

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("mail") as string;
    const password = formData.get("password") as string;

    try {
      const user = await login(email, password);
      const userInfo = await getInfo(user.uid);
      setInfo(userInfo);
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    return credentials.user;
  };

  const getInfo = async (uid: string) => {
    const data = await getDoc(doc(db, "Student", uid));
    return data.exists() ? data.data() : null;
  };

  const logOut = async () => {
    await signOut(auth);
    setInfo(null);
    setUserState(null);
  };

  return (
    <div className="login-container">
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : !userState ? (
        <form className="login-form" onSubmit={handleForm}>
          <h2>Login to Your Account</h2>

          <input type="email" name="mail" placeholder="Email" required autoFocus />
          <input type="password" name="password" placeholder="Password" required />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-filled">
            Login
          </button>
        </form>
      ) : (
        <div className="welcome-card">
          <h2>Welcome back 👋</h2>
          <p>{info?.name ? `Hello, ${info.name}` : "You are logged in!"}</p>
          <button onClick={logOut} className="btn btn-outline">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
