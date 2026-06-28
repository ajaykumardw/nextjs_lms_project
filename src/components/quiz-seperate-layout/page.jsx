"use client";

import { useEffect, useState } from "react";

const questions = [
  {
    id: 1,
    question: "Which language is used by Next.js?",
    options: ["Python", "Java", "JavaScript", "PHP"],
  },
];

export default function QuizSeperateComponent() {
  const [currentQuestion] = useState(0);

  const [selected, setSelected] = useState("");

  const [timeLeft, setTimeLeft] = useState(3600);

  const [tabSwitches, setTabSwitches] = useState(0);

  const [fullscreenViolations, setFullscreenViolations] = useState(0);

  const [saveStatus, setSaveStatus] = useState("Saved");

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    enterFullscreen();
  }, []);

  useEffect(() => {
    const handleFullscreen = async () => {
      if (!document.fullscreenElement) {
        setFullscreenViolations((p) => p + 1);

        alert("Fullscreen is required for this exam.");

        try {
          await document.documentElement.requestFullscreen();
        } catch (e) { }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreen);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      setTabSwitches((p) => p + 1);
    };

    window.addEventListener("blur", handleBlur);

    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  useEffect(() => {
    const unload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", unload);

    return () => {
      window.removeEventListener("beforeunload", unload);
    };
  }, []);

  useEffect(() => {
    const block = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["U", "S", "P", "C", "V", "X"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", block);

    return () => window.removeEventListener("keydown", block);
  }, []);

  useEffect(() => {
    const prevent = (e) => e.preventDefault();

    document.addEventListener("copy", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("cut", prevent);

    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("cut", prevent);
    };
  }, []);

  const MAX_VIOLATIONS = 3;

  useEffect(() => {
    if (tabSwitches + fullscreenViolations >= MAX_VIOLATIONS) {
      alert("Too many violations. Exam submitted.");

      // submitExam();
    }
  }, [tabSwitches, fullscreenViolations]);

  

  // --------------------------
  // Timer
  // --------------------------

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Exam Finished");

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --------------------------
  // Tab Detection
  // --------------------------

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((p) => p + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
  }, []);

  // --------------------------
  // Fullscreen Detection
  // --------------------------

  useEffect(() => {
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        setFullscreenViolations((p) => p + 1);
      }
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
  }, []);

  // --------------------------
  // Disable Right Click
  // --------------------------

  useEffect(() => {
    const prevent = (e) => e.preventDefault();

    document.addEventListener("contextmenu", prevent);

    return () =>
      document.removeEventListener("contextmenu", prevent);
  }, []);

  // --------------------------
  // Auto Save Simulation
  // --------------------------

  useEffect(() => {
    setSaveStatus("Saving...");

    const t = setTimeout(() => {
      setSaveStatus("Saved");
    }, 1000);

    return () => clearTimeout(t);
  }, [selected]);

  const minutes = Math.floor(timeLeft / 60);

  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <div className="sticky top-0 bg-white shadow-md z-50">

        <div className="max-w-7xl mx-auto p-5 flex justify-between items-center">

          <div>

            <h1 className="text-2xl font-bold">
              Online Examination
            </h1>

            <p className="text-sm text-gray-500">
              Candidate Dashboard
            </p>

          </div>

          <div className="flex gap-8">

            <div>
              <p className="text-xs text-gray-500">
                Remaining Time
              </p>

              <p className="font-bold text-red-600 text-xl">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Auto Save
              </p>

              <p className="font-semibold text-green-600">
                {saveStatus}
              </p>
            </div>

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 p-6">

        {/* Left */}

        <div className="col-span-9">

          {/* Alerts */}

          <div className="grid grid-cols-2 gap-4 mb-6">

            <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">

              <h2 className="font-bold">
                Tab Switches
              </h2>

              <p className="text-3xl">
                {tabSwitches}
              </p>

            </div>

            <div className="bg-red-100 border border-red-400 p-4 rounded">

              <h2 className="font-bold">
                Fullscreen Violations
              </h2>

              <p className="text-3xl">
                {fullscreenViolations}
              </p>

            </div>

          </div>

          {/* Progress */}

          <div className="mb-5">

            <div className="flex justify-between">

              <span>
                Question {currentQuestion + 1}
              </span>

              <span>
                1 / 50
              </span>

            </div>

            <div className="w-full h-3 rounded bg-gray-300 mt-2">

              <div
                className="bg-blue-600 h-3 rounded"
                style={{ width: "2%" }}
              />

            </div>

          </div>

          {/* Question */}

          <div className="bg-white rounded-xl shadow-lg p-8">

            <h2 className="text-xl font-bold mb-8">

              {questions[currentQuestion].question}

            </h2>

            <div className="space-y-5">

              {questions[currentQuestion].options.map((item) => (

                <label
                  key={item}
                  className={`border rounded-xl p-5 flex cursor-pointer transition

                  ${selected === item
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300"
                    }
                  `}
                >

                  <input
                    type="radio"
                    className="mr-4"
                    checked={selected === item}
                    onChange={() => setSelected(item)}
                  />

                  {item}

                </label>

              ))}

            </div>

            <div className="flex justify-between mt-10">

              <button
                className="px-6 py-3 rounded bg-gray-200 hover:bg-gray-300"
              >
                Previous
              </button>

              <button
                className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Next
              </button>

            </div>

          </div>

        </div>

        {/* Right Sidebar */}

        <div className="col-span-3">

          <div className="bg-white shadow rounded-xl p-5 sticky top-28">

            <h2 className="font-bold text-lg mb-5">
              Question Palette
            </h2>

            <div className="grid grid-cols-5 gap-3">

              {Array.from({ length: 50 }).map((_, index) => (

                <button
                  key={index}
                  className={`h-11 rounded-lg border

                  ${index === currentQuestion
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                    }
                  `}
                >
                  {index + 1}
                </button>

              ))}

            </div>

            <button className="w-full mt-8 py-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700">
              Submit Exam
            </button>

            <div className="mt-8 border-t pt-5 space-y-3 text-sm">

              <div className="flex justify-between">

                <span>Total Questions</span>

                <span>50</span>

              </div>

              <div className="flex justify-between">

                <span>Answered</span>

                <span>0</span>

              </div>

              <div className="flex justify-between">

                <span>Remaining</span>

                <span>50</span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
