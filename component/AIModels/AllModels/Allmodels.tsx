"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/Firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import "./Allmodel.css";

interface Model {
  id: string;
  name_model: string;
  type: string;
  Goals: string;
  [key: string]: any; // in case there are extra fields
}

export default function MyModels() {
  const [models, setModels] = useState<Model[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchModels = async () => {
      if (!auth.currentUser) return;
      try {
        const modelsRef = collection(db, "Student", auth.currentUser.uid, "models");
        const snapshot = await getDocs(modelsRef);
        const modelsData: Model[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Model[];
        setModels(modelsData);
      } catch (err) {
        console.error("Error fetching models:", err);
      }
    };

    fetchModels();
  }, []);

  const continueChat = (modelId: string) => {
    router.push(`/Modelchat/${modelId}`);
  };

  return (
    <div className="models-container">
      <h2>My Chatbots</h2>
      {models.length === 0 ? (
        <p className="no-models">You have no chatbots yet. Create one!</p>
      ) : (
        <div className="models-grid">
          {models.map((model) => (
            <div key={model.id} className="model-card">
              <div className="model-header">
                <h3>{model.name_model}</h3>
                <span className="model-type">{model.type}</span>
              </div>
              <p className="model-goals">{model.Goals}</p>
              <button onClick={() => continueChat(model.id)}>Continue Chat</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
