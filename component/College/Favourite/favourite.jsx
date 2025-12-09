"use client";
import React, { useEffect, useState } from "react";
import { auth,db } from "@/Firebase/firebaseConfig";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import "./favourite.css";



export default function Favourite() {
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const favCollection = collection(db, "Student", user.uid, "Favourite");
        const q = orderBy("university");
        const snapshot = await getDocs(
          collection(db, "Student", user.uid, "Favourite")
        );
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, refreshToggle]);

  const removeFavorite = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "Student", user.uid, "Favourite", id));
      setRefreshToggle(!refreshToggle);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) return <p>Loading your favorites...</p>;

  if (!user) {
    return (
      <div className="login-message-box">
        <h2>Please log in to see your favorite universities.</h2>
      </div>
    );
  }

  function getDomain(url) {
    try {
      const { hostname } = new URL(url);
      return hostname.replace("www.", "");
    } catch {
      return null;
    }
  }

  return (
    <div className="favourites-container">
      <h2 style={{ textAlign: "center", color: "#1976d2" }}>
        🎓 Your Favorite Universities
      </h2>

      {favorites.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          You haven&apos;t marked any universities as favorite yet.
        </p>
      ) : (
        <div className="favorite-grid">
          {favorites.map((uni) => (
            <div key={uni.id} className="favorite-card">
              <div className="sticker-container">
                {uni.website ? (
                  <Image
                    src={`https://logo.clearbit.com/${getDomain(uni.website)}`}
                    alt={`${uni.university} logo`}
                    className="uni-sticker"
                    onError={(e) => {
                      e.target.onerror = null; // prevent infinite loop
                      e.target.src =
                        "https://img.icons8.com/color/96/000000/university.png"; // fallback
                    }}
                  />
                ) : (
                  <Image
                    src="https://img.icons8.com/color/96/000000/university.png"
                    alt="University sticker"
                    className="uni-sticker"
                  />
                )}
              </div>

              <h3>{uni.university}</h3>
              <p>
                <strong>QS Ranking:</strong> {uni.Qs_ranking}
              </p>
              <p>
                <strong>Acceptance Rate:</strong> {uni.acceptance_rate}
              </p>
              <p>
                <strong>Application Deadline:</strong> {uni.deadline}
              </p>
              <p>
                <strong>Scholarship:</strong> {uni.scholarship}
              </p>
              <p>
                <strong>Location:</strong> {uni.location}
              </p>
              <button
                className="visit-btn"
                onClick={() => window.open(uni.website, "_blank")}
              >
                🌐 Visit Website
              </button>
              <button
                className="remove-btn"
                onClick={() => removeFavorite(uni.id)}
              >
                ❌ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
