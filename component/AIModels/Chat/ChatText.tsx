"use client";

import React, { useState, useEffect, useRef } from "react";
import { savemessage } from "@/Firebase/SAVEMessage";
import { auth, db } from "@/Firebase/firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface Message {
  id: string;
  sender: "User" | "AI";
  message: string;
  time?: any;
}

interface ChatTextProps {
  isLoading: boolean;
  modelId:string;
}

export default function ChatText({ isLoading,modelId }: ChatTextProps) {
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    const box = chatBoxRef.current;
    if (!box) return;

    const distanceFromBottom =
      box.scrollHeight - box.scrollTop - box.clientHeight;
    setShowScrollButton(distanceFromBottom > 150);
  };

  useEffect(() => {
    const box = chatBoxRef.current;
    if (box) {
      box.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (box) box.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !modelId) return;

    const messagesRef = collection(
      db,
      "Student",
      auth.currentUser.uid,
      "models",
      modelId,
      "Chat"
    );
    const q = query(messagesRef, orderBy("time", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(msgs);

      if (msgs.length === 0) {
        await savemessage(
          auth.currentUser.uid,
          modelId,
          "AI",
          "Hey There! how can I help you today"
        );
      }

      scrollToBottom();
    });

    return () => unsubscribe();
  }, [modelId]);

  return (
    <div className="relative h-[calc(100vh-180px)] overflow-y-auto p-5 bg-white flex flex-col gap-3" ref={chatBoxRef}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-3/4 p-3 rounded-xl relative break-words text-sm ${
            msg.sender === "User"
              ? "self-end bg-purple-600 text-white rounded-br-none"
              : "self-start bg-gray-200 text-gray-800 rounded-bl-none"
          }`}
        >
          <p>{msg.message}</p>
          {msg.time && (
            <span className="text-xs opacity-60 block text-right mt-1">
              {msg.time?.toDate?.()?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-gray-200 rounded-xl self-start italic w-fit animate-pulse">
          <span>Typing</span>
          <span className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce delay-0"></span>
          <span className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce delay-200"></span>
          <span className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce delay-400"></span>
        </div>
      )}

      <div ref={chatEndRef} />

      {/* Scroll-to-bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg z-10"
        >
          ⬇
        </button>
      )}
    </div>
  );
}
