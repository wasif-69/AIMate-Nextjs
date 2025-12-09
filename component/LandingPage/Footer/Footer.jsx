import React from "react";
import Link from "next/link";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      
      <div className="footer-content">
        {/* Left section */}
        <div className="footer-brand">
          <h3>AImate</h3>
          <p>Your personal AI companion for learning, growth, and fun.</p>
        </div>

        {/* Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/createmodel">Create Model</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/signup">Signup</Link></li>
            
          </ul>
        </div>

        {/* Contact / Social */}
        <div className="footer-social">
          <h4>Connect</h4>
          <ul>
            <li><a href="mailto:support@aimate.com">support@aimate.com</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} AImate. All rights reserved.</p>
      </div>
    </footer>
  );
}
