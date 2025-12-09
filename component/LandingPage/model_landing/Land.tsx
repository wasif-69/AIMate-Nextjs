"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/Firebase/firebaseConfig";
import "./Land.css";
import Signup from "@/component/signup/Signup";
import { useRouter } from "next/navigation";

export default function AddModel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signuobox, setsignup] = useState(false);
  const Router = useRouter();

  const goto = () => {
    if (!auth.currentUser) {
      setsignup(true);
      return;
    }
    Router.push("/Modelchat/ModelFoam");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="addmodel-container">
        <h2 className="addmodel-title">Loading...</h2>
      </div>
    );
  }



  return (
    <>
      {signuobox ? (
        <>
          
          <Signup text={"Please Signup to create a Model"} />
        </>
      ) : (
        <>
          <div className="addmodel-container">
            <h2 className="addmodel-title">Create Your AI Model</h2>
            <p className="addmodel-subtitle">
              Build personalized AI companions for stress relief, college
              advice, planning your future, and much more.
            </p>

            <div className="addmodel-sections">
              <div className="addmodel-card">
                <h3>Stress-Free Buddy</h3>
                <p>Talk to an AI that helps reduce stress and stay calm.</p>
                
                  <button className="btn btn-filled" onClick={goto}>Create Model</button>
                
              </div>

              <div className="addmodel-card">
                <h3>College Advice</h3>
                <p>
                  Get guidance on studies, college prep, and career choices.
                </p>
                
                  <button className="btn btn-filled" onClick={goto}>Create Model</button>
                
              </div>

              <div className="addmodel-card">
                <h3>Future Planner</h3>
                <p>
                  Plan your goals and build a smarter future with AI support.
                </p>
                
                  <button className="btn btn-filled" onClick={goto}>Create Model</button>
                
                
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
