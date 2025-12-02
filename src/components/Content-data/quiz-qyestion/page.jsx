'use client';

import React, { useEffect, useState, useRef } from "react";

import {
  Box, Paper, Typography, Button, Checkbox,
  TextField, Alert, Stack, Divider, Skeleton
} from "@mui/material";

const QuizStaticLayout = ({ data = [], report = [], setQuizData, status = false }) => {
  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [attempted, setAttempted] = useState([]);
  const lastSentRef = useRef(null);

  /** Load Questions + Merge report */
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

        // pre-selected option from report → MUI needs 0-based index
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

  /** Send attempted to parent */
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

  /** Select Option (disabled if status=true) */
  const handleSelectOption = (optionIndex) => {
    if (status) return; // ❗Block selection if quiz is locked

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
    if (status) return; // ❗Save disabled when quiz is locked

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const loading = !questions;

  return (
    <Box display="flex" height="100vh" bgcolor="#fafafa">

      {/* LEFT SIDEBAR */}
      <Box flex={1} p={2} borderRight="1px solid #ddd" sx={{ overflowY: "auto", backgroundColor: "#fff" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Questions
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
                <Skeleton width="40%" height={25} />
                <Skeleton width="90%" height={20} />
              </Paper>
            ))}
          </Stack>
        ) : (
          questions.map((q, i) => (
            <Paper
              key={q.id}
              elevation={i === index ? 4 : 1}
              sx={{
                p: 2, mb: 2,
                cursor: "pointer",
                borderRadius: 2,
                transition: "0.2s",
              }}
              onClick={() => setIndex(i)}
            >
              <Typography fontWeight="600">{`Q${i + 1}`}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {q.text}
              </Typography>
            </Paper>
          ))
        )}
      </Box>

      {/* RIGHT CONTENT */}
      <Box flex={2} p={3} sx={{ overflowY: "auto" }}>
        {saved && <Alert severity="success" sx={{ mb: 2 }}>Saved successfully!</Alert>}

        <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
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
            <TextField
              label="Question"
              fullWidth
              multiline
              sx={{ mt: 1 }}
              value={questions[index]?.text}
              InputProps={{ readOnly: true }}
            />
          )}

          {!loading && (
            <>
              <Typography sx={{ mt: 3, fontWeight: "bold" }}>Options</Typography>
              <Stack spacing={2} mt={2}>
                {questions[index].options.map((opt, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={2}>
                    <Checkbox
                      checked={questions[index].selected === i}
                      disabled={status}   // ❗ Disable checkbox when quiz submitted
                      onChange={() => handleSelectOption(i)}
                    />
                    <TextField value={opt} fullWidth InputProps={{ readOnly: true }} />
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
              <Button variant="contained" color="primary"
                disabled={loading || index === questions.length - 1}
                onClick={next}>
                Next
              </Button>

              <Button
                variant="contained"
                color="success"
                disabled={loading || status} // ❗Disable save when quiz locked
                onClick={handleSave}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default QuizStaticLayout;
