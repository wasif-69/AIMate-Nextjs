"use client";
import React, { useState, useEffect } from "react";
import { add_community } from "../../../Firebase/common/community";
import { auth } from "../../../Firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import "./community.css";

// Simple toast component
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {message}
      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default function CommunityWizard() {
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [schema, setSchema] = useState(null);
  const [answers, setAnswers] = useState({});
  const [callToAction, setCallToAction] = useState("");
  const [isInstagramCTA, setIsInstagramCTA] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [toast, setToast] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");

  const Router = useRouter();

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [step]);

  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (e) {
      return false;
    }
  };

  const fetchSchema = async () => {
    if (!text.trim()) {
      showToast("Please enter a community description.", "error");
      return;
    }
    setLoadingSchema(true);
    try {
      const response = await fetch("https://aimate-7rdt.onrender.com/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      setSchema(data.message);
      setStep(1);
      setAnswers({});
    } catch (e) {
      console.log(e);
      showToast("Failed to fetch schema, please try again.", "error");
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleNext = (fieldName, value, skipped = false) => {
    if (!skipped && value !== "") {
      setAnswers((prev) => ({ ...prev, [fieldName]: value }));
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    let finalCallToAction = callToAction;
    if (isInstagramCTA) {
      finalCallToAction = `https://instagram.com/${callToAction.replace(
        /^@/,
        ""
      )}`;
    }
    if (finalCallToAction && !isValidURL(finalCallToAction)) {
      showToast("Please enter a valid URL.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await add_community(auth.currentUser.uid, answers, finalCallToAction);
      showToast("Community created successfully!", "success");
     Router.push("/com");
    } catch (e) {
      showToast("Error: " + e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const addNewField = () => {
    if (!newFieldName.trim()) {
      showToast("Please enter a valid field name.", "error");
      return;
    }
    const newField = { name: newFieldName.trim(), type: "text" };
    setSchema((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setNewFieldName("");
    showToast(`Added field: "${newFieldName.trim()}"`, "success");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const animationClass = animate ? "fade-slide" : "";

  return (
    <div className="wizard-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Step 0: Enter community description */}
      {step === 0 && (
        <div className={`card ${animationClass}`}>
          <h2>Enter Community Description</h2>
          <textarea
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. A science club for students"
            aria-label="Community description"
            disabled={loadingSchema}
          />
          <button
            className="btn-primary"
            onClick={fetchSchema}
            disabled={loadingSchema || !text.trim()}
          >
            {loadingSchema ? (
              <span className="loading-spinner"></span>
            ) : (
              "Generate Fields"
            )}
          </button>
        </div>
      )}

      {/* Flashcards for each field */}
      {schema && step > 0 && step <= schema.fields.length && (
        <div className={`card ${animationClass}`}>
          <h2>{schema.communityType}</h2>
          <p>Please enter: {schema.fields[step - 1].name}</p>
          <label htmlFor="field-input" className="sr-only">
            {schema.fields[step - 1].name}
          </label>
          <input
            id="field-input"
            type={schema.fields[step - 1].type}
            placeholder={schema.fields[step - 1].name}
            value={answers[schema.fields[step - 1].name] || ""}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [schema.fields[step - 1].name]: e.target.value,
              }))
            }
            aria-label={schema.fields[step - 1].name}
          />
          <div className="actions">
            <button
              className="btn-skip"
              onClick={() => handleNext(schema.fields[step - 1].name, "", true)}
            >
              Skip
            </button>
            <button
              className="btn-next"
              onClick={() =>
                handleNext(
                  schema.fields[step - 1].name,
                  answers[schema.fields[step - 1].name] || ""
                )
              }
            >
              Next
            </button>
          </div>
          <button className="btn-back" onClick={handleBack} type="button">
            Back
          </button>
        </div>
      )}

      {/* Add new field UI after last flashcard */}
      {schema && step === schema.fields.length + 1 && (
        <div className={`card ${animationClass}`}>
          <h2>Add a New Field</h2>
          <input
            type="text"
            placeholder="New field name (e.g. Location)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            aria-label="New field name"
          />
          <button className="btn-add-field" onClick={addNewField}>
            Add Field
          </button>

          <div className="add-field-actions">
            <button className="btn-next" onClick={() => setStep(step + 1)}>
              Continue to Call To Action
            </button>
            <button className="btn-back" onClick={handleBack} type="button">
              Back
            </button>
          </div>
        </div>
      )}

      {/* Call to Action step */}
      {schema && step === schema.fields.length + 2 && (
        <div className={`card ${animationClass}`}>
          <h2>Call To Action</h2>

          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={isInstagramCTA}
              onChange={(e) => {
                setIsInstagramCTA(e.target.checked);
                if (!e.target.checked) setCallToAction("");
              }}
            />
            <label>Is this an Instagram account?</label>
          </div>

          {isInstagramCTA ? (
            <input
              type="text"
              placeholder="Instagram username (e.g. @myclub)"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              aria-label="Instagram username"
              disabled={submitting}
            />
          ) : (
            <input
              type="url"
              placeholder="e.g. https://instagram.com/myclub"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              aria-label="Call to action URL"
              disabled={submitting}
            />
          )}

          <button
            className="btn-success"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span className="loading-spinner"></span>
            ) : (
              "Submit Community"
            )}
          </button>
          <button
            className="btn-back"
            onClick={handleBack}
            disabled={submitting}
            type="button"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
