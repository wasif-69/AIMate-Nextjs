import React from "react";
import "./landing.css";
import heroIllustration from "@/public/college.png"; // replace with your image path
import Image from "next/image";
import Link from "next/link";

function HeroBanner() {

  return (
    <section className="hero-banner">
      <div className="hero-content">
        <h1 className="hero-title">Find the Best Colleges Around the World</h1>
        <p className="hero-subtitle">
          Discover your perfect match and start your journey toward a brighter
          future today.
        </p>
        <Link href="/collegefin">
        <button className="hero-cta">
          Start Your Journey
        </button>
        </Link>
      </div>
      <div className="hero-image">
        <Image
          src={heroIllustration}
          alt="Student journey illustration"
          width={heroIllustration.width} // required
          height={heroIllustration.height} // required
        />
      </div>
    </section>
  );
}

export default HeroBanner;
