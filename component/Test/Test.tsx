"use client";
import React, { useState } from "react";
import "./test.css";

interface Question {
  question: string;
  options: Record<string, string>; // e.g., { A: "option1", B: "option2" }
  correct_answer?: string;
  correctAnswer?: string;
  correct_answer_label?: string;
  explanation?: string;
  explain?: string;
  difficulty?: string;
  level?: string;
}

export default function Test(): JSX.Element {
  // Form fields
  const [sallabus, setsallabus] = useState<string>("");
  const [chapter, setchapter] = useState<string>("");
  const [topic, settopic] = useState<string>("");
  const [subtopic, setsubtopic] = useState<string>("");

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions from backend
  const formHandling = async () => {
    setError(null);

    if (!sallabus.trim() || !chapter.trim() || !topic.trim() || !subtopic.trim()) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("https://aimate-7rdt.onrender.com/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sallabus,
          chapter,
          topic,
          subtopic,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${text}`);
      }

      const data = await response.json();

      const questionArray: Question[] = Array.isArray(data.answer)
        ? data.answer
        : Array.isArray(data?.answer?.answer)
        ? data.answer.answer
        : Array.isArray(data?.answer?.questions)
        ? data.answer.questions
        : Array.isArray(data?.answer)
        ? data.answer
        : [];

      if (!questionArray.length) throw new Error("No questions were returned.");

      setQuestions(questionArray);
      setAnswers(new Array(questionArray.length).fill(null));
      setCurrentIndex(0);
      setSubmitted(false);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch questions.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user choosing an option
  const handleChoose = (choiceKey: string) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = choiceKey;
      return copy;
    });

    const next = currentIndex + 1;
    if (next < questions.length) {
      setTimeout(() => setCurrentIndex(next), 400);
    } else {
      setTimeout(() => setSubmitted(true), 400);
    }
  };

  // Compute results
  const computeResults = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const userChoice = answers[idx];
      const correctAnswer =
        q.correct_answer ?? q.correctAnswer ?? q.correct_answer_label ?? q.correct_answer?.toString();
      if (
        userChoice &&
        correctAnswer &&
        userChoice.toString().toUpperCase() === correctAnswer.toString().toUpperCase()
      ) {
        correct += 1;
      }
    });
    const total = questions.length;
    const percent = Math.round((correct / total) * 100);
    return { correct, total, percent };
  };

  const { correct, total, percent } = computeResults();

  const handleRestart = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setSubmitted(false);
    setError(null);
  };

  // Render helpers
  const renderForm = () => (
    <div className="test-form-card">
      <h2>Create a quick test</h2>
      {error && <div className="error">{error}</div>}

      <label htmlFor="sallabus">📚 Syllabus</label>
      <input
        id="sallabus"
        type="text"
        value={sallabus}
        onChange={(e) => setsallabus(e.target.value)}
        placeholder="e.g. A-Level, SAT"
      />

      <label htmlFor="chapter">📖 Chapter</label>
      <input
        id="chapter"
        type="text"
        value={chapter}
        onChange={(e) => setchapter(e.target.value)}
        placeholder="Chapter name or number"
      />

      <label htmlFor="topic">🧠 Topic</label>
      <input
        id="topic"
        type="text"
        value={topic}
        onChange={(e) => settopic(e.target.value)}
        placeholder="Topic e.g. Calculus"
      />

      <label htmlFor="subtopic">🔍 Subtopic</label>
      <input
        id="subtopic"
        type="text"
        value={subtopic}
        onChange={(e) => setsubtopic(e.target.value)}
        placeholder="Subtopic e.g. Derivatives"
      />

      <div className="form-actions">
        <button className="btn primary" onClick={formHandling} disabled={loading}>
          {loading ? "Generating…" : "Generate 5-question test"}
        </button>
      </div>

      <p className="note">The test is generated by AI and displayed directly (not saved).</p>
    </div>
  );

  const renderQuestion = () => {
    const q = questions[currentIndex];
    const options = q.options || {};
    const choicesEntries = Object.entries(options);

    return (
      <div className="question-card">
        <div className="question-header">
          <div className="progress">
            Question {currentIndex + 1} / {questions.length}
          </div>
          <div className="difficulty">{q.difficulty ?? q.level ?? ""}</div>
        </div>

        <h3 className="question-text">{q.question}</h3>

        <div className="options-grid">
          {choicesEntries.map(([key, value]) => {
            const isSelected = answers[currentIndex] === key;
            return (
              <button
                key={key}
                className={`option-btn ${isSelected ? "selected" : ""}`}
                onClick={() => handleChoose(key)}
                aria-pressed={isSelected}
              >
                <span className="option-key">{key}</span>
                <span className="option-text">{value}</span>
              </button>
            );
          })}
        </div>

        <div className="question-footer">
          <div className="hint">Click an option to continue →</div>
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="summary-card">
      <h2>Test Results</h2>
      <div className="score">
        <div className="score-number">
          {correct} / {total}
        </div>
        <div className="score-percent">{percent}%</div>
      </div>

      <div className="summary-list">
        {questions.map((q, idx) => {
          const userChoice = answers[idx];
          const correctAnswer =
            q.correct_answer ?? q.correctAnswer ?? q.correct_answer_label ?? q.correct_answer;
          const isCorrect =
            userChoice &&
            correctAnswer &&
            userChoice.toString().toUpperCase() === correctAnswer.toString().toUpperCase();
          return (
            <div key={idx} className={`summary-item ${isCorrect ? "correct" : "wrong"}`}>
              <div className="summary-q">
                <strong>Q{idx + 1}:</strong> {q.question}
              </div>
              <div className="summary-choices">
                <div className={`user-choice ${isCorrect ? "ok" : "bad"}`}>
                  Your answer: {userChoice ?? "—"}
                </div>
                <div className="correct-choice">Correct: {correctAnswer}</div>
                <div className="explain">{q.explanation ?? q.explain ?? ""}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary-actions">
        <button
          className="btn"
          onClick={() => {
            setAnswers(new Array(questions.length).fill(null));
            setCurrentIndex(0);
            setSubmitted(false);
          }}
        >
          Retry Test
        </button>
        <button className="btn outline" onClick={handleRestart}>
          New Test
        </button>
      </div>
    </div>
  );

  return (
    <div className="test-page">
      <div className="container">
        {!questions.length && !loading && renderForm()}
        {loading && (
          <div className="loading-card">
            <div className="spinner" />
            <div>Generating test — please wait...</div>
          </div>
        )}
        {questions.length > 0 && !submitted && !loading && renderQuestion()}
        {submitted && renderSummary()}
      </div>
    </div>
  );
}
