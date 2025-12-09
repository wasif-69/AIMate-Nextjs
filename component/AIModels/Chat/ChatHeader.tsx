"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/Firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface HeaderChatProps {
  modelId: string;
}

export default function HeaderChat({ modelId }: HeaderChatProps) {
  const [modelName, setModelName] = useState<string>("");
  const [chatStyle, setChatStyle] = useState<string>("");
  const [goals, setGoals] = useState<string>("");
  const [showGoals, setShowGoals] = useState<boolean>(false);

  const getStyleEmoji = (style: string) => {
    switch (style.toLowerCase()) {
      case "introvert":
        return "🧘‍♂️";
      case "extrovert":
        return "🎉";
      case "professional":
        return "💼";
      case "friendly":
        return "😊";
      case "funny":
        return "😂";
      default:
        return "🤖";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        const docRef = doc(
          db,
          "Student",
          auth.currentUser.uid,
          "models",
          modelId
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setModelName(data.name_model || "");
          setChatStyle(data.counselor || "");
          setGoals(data.Goals || "");
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [modelId]);

  // Inline styles equivalent to your CSS
  const styles = {
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 20px",
      background: "linear-gradient(90deg, #7e57c2 0%, #1976d2 100%)",
      color: "#ffffff",
      position: "sticky" as const,
      top: 0,
      zIndex: 1000,
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    chatInfo: {
      display: "flex",
      alignItems: "center",
      fontSize: 18,
      fontWeight: 600,
      gap: 8,
    },
    chatName: {
      display: "flex",
      alignItems: "center",
      fontSize: 17,
      gap: 8,
    },
    chatActions: {
      position: "relative" as const,
    },
    goalsButton: {
      background: "rgba(255, 255, 255, 0.15)",
      border: "none",
      color: "#fff",
      padding: "8px 14px",
      fontSize: 14,
      fontWeight: 500,
      borderRadius: 20,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      transition: "background-color 0.2s ease, transform 0.2s ease",
    },
    goalsButtonHover: {
      background: "rgba(255, 255, 255, 0.25)",
      transform: "scale(1.03)",
    },
    chevron: {
      fontSize: 10,
    },
    goalsContent: {
      position: "absolute" as const,
      right: 0,
      top: 42,
      backgroundColor: "#ffffff",
      color: "#333",
      padding: "12px 16px",
      borderRadius: 8,
      minWidth: 220,
      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
      zIndex: 9999,
      fontSize: 14,
      lineHeight: 1.5,
      animation: "fadeIn 0.2s ease-in-out",
    },
    emoji: {
      fontSize: 22,
    },
  };

  return (
    <div style={styles.header}>
      <div style={styles.chatInfo}>
        <span style={styles.chatName} data-emoji={getStyleEmoji(chatStyle)}>
          {modelName}
        </span>
      </div>

      <div style={styles.chatActions}>
        <button
          style={styles.goalsButton}
          onClick={() => setShowGoals(!showGoals)}
          aria-expanded={showGoals}
        >
          🎯 Goals <span style={styles.chevron}>{showGoals ? "▲" : "▼"}</span>
        </button>
        {showGoals && (
          <div style={styles.goalsContent}>
            <p>{goals}</p>
          </div>
        )}
      </div>
    </div>
  );
}
