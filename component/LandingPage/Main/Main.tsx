"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { auth } from "@/Firebase/firebaseConfig";
import "./Main.css";
import robot from "@/public/robot (2).png";
import Link from "next/link";
import Image from "next/image";

export default function Main() {
  const [user, setUser] = useState(null);

  useEffect(() => {

    const wakeup=async ()=>{
      const response = await fetch("https://aimate-7rdt.onrender.com/ping");
      console.log("API wake-up ping sent", response.status);
    }

    wakeup();

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    

    <div className="box-main-Main">
  <section className="hero-container_Main">
      {/* Robot Image */}
      
      <motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
>
  <Image src={robot} alt="AI Robot" className="hero-robot" />
</motion.div>

      {/* Title */}
      <h1 className="hero-title-main">
         <span className="highlight">Meet AImate</span>
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle-main">
        Your AI companion — always ready to chat, assist, and grow with you.
      </p>

      {/* Buttons - conditional */}
      <div className="hero-buttons">
        {!user ? (
          <Link href="/signup">
            <button className="btn-primary">Sign up to Get Started</button>
          </Link>
        ) : (
          <>
            <Link href="/chatModels">
              <button className="btn-primary">Model Chat</button>
            </Link>
            <Link href="/quicktest">
              <button className="btn-secondary">Take Test</button>
            </Link>
          </>
        )}
      </div>
    </section>
</div>

  );
}
