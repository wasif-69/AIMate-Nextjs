"use client";

import { useState, useEffect } from "react";
import { db } from "@/Firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

import mark from "@/public/Mark.png";
import disturb_mark from "@/public/disturbMark.png";

export default function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");
  const [position, setPosition] = useState({ top: "50%", left: "50%" });
  const [isDisturb, setIsDisturb] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 80) + 10;
      const randomLeft = Math.floor(Math.random() * 80) + 10;
      setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setStatus("⚠️ Please write some feedback first.");
      return;
    }

    try {
      await addDoc(collection(db, "Feedback"), {
        feedback,
        createdAt: serverTimestamp(),
      });
      setFeedback("");
      setStatus("✅ Feedback submitted successfully!");
    } catch (error) {
      console.error("Error saving feedback:", error);
      setStatus("❌ Failed to submit feedback.");
    }
  };

  return (
    <section className="relative min-h-screen bg-gray-50 flex flex-col items-center px-6 py-16 overflow-hidden">

      {/* Quote */}
      <div className="max-w-3xl text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed">
          "The biggest risk is not taking any risk. In a world that’s changing
          really quickly, the only strategy that is guaranteed to fail is not
          taking risks."
</h2>
        <p className="text-gray-600 mt-3 font-medium">— Mark Zuckerberg</p>
      </div>

      {/* Floating Image */}
      <Image
        src={isDisturb ? disturb_mark : mark}   // ✅ FIXED
        alt="Mark Zuckerberg"
        width={180}                              // required for next/image
        height={180}
        className="absolute cursor-pointer object-contain transition-transform duration-300 hover:scale-110 z-10"
        style={{
          top: position.top,
          left: position.left,
          transform: "translate(-50%, -50%)",
        }}
        onClick={() => setIsDisturb(!isDisturb)}
      />

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg flex flex-col gap-4 z-20 mt-32 md:mt-48"
      >
        <textarea
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-lg font-medium transition-all"
        >
          Submit Feedback
        </button>
      </form>

      {status && (
        <p className="mt-4 text-lg font-medium text-gray-700">{status}</p>
      )}
    </section>
  );
}
