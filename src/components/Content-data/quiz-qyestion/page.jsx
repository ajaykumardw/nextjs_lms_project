'use client';

import { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Button,
  Checkbox,
  TextField,
  Alert,
  Stack,
  Divider
} from "@mui/material";

const QuizStaticLayout = () => {

  // STATIC QUESTIONS
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Rome"],
      selected: null
    },
    {
      id: 2,
      text: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      selected: null
    },
    {
      id: 3,
      text: "Who wrote Hamlet?",
      options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Leo Tolstoy"],
      selected: null
    }
  ]);

  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const current = questions[index];

  const next = () => index < questions.length - 1 && setIndex(index + 1);
  const prev = () => index > 0 && setIndex(index - 1);

  // Store selected option
  const handleSelectOption = (i) => {
    setQuestions(prev =>
      prev.map((q, idx) =>
        idx === index ? { ...q, selected: i } : q
      )
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    console.log("Saved answers:", questions);
  };

  return (
    <Box display="flex" height="100vh" bgcolor="#fafafa">

      {/* LEFT SIDE LIST */}
      <Box
        flex={1}
        p={2}
        borderRight="1px solid #ddd"
        sx={{ overflowY: "auto", backgroundColor: "#fff" }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Questions
        </Typography>

        {questions.map((q, i) => (
          <Paper
            key={q.id}
            elevation={i === index ? 4 : 1}
            sx={{
              p: 2,
              mb: 2,
              cursor: "pointer",
              borderRadius: 2,
              transition: "0.2s",
              bgcolor: "white"
            }}
            onClick={() => setIndex(i)}
          >
            <Typography fontWeight="600">{`Q${i + 1}`}</Typography>
            <Typography variant="body2" color="text.secondary">
              {q.text}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* RIGHT SIDE */}
      <Box flex={2} p={3} sx={{ overflowY: "auto" }}>

        {saved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Saved successfully!
          </Alert>
        )}

        <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
          <Typography variant="h5" fontWeight="bold">
            Question {index + 1}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Question Text */}
          <TextField
            label="Question"
            fullWidth
            multiline
            sx={{ mt: 1 }}
            value={current.text}
            InputProps={{ readOnly: true }}
          />

          {/* Options */}
          <Typography sx={{ mt: 3, fontWeight: "bold" }}>
            Options
          </Typography>

          <Stack spacing={2} mt={2}>
            {current.options.map((opt, i) => (
              <Box key={i} display="flex" alignItems="center" gap={2}>
                <Checkbox
                  checked={current.selected === i}
                  onChange={() => handleSelectOption(i)}
                />
                <TextField
                  fullWidth
                  value={opt}
                  InputProps={{ readOnly: true }}
                />
              </Box>
            ))}
          </Stack>

          {/* Navigation Buttons */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={4}
          >
            <Button
              variant="outlined"
              onClick={prev}
              disabled={index === 0}
            >
              Previous
            </Button>

            <Stack direction="row" spacing={2} mb={"5px"}>
              <Button
                variant="contained"
                color="primary"
                disabled={index === questions.length - 1}
                onClick={next}
              >
                Next
              </Button>

              <Button
                variant="contained"
                color="success"
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
