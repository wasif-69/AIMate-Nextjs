"use client";
import React, { useState } from "react";
import { addModelToData } from "@/Firebase/model";
import { auth } from "@/Firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CreateModel.css";

interface Option {
  label: string;
  tooltip: string;
}

export default function ModelForm() {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [goals, setGoals] = useState<string>("");

const router = useRouter();

  // Validation helper
  const validateStep = (): boolean => {
    if (step === 1 && !name.trim()) {
      toast.warn("Please enter a model name.");
      return false;
    }
    if (step === 2 && (!style || !type)) {
      toast.warn("Please select both Style and Type.");
      return false;
    }
    if (step === 3 && !goals.trim()) {
      toast.warn("Please enter your goals.");
      return false;
    }
    return true;
  };

  const nextStep = (): void => {
    if (validateStep()) setStep((prev) => Math.min(prev + 1, 4));
  };
  const prevStep = (): void => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep()) return;
    try {
      if (!auth.currentUser?.uid) {
        toast.error("User not authenticated.");
        return;
      }

      const modelID = await addModelToData(auth.currentUser.uid, name, style, goals, type);
      toast.success("🎉 Model created successfully!");
      setTimeout(() => router.push(`/Modelchat/${modelID}`), 1500);
    } catch (e: unknown) {
      console.error("ERROR:", e);
      toast.error("❌ Failed to add model.");
    }
  };

  const styleOptions: Option[] = [
    { label: "Introvert", tooltip: "Prefers calm, introspective communication" },
    { label: "Extrovert", tooltip: "Outgoing and expressive" },
    { label: "Professional", tooltip: "Formal and business-like tone" },
  ];

  const typeOptions: Option[] = [
    { label: "Stress Manager", tooltip: "Helps manage and reduce stress" },
    { label: "Counselor", tooltip: "Provides empathetic counseling" },
    { label: "Planner", tooltip: "Organizes and plans effectively" },
  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="form-wrapper">
        <form className="model-form" onSubmit={(e) => e.preventDefault()} aria-label="Create your AI Model">
          <h2 className="form-title">🚀 Create Your AI Model</h2>

          {/* Progress Bar */}
          <div className="progress-bar">
            {["Name", "Style & Type", "Goals", "Preview"].map((label, idx) => (
              <div
                key={label}
                className={`progress-step ${step === idx + 1 ? "active" : idx + 1 < step ? "completed" : ""}`}
                aria-current={step === idx + 1 ? "step" : undefined}
              >
                <div className="step-number">{idx + 1}</div>
                <div className="step-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="step-content animate-fade">
              <div className="input-group">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  aria-required="true"
                />
                <label htmlFor="name">Model Name</label>
              </div>
            </div>
          )}

          {/* Step 2: Style & Type */}
          {step === 2 && (
            <div className="step-content animate-fade">
              <h4 className="section-title">Choose Style</h4>
              <div className="options-grid">
                {styleOptions.map(({ label, tooltip }) => (
                  <div
                    key={label}
                    role="button"
                    tabIndex={0}
                    className={`option-card ${style === label ? "selected" : ""}`}
                    onClick={() => setStyle(label)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setStyle(label);
                    }}
                    title={tooltip}
                    aria-pressed={style === label}
                  >
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <h4 className="section-title">Choose Type</h4>
              <div className="options-grid">
                {typeOptions.map(({ label, tooltip }) => (
                  <div
                    key={label}
                    role="button"
                    tabIndex={0}
                    className={`option-card ${type === label ? "selected" : ""}`}
                    onClick={() => setType(label)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setType(label);
                    }}
                    title={tooltip}
                    aria-pressed={type === label}
                  >
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="step-content animate-fade">
              <div className="input-group">
                <textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  required
                  maxLength={300}
                  aria-required="true"
                  autoFocus
                />
                <label htmlFor="goals">Goals</label>
                <div className="char-count">{goals.length} / 300</div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="step-content animate-fade">
              <div className="preview-box" aria-live="polite">
                <h4>📝 Model Preview</h4>
                <p>
                  <strong>Name:</strong> {name || "Not set"}
                </p>
                <p>
                  <strong>Style:</strong> {style || "Not selected"}
                </p>
                <p>
                  <strong>Type:</strong> {type || "Not selected"}
                </p>
                <p>
                  <strong>Goals:</strong> {goals || "No goals yet"}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="button-group">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep} aria-label="Previous Step">
                ← Back
              </button>
            )}
            {step < 4 && (
              <button type="button" className="btn-submit" onClick={nextStep} aria-label="Next Step">
                Next →
              </button>
            )}
            {step === 4 && (
              <button type="button" className="btn-submit" onClick={handleSubmit} aria-label="Submit Model">
                Create Model
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
