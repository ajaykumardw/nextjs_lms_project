'use client';

import React, { useEffect, useState, useRef } from "react";
import {
  Box, Paper, Typography, Button, Checkbox,
  Alert, Stack, Divider, Skeleton
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const QuizStaticLayout = ({ data = [], report = [], setQuizData, status = false }) => {
  const theme = useTheme();

  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [attempted, setAttempted] = useState([]);
  const lastSentRef = useRef(null);

  /** Load Questions + Merge Report */
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setQuestions(null);
      return;
    }

    const mapped = data.map((q) => {
      const fromReport = report.find(r => r.question_id === q._id);

      return {
        id: q._id,
        text: q.question,
        score: Number(q.score),
        correct_answer: Number(q.correct_answer),
        options: [
          q.option1,
          q.option2,
          q.option3,
          q.option4,
          q.option5,
          q.option6
        ].filter(Boolean),
        selected: fromReport ? Number(fromReport.selected_option_no) - 1 : null
      };
    });

    setQuestions(mapped);
    setIndex(0);

    const initialAttempts = report.map(r => ({
      question_id: r.question_id,
      selected_option_no: Number(r.selected_option_no),
      is_correct: r.is_correct,
      mark: Number(r.mark)
    }));

    setAttempted(initialAttempts);
  }, [data, report]);

  /** Keep Parent Updated */
  useEffect(() => {
    try {
      const serialized = JSON.stringify(attempted || []);

      if (lastSentRef.current !== serialized) {
        setQuizData(attempted);
        lastSentRef.current = serialized;
      }
    } catch {
      setQuizData(attempted);
    }
  }, [attempted]);

  /** Navigation */
  const next = () => setIndex(i => Math.min(i + 1, questions.length - 1));
  const prev = () => setIndex(i => Math.max(i - 1, 0));

  /** Select Option */
  const handleSelectOption = (optionIndex) => {
    if (status) return;

    setQuestions(prev => {
      const updated = [...prev];
      updated[index].selected = optionIndex;

      const q = updated[index];
      const correctIndex = Number(q.correct_answer) - 1;

      const attempt = {
        question_id: q.id,
        selected_option_no: optionIndex + 1,
        is_correct: optionIndex === correctIndex,
        mark: optionIndex === correctIndex ? Number(q.score) : 0,
      };

      setAttempted(prevAtt => {
        const filtered = prevAtt.filter(a => a.question_id !== q.id);
        return [...filtered, attempt];
      });

      return updated;
    });
  };

  const handleSave = () => {
    if (status) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const loading = !questions;

  /** Theme-aware colors */
  const bg = theme.palette.mode === "dark" ? "#121212" : "#fafafa";
  const panelBg = theme.palette.mode === "dark" ? "#1e1e1e" : "#fff";
  const borderColor = theme.palette.mode === "dark" ? "#333" : "#ddd";
  const textSecondary = theme.palette.text.secondary;

  return (
    <Box display="flex" height="100vh" bgcolor={bg}>

      {/* LEFT SIDEBAR */}
      <Box
        flex={1}
        p={2}
        borderRight={`1px solid ${borderColor}`}
        sx={{
          overflowY: "auto",
          backgroundColor: panelBg
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Questions
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Paper
                key={i}
                sx={{ p: 2, borderRadius: 2, backgroundColor: panelBg }}
              >
                <Skeleton width="40%" height={25} />
                <Skeleton width="90%" height={20} />
              </Paper>
            ))}
          </Stack>
        ) : (
          questions.map((q, i) => (
            <Paper
              key={q.id}
              elevation={i === index ? 6 : 1}
              sx={{
                p: 2,
                mb: 2,
                cursor: "pointer",
                borderRadius: 2,
                transition: "0.2s",
                backgroundColor: i === index ? theme.palette.action.selected : panelBg,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover
                }
              }}
              onClick={() => setIndex(i)}
            >
              <Typography fontWeight="600">{`Q${i + 1}`}</Typography>
              <Typography variant="body2" color={textSecondary} noWrap>
                {q.text}
              </Typography>
            </Paper>
          ))
        )}
      </Box>

      {/* RIGHT CONTENT */}
      <Box flex={2} p={3} sx={{ overflowY: "auto" }}>
        {saved && <Alert severity="success" sx={{ mb: 2 }}>Saved successfully!</Alert>}

        <Box sx={{ p: 3 }}>

          {!loading && (
            <>
              <Typography variant="h5" fontWeight="bold">
                Question {index + 1}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {loading ? (
            <Skeleton height={90} />
          ) : (
            <Typography sx={{ fontSize: 18, mt: 1, whiteSpace: "pre-line" }}>
              {questions[index]?.text}
            </Typography>
          )}

          {!loading && (
            <>
              <Typography sx={{ mt: 3, fontWeight: "bold" }}>Options</Typography>

              <Stack spacing={2} mt={2}>
                {questions[index].options.map((opt, i) => (
                  <Box
                    key={i}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor:
                        questions[index].selected === i
                          ? theme.palette.action.selected
                          : "transparent",
                      // ❌ Hover removed (no hover background)
                    }}
                  >
                    <Checkbox
                      checked={questions[index].selected === i}
                      disabled={status}
                      onChange={() => handleSelectOption(i)}
                    />
                    <Typography sx={{ fontSize: 16 }}>
                      {opt}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </>
          )}

          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button variant="outlined" onClick={prev} disabled={loading || index === 0}>
              Previous
            </Button>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading || index === questions.length - 1}
                onClick={next}
              >
                Next
              </Button>

              <Button
                variant="contained"
                color="success"
                disabled={loading || status}
                onClick={handleSave}
              >
                Save
              </Button>
            </Stack>
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default QuizStaticLayout;
