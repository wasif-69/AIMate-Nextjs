"use client";

import React, { useState } from "react";
import { auth, db } from "@/Firebase/firebaseConfig";
import { collection, doc, getDoc, limit, getDocs, query } from "firebase/firestore";

import { savemessage } from "@/Firebase/SAVEMessage";
import EmojiPicker from "emoji-picker-react";

interface ChatInputProps {
  setIsLoading: (val: boolean) => void;
  isLoading: boolean;
  modelId:string
}

export default function ChatInput({ setIsLoading, isLoading,modelId }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


  const send = async () => {
    if (!text.trim() || isLoading || !modelId) return;

    const userMessage = text.trim();
    setText("");
    setIsLoading(true);

    try {
      await savemessage(auth.currentUser.uid, modelId, "User", userMessage);
      await sendMessageToAPI(userMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetch_data = async () => {
    try {
      const ref = doc(db, "Student", auth.currentUser.uid, "models", modelId);
      const data_fetched = await getDoc(ref);
      return data_fetched.data();
    } catch (error) {
      console.log("Error fetching Data (in chat input)", error);
      return null;
    }
  };

  const getFirstThreeDocs = async (uid: string) => {
    const q = query(
      collection(db, "Student", uid, "models", modelId, "Chat"),
      limit(3)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const sendMessageToAPI = async (userText: string) => {
    try {
      const fetched_data = await fetch_data();
      if (!fetched_data) throw new Error("No model data found");
      const history = await getFirstThreeDocs(auth.currentUser.uid);

      const response = await fetch("https://aimate-7rdt.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, ID: fetched_data, history }),
      });

      const data = await response.json();
      if (data.message) {
        await savemessage(auth.currentUser.uid, modelId, "AI", data.message);
      }
    } catch (err) {
      console.error("Error calling API:", err);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <div className="flex items-center gap-3 p-4 border-t border-gray-200 bg-white sticky bottom-0 z-50">
        {/* Emoji Button */}
        <button
          className="text-2xl"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😊
        </button>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-full border-2 border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
        />

        {/* Send Button */}
        <button
          onClick={send}
          disabled={isLoading || !text.trim()}
          className={`px-5 py-3 rounded-full font-medium transition-all ${
            isLoading || !text.trim()
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 transform hover:scale-105 text-white"
          }`}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
