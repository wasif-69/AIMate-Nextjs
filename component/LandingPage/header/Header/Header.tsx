"use client";

import React, { useState, useEffect } from "react";
import "./Header.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../../../Firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userState, setUserState] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const Router = useRouter();
  const homeNavigate = () => Router.push("/");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUserState(currentUser);
      if (currentUser) {
        const info = await getInfo(currentUser.uid);
        setUserInfo(info);
      } else {
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInfo = async (uid) => {
    try {
      const data = await getDoc(doc(db, "Student", uid));
      return data.exists() ? data.data() : null;
    } catch (err) {
      console.error("Error fetching user info:", err);
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserInfo(null);
      setUserState(null);
      console.log("User logged out");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const loggedInNav = (
    <>
      <div className="user-greeting">Hello, {userInfo?.Student}</div>
      <Link href="/allcommunity"><button className="btn btn-outline">The Social Network!</button></Link>
      <Link href="/quicktest"><button className="btn btn-outline">Quick Test!</button></Link>
      <Link href="/Modelchat"><button className="btn btn-outline">Model Chat</button></Link>
      <Link href="/collegefin"><button className="btn btn-outline">College Finder</button></Link>
      {/* <Link href="/sum"><button className="btn btn-outline">Summarizer</button></Link> */}
      {/* <Link href="/aivoice"><button className="btn btn-outline">AI Voice</button></Link> */}
      <Link href="/feedback"><button className="btn btn-outline">Feedback</button></Link>
      
      <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
    </>
  );

  const loggedOutNav = (
    <>
      <Link href="/login"><button className="btn btn-outline">Login</button></Link>
      <Link href="/signup"><button className="btn btn-filled">Sign Up</button></Link>
      
    </>
  );

  

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      {/* Logo */}
      <div className="logo" onClick={homeNavigate}>
        <span className="sparkle">💡</span>
        <h1 className="logo-text">AImate</h1>
      </div>

      {/* Desktop Nav (only show when logged in) */}
      <nav className="nav">
        {userState && userInfo ? loggedInNav : null}
      </nav>

      {/* Mobile (logged in) */}
      {userState && userInfo ? (
        <>
          {/* Hamburger menu button */}
          <div
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Mobile nav dropdown */}
          <div className={`mobile-nav ${menuOpen ? "show" : ""}`}>
            {loggedInNav}
          </div>
        </>
      ) : (
        // Show login/signup only ONCE for logged out users
        <div className="auth-buttons">{loggedOutNav}</div>
      )}
    </header>
  );
}
