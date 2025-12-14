"use client";

import React, { useEffect, useState } from "react";
import WorldMap from "../Map/map";
import LoadingOverlay from "../Loading/Load";
import { addModelToData } from "@/Firebase/model";
import { auth } from "@/Firebase/firebaseConfig";
import { useRouter } from "next/navigation"; 
import { savemessage } from "@/Firebase/SAVEMessage";
import { addfavorate } from "@/Firebase/favorate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Signup from "@/component/signup/Signup";
import Image from "next/image";
import "./CollegeMap.css";
import { onAuthStateChanged } from "firebase/auth";

/* ------------------ TYPES ------------------ */

interface Recommendation {
  university: string;
  logo_url?: string;
  official_website?: string;
  qs_ranking?: string;
  acceptance_rate?: string;
  application_deadline?: string;
  location?: string;
  scholarship?: string;
}

interface DataFormType {
  recommendations: Recommendation[];
}

/* ------------------ COMPONENT ------------------ */

export default function CollegeMatch() {
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [loginPage, setLoginPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [worldmap, setMap] = useState(false);
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [dataForm, setData] = useState<DataFormType | null>(null);

  /* ------------------ FORM STATE ------------------ */

  const [form, setForm] = useState({
    Class: "",
    Grades: "",
    scholarship: 0,
    comment: "",
    standardize: false,
    language: false,
    standardize_score: "",
    test: "",
    proficiency: "",
    language_score: "",
    extracurricular: "",
    Interested_fields: "",
  });

  /* ------------------ AUTH LISTENER ------------------ */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  /* ------------------ FORM HANDLERS ------------------ */

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const target = e.target;

  const name = target.name;
  const value = target.value;

  // checkbox is ONLY for input elements
  const isCheckbox =
    target instanceof HTMLInputElement && target.type === "checkbox";

  setForm((prev) => ({
    ...prev,
    [name]: isCheckbox ? target.checked : value,
  }));
};

  /* ------------------ API: SUBMIT FORM ------------------ */

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (!uid) {
      setLoginPage(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://aimate-7rdt.onrender.com/uniFinder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, countries: countriesList }),
      });

      const data = await response.json();

      if (data.status === "PASS") {
        // FIX: convert array into object that matches our interface
        setData({ recommendations: data.message });
        toast.success("University matches found!");
      } else {
        toast.error("No results found. Please adjust inputs.");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ CHAT MODEL ------------------ */

  const chatModel = async (universityName: string) => {
    if (!uid) {
      setLoginPage(true);
      return;
    }

    setLoading(true);
    try {
      const modelId = await addModelToData(
        uid,
        universityName,
        "counselor",
        `To get into ${universityName}`,
        "professional"
      );

      const response = await fetch("https://aimate-7rdt.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: universityName, ID: "none" }),
      });

      const data = await response.json();

      if (data.message) {
        await savemessage(uid, modelId, "AI", data.message);
      }

      router.push(`/chat/${modelId}`);
    } catch (err) {
      toast.error("Failed to start chat.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ ADD TO FAVORITE ------------------ */

  const addFavorite = async (rec: Recommendation) => {
    if (!uid) {
      setLoginPage(true);
      return;
    }

    try {
      await addfavorate(
        uid,
        rec.university,
        rec.qs_ranking,
        rec.acceptance_rate,
        rec.application_deadline,
        rec.scholarship,
        rec.location,
        rec.official_website
      );
      toast.success("Added to favorites!");
    } catch (err) {
      toast.error("Could not add to favorites.");
      console.error(err);
    }
  };

  /* ------------------ SAFE DOMAIN PARSER ------------------ */

function getDomain(url: string | null | undefined) {
  try {
    if (!url) return null;
    const { hostname } = new URL(url);
    return hostname.replace("www.", "");
  } catch {
    return null;
  }
}


  /* ------------------ RENDER ------------------ */

  if (loginPage) return <Signup text="Please Signup to explore Colleges" />;

  return (
    <div className="college-match-container">
      {loading && <LoadingOverlay />}

      {dataForm?.recommendations.length ? (
        <div className="recommendation-list">
          <h2 className="result-heading">Your Recommended Universities</h2>

          {dataForm.recommendations.map((rec, index) => (
            <div className="recommendation-card" key={rec.university || index}>
              <div className="university-header">

                <Image
                  src={
                    rec.logo_url
                      ? rec.logo_url
                      : `https://logo.clearbit.com/${getDomain(rec.official_website)}`
                  }
                  alt={`${rec.university} logo`}
                  className="university-logo"
                  width={80}
                  height={80}
                  onError={(e: any) => {
                    e.target.src = "https://img.icons8.com/color/96/000000/university.png";
                  }}
                />

                <h3>{rec.university}</h3>
              </div>

              <p><strong>QS Rank:</strong> {rec.qs_ranking}</p>
              <p><strong>Acceptance Rate:</strong> {rec.acceptance_rate}</p>
              <p><strong>Deadline:</strong> {rec.application_deadline}</p>
              <p><strong>Location:</strong> {rec.location}</p>
              <p><strong>Scholarship upto:</strong> {rec.scholarship}</p>

              <a href={rec.official_website} className="website-link" target="_blank">
                Visit Website
              </a>

              <div className="button-group">
                <button onClick={() => chatModel(rec.university)}>Chat</button>
                <button onClick={() => addFavorite(rec)}>Favorite</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ------------------ FORM UI ------------------ */
        <form className="college-form" onSubmit={handleSubmit}>
          <h2>University Finder</h2>

          <div className="form-section">Academic Information</div>
          <div className="input-group">
            <input name="Class" placeholder="Your Class" value={form.Class} onChange={handleChange} />
            <input name="Grades" placeholder="Grades or Percentage" value={form.Grades} onChange={handleChange} />
          </div>

          <div className="form-section">Standardized Test</div>
          <label>
            <input type="checkbox" name="standardize" checked={form.standardize} onChange={handleChange} />
            Took Standardized Test?
          </label>

          {form.standardize && (
            <div className="nested-section">
              <label><input type="radio" name="test" value="SAT" checked={form.test === "SAT"} onChange={handleChange} /> SAT</label>
              <label><input type="radio" name="test" value="ACT" checked={form.test === "ACT"} onChange={handleChange} /> ACT</label>
              <label><input type="radio" name="test" value="OTHER" checked={form.test === "OTHER"} onChange={handleChange} /> Other</label>
              <input name="standardize_score" placeholder="Score" value={form.standardize_score} onChange={handleChange} />
            </div>
          )}

          <div className="form-section">Language Proficiency</div>
          <label>
            <input type="checkbox" name="language" checked={form.language} onChange={handleChange} />
            Took Language Proficiency Test?
          </label>

          {form.language && (
            <div className="nested-section">
              <label><input type="radio" name="proficiency" value="IELTS" checked={form.proficiency === "IELTS"} onChange={handleChange} /> IELTS</label>
              <label><input type="radio" name="proficiency" value="TOFEL" checked={form.proficiency === "TOFEL"} onChange={handleChange} /> TOFEL</label>
              <label><input type="radio" name="proficiency" value="German" checked={form.proficiency === "German"} onChange={handleChange} /> German</label>
              <label><input type="radio" name="proficiency" value="Others" checked={form.proficiency === "Others"} onChange={handleChange} /> Other</label>
              <input name="language_score" placeholder="Language Score" value={form.language_score} onChange={handleChange} />
            </div>
          )}

          <div className="form-section">Profile</div>
          <textarea name="extracurricular" placeholder="Extracurricular Activities" value={form.extracurricular} onChange={handleChange} />
          <input name="Interested_fields" placeholder="Interested Fields" value={form.Interested_fields} onChange={handleChange} />

          <div className="range-label">Scholarship Preference: {form.scholarship}%</div>
          <input type="range" name="scholarship" min="0" max="100" step="10" value={form.scholarship} onChange={handleChange} />

          <textarea name="comment" placeholder="Additional Comments" value={form.comment} onChange={handleChange} />

          <div className="map-toggle">
            <input type="checkbox" onChange={() => setMap(!worldmap)} /> Select Countries
          </div>

          {worldmap && <WorldMap counterieslist={countriesList} setcounterieslist={setCountriesList} />}

          <button type="submit" className="submit-btn">Find Universities</button>
        </form>
      )}
    </div>
  );
}
