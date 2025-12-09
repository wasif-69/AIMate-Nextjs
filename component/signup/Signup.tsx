import React from "react";
import "./signup.css";
import Link from "next/link";

interface SignupProps{
  text:string;
}

export default function Signup({text}:SignupProps) {


  return (
    <div className="login-prompt-container">
      <div className="login-prompt-box">
        <p className="prompt-text">{text}</p>
        <Link href="/signup" className="prompt-button" aria-label="Go to sign-in page">
          Go To SignUp
        </Link>
      </div>
    </div>
  );
}
