'use client';

import React, { useEffect, useState, useRef } from "react";

import { useRouter, useParams, useSearchParams } from "next/navigation";

import {
  Box, Paper, Typography, Button, Checkbox,
  Alert, Stack, Divider, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import { toast } from "react-toastify";

import DialogCloseButton from '@/components/dialogs/DialogCloseButton';

const QuizStaticLayout = ({ data = [], report = [], setQuizData = () => { }, status = false, saveInsertQuizData = async () => ({ ok: false }) }) => {
  const theme = useTheme();

  const { lang: locale } = useParams();

  const searchParams = useSearchParams();

  const activityId = searchParams.get('activityId');
  const types = searchParams.get('type');
  const moduleId = searchParams.get('moduleId');
  const contentFolderId = searchParams.get('contentFolderId');
  const moduleTypeId = searchParams.get('moduleTypeId');

  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [attempted, setAttempted] = useState([]);
  const lastSentRef = useRef(null);

  const [confirmOpen, setConfirmOpen] = useState(false); // ⬅️ Confirmation modal state

  const router = useRouter()

  const explicitSaveTimer = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {

    return () => {
      isMountedRef.current = false;
      if (explicitSaveTimer.current) clearTimeout(explicitSaveTimer.current);
    };
  }, []);

  /** Load Questions + Merge Report */
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setQuestions(null);
      setIndex(0);
      setAttempted([]);

      return;
    }

    const mapped = data.map((q) => {
      const fromReport = Array.isArray(report) ? report.find(r => r.question_id === q._id) : null;

      return {
        id: q._id,
        text: q.question,
        score: Number(q.score) || 0,
        correct_answer: Number(q.correct_answer) || 0,
        options: [
          q.option1,
          q.option2,
          q.option3,
          q.option4,
          q.option5,
          q.option6
        ].filter(Boolean),
        selected: fromReport ? (Number(fromReport.selected_option_no) - 1) : null
      };
    });

    setQuestions(mapped);
    setIndex(0);

    const initialAttempts = (Array.isArray(report) ? report : []).map(r => ({
      question_id: r.question_id,
      selected_option_no: Number(r.selected_option_no),
      is_correct: !!r.is_correct,
      mark: Number(r.mark) || 0
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
    } catch (err) {
      setQuizData(attempted);
    }
  }, [attempted, setQuizData]);

  /** Navigation */
  const next = () => {
    if (!questions) return;
    setIndex(i => Math.min(i + 1, questions.length - 1));
  };

  const prev = () => {
    if (!questions) return;
    setIndex(i => Math.max(i - 1, 0));
  };

  /** Select Option */
  const handleSelectOption = (optionIndex) => {
    if (status) return;

    setQuestions(prev => {

      if (!prev) return prev;

      const updated = [...prev];

      const safeIndex = Math.max(0, Math.min(index, updated.length - 1));

      updated[safeIndex] = { ...updated[safeIndex], selected: optionIndex };

      const q = updated[safeIndex];
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

  /** Actual Save Function */
  const handleSave = async () => {
    if (status) return;

    if (explicitSaveTimer.current) {
      clearTimeout(explicitSaveTimer.current);
    }

    explicitSaveTimer.current = setTimeout(async () => {
      try {
        const res = await saveInsertQuizData(attempted);

        if (res && res.ok) {

          router.push(`/${locale}/apps/content?id=${moduleId}&content-folder-id=${contentFolderId}`)
          toast.success("Quiz completed successfully", { autoClose: 1000 });
        } else {
          console.warn('saveInsertQuizData failed', res);
        }
      } catch (err) {
        console.error('handleSave error', err);
      }
    }, 300);
  };

  const loading = !questions;

  const bg = theme.palette.mode === "dark" ? "#121212" : "#fafafa";
  const panelBg = theme.palette.mode === "dark" ? "#1e1e1e" : "#fff";
  const borderColor = theme.palette.mode === "dark" ? "#333" : "#ddd";
  const textSecondary = theme.palette.text.secondary;

  return (
    <>
      {/* CONFIRM SAVE MODAL */}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>

        <DialogCloseButton onClick={() => setConfirmOpen(false)}><i className="tabler-x" /></DialogCloseButton>

        <DialogTitle>Confirm Save</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to save your quiz answers?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>

          <Button
            onClick={() => {
              setConfirmOpen(false);
              handleSave();
            }}
            color="success"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* MAIN LAYOUT */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} height={{ md: '80vh' }} bgcolor={bg}>

        {/* LEFT SIDEBAR */}
        <Box
          flex={{ xs: 'unset', md: 1 }}
          p={2}
          borderRight={{ md: `1px solid ${borderColor}` }}
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
            (questions || []).map((q, i) => (
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
        <Box flex={{ xs: 'unset', md: 2 }} p={3} sx={{ overflowY: "auto" }}>
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
                  disabled={loading || (questions && index === questions.length - 1)}
                  onClick={next}
                >
                  Next
                </Button>

                {/* OPEN CONFIRM MODAL INSTEAD OF DIRECT SAVE */}
                <Button
                  variant="contained"
                  color="success"
                  disabled={loading || status}
                  onClick={() => setConfirmOpen(true)}
                >
                  Save
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default QuizStaticLayout;
