"use client";

import React, { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation";

import { useSession } from "next-auth/react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    RadioGroup,
    Radio,
    Box,
    Button,
    Typography,
    Paper,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Checkbox,
    Alert,
    Skeleton
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { toast } from "react-toastify";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";

const difficultyIcons = {
    Easy: "🌶️",
    Medium: "🌶️🌶️",
    Hard: "🌶️🌶️🌶️",
};

const difficultyMap = {
    1: "Easy",
    2: "Medium",
    3: "Hard",
};

const QueastionQuizPage = () => {
    const router = useRouter();
    const { mId, aId, lang } = useParams();
    const { data: session } = useSession();

    const token = session?.user?.token;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [openSettings, setOpenSettings] = useState(false);

    const handleCloseSettings = () => setOpenSettings(false);

    const [sections, setSections] = useState([]);
    
    const [selected, setSelected] = useState({
        sectionId: null,
        questionId: null
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [orderSetting, setOrderSetting] = useState("sameOrder");

    // Marking Points
    const [points, setPoints] = useState({
        easyCorrect: 1,
        easyWrong: 0,
        mediumCorrect: 2,
        mediumWrong: 0,
        difficultCorrect: 3,
        difficultWrong: 0
    });

    // Other Settings
    const [otherSettings, setOtherSettings] = useState({
        hideResults: false,
        revealAnswers: false,
        isMandatory: false,
        completeOnlyIfPassed: false,
        allowSkipQuestions: false,
        revealCorrectness: false
    });

    // --------------------------------------------------
    // FETCH QUESTIONS
    // --------------------------------------------------

    const fetchQuestion = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `${API_URL}/company/quiz/question/${mId}/${aId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const json = await res.json();

            if (res.ok && Array.isArray(json?.data)) {
                const sectionMap = {};

                json.data.forEach((q) => {
                    const sectionName =
                        q.section || q.section_name || "Default Section";

                    if (!sectionMap[sectionName]) {
                        sectionMap[sectionName] = {
                            id: sectionName,
                            title: sectionName,
                            questions: []
                        };
                    }

                    const rawOptions = [
                        q.option1 ?? "",
                        q.option2 ?? "",
                        q.option3 ?? "",
                        q.option4 ?? "",
                        q.option5 ?? "",
                        q.option6 ?? ""
                    ].filter(
                        (opt) =>
                            opt &&
                            opt.trim() &&
                            opt !== "NULL"
                    );

                    const correctAnswers = Array.isArray(q.correct_answer)
                        ? q.correct_answer.map((a) => Number(a) - 1)
                        : [];

                    const isMultiple =
                        q.question_type === "Multiple Correct";

                    sectionMap[sectionName].questions.push({
                        _id: q._id,
                        id: q._id,

                        type: q.question_type,

                        difficulty:
                            difficultyMap[q.diffculty] || "Easy",

                        text: q.question,

                        options: rawOptions,

                        correctIndex: isMultiple
                            ? null
                            : correctAnswers[0] ?? null,

                        correctIndices: isMultiple
                            ? correctAnswers
                            : [],

                        explanation:
                            q.answer_explanation || "",

                        useAnswerExplanation:
                            !!q.use_answer_explanation
                    });
                });

                const dynamicSections =
                    Object.values(sectionMap);

                setSections(dynamicSections);

                // Select first question
                if (dynamicSections[0]?.questions?.length) {
                    setSelected({
                        sectionId: dynamicSections[0].id,
                        questionId:
                            dynamicSections[0].questions[0].id
                    });
                } else {
                    setSelected({
                        sectionId: null,
                        questionId: null
                    });
                }
            } else {
                setSections([]);
                setSelected({
                    sectionId: null,
                    questionId: null
                });
            }
        } catch (err) {
            setError("Failed to load questions.");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // INITIAL LOAD
    // --------------------------------------------------

    useEffect(() => {
        if (API_URL && token && mId && aId) {
            fetchQuestion();
        }
    }, [API_URL, token, mId, aId]);

    // --------------------------------------------------
    // GET CURRENT QUESTION
    // --------------------------------------------------

    const getSelectedQuestion = () => {
        const section = sections.find(
            (s) => s.id === selected.sectionId
        );

        return (
            section?.questions.find(
                (q) => q.id === selected.questionId
            ) || null
        );
    };

    const current = getSelectedQuestion();

    const skeletonCount = 4;

    return (
        <Box
            display="flex"
            height="100vh"
            sx={{
                backgroundColor: "#fff"
            }}
        >
            {/* ==================================================
                LEFT SIDEBAR
            ================================================== */}

            <Box
                flex={1}
                p={2}
                borderRight="1px solid #ddd"
                overflow="auto"
                sx={{
                    background: "#fafafa"
                }}
            >
                {/* BACK BUTTON */}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        p: 1.5
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={() =>
                            router.replace(
                                `/${lang}/apps/batch-session/batches`
                            )
                        }
                        sx={{
                            whiteSpace: "nowrap",
                            py: 1
                        }}
                    >
                        Back
                    </Button>
                </Box>

                {/* LOADING */}

                {loading && sections.length === 0 ? (
                    [...Array(skeletonCount)].map((_, i) => (
                        <Box key={i} mb={2}>
                            <Skeleton
                                variant="text"
                                width="60%"
                                height={30}
                            />

                            {[...Array(2)].map((__, j) => (
                                <Skeleton
                                    key={j}
                                    variant="rectangular"
                                    height={40}
                                    sx={{ mt: 1 }}
                                />
                            ))}
                        </Box>
                    ))
                ) : sections.length > 0 ? (
                    sections.map((section) => (
                        <Paper
                            key={section.id}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: "10px",
                                boxShadow:
                                    "0 1px 4px rgba(0,0,0,0.1)"
                            }}
                        >
                            {/* SECTION TITLE */}

                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Typography fontWeight="bold">
                                    {section.title}
                                </Typography>
                            </Box>

                            {/* QUESTIONS */}

                            {section.questions.map(
                                (q, idx) => (
                                    <Paper
                                        key={q.id}
                                        sx={{
                                            p: 1,
                                            mt: 1,
                                            cursor: "pointer",
                                            borderRadius: "6px",

                                            bgcolor:
                                                selected.sectionId ===
                                                    section.id &&
                                                    selected.questionId ===
                                                    q.id
                                                    ? "#e3f2fd"
                                                    : "#fff",

                                            transition: "0.2s",

                                            ":hover": {
                                                bgcolor:
                                                    selected.sectionId ===
                                                        section.id &&
                                                        selected.questionId ===
                                                        q.id
                                                        ? "#e3f2fd"
                                                        : "#f5f5f5"
                                            }
                                        }}
                                        onClick={() =>
                                            setSelected({
                                                sectionId:
                                                    section.id,
                                                questionId: q.id
                                            })
                                        }
                                    >
                                        <Typography variant="caption">
                                            {q.type}{" "}
                                            {
                                                difficultyIcons[
                                                q.difficulty
                                                ]
                                            }{" "}
                                            {q.difficulty}
                                        </Typography>

                                        <Typography>
                                            {`${idx + 1}. ${q.text}`}
                                        </Typography>
                                    </Paper>
                                )
                            )}
                        </Paper>
                    ))
                ) : (
                    <Typography color="text.secondary">
                        No questions found.
                    </Typography>
                )}
            </Box>

            {/* ==================================================
                RIGHT SIDE QUESTION VIEWER
            ================================================== */}

            <Box
                flex={2}
                p={2}
                overflow="auto"
            >
                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                )}

                {loading && sections.length === 0 ? (
                    <Box>
                        <Skeleton
                            variant="text"
                            width="40%"
                            height={40}
                        />

                        <Skeleton
                            variant="rectangular"
                            height={150}
                            sx={{ mt: 2 }}
                        />

                        <Skeleton
                            variant="text"
                            width="30%"
                            height={30}
                            sx={{ mt: 2 }}
                        />
                    </Box>
                ) : current ? (
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 2
                        }}
                    >
                        {/* HEADER */}

                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >
                            <Typography variant="h6">
                                Question Details
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Read Only
                            </Typography>
                        </Box>

                        {/* QUESTION TYPE */}

                        <Box mb={2}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Question Type
                            </Typography>

                            <Typography
                                fontWeight={500}
                            >
                                {current.type}
                            </Typography>
                        </Box>

                        {/* QUESTION */}

                        <Box mb={3}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={1}
                            >
                                Question
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={current.text || ""}
                                InputProps={{
                                    readOnly: true
                                }}
                            />
                        </Box>

                        {/* DIFFICULTY */}

                        <Box mb={3}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Difficulty
                            </Typography>

                            <Typography
                                fontWeight={500}
                            >
                                {
                                    difficultyIcons[
                                    current.difficulty
                                    ]
                                }{" "}
                                {current.difficulty}
                            </Typography>
                        </Box>

                        {/* OPTIONS */}

                        <Box mb={3}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                mb={1}
                            >
                                Options
                            </Typography>

                            {current.options.map(
                                (opt, i) => {
                                    const checked =
                                        current.type ===
                                            "Single Correct"
                                            ? current.correctIndex ===
                                            i
                                            : (
                                                current.correctIndices ||
                                                []
                                            ).includes(i);

                                    return (
                                        <Box
                                            key={i}
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                            mt={1}
                                            sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                backgroundColor:
                                                    checked
                                                        ? "#e8f5e9"
                                                        : "#fafafa",
                                                border:
                                                    checked
                                                        ? "1px solid #81c784"
                                                        : "1px solid #eee"
                                            }}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                disabled
                                            />

                                            <TextField
                                                value={
                                                    opt
                                                }
                                                fullWidth
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                            />

                                            {checked && (
                                                <Typography
                                                    color="success.main"
                                                    fontWeight={600}
                                                    sx={{
                                                        minWidth:
                                                            100
                                                    }}
                                                >
                                                    Correct
                                                </Typography>
                                            )}
                                        </Box>
                                    );
                                }
                            )}
                        </Box>

                        {/* ANSWER EXPLANATION */}

                        <Box mt={3}>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                            >
                                <Checkbox
                                    checked={
                                        current.useAnswerExplanation
                                    }
                                    disabled
                                />

                                <Typography>
                                    Use Answer Explanation
                                </Typography>
                            </Box>

                            {current.useAnswerExplanation && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={
                                        current.explanation ||
                                        ""
                                    }
                                    InputProps={{
                                        readOnly: true
                                    }}
                                    sx={{
                                        mt: 2
                                    }}
                                    label="Answer Explanation"
                                />
                            )}
                        </Box>
                    </Paper>
                ) : (
                    <Typography>
                        Select a question to view
                    </Typography>
                )}

                {/* ==================================================
                    QUIZ SETTINGS DIALOG
                ================================================== */}

                <Dialog
                    open={openSettings}
                    onClose={handleCloseSettings}
                    fullWidth
                    maxWidth="xl"
                    sx={{
                        "& .MuiDialog-paper": {
                            overflow: "visible"
                        }
                    }}
                >
                    <DialogCloseButton
                        onClick={handleCloseSettings}
                    >
                        <i className="tabler-x" />
                    </DialogCloseButton>

                    <DialogTitle>
                        Quiz Settings
                    </DialogTitle>

                    <DialogContent
                        sx={{
                            pt: 2
                        }}
                    >
                        {/* ==================================================
                            HOW LEARNERS SEE QUESTIONS
                        ================================================== */}

                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            mb={1}
                        >
                            How Do Learners See Questions
                        </Typography>

                        <RadioGroup
                            value={orderSetting}
                            sx={{
                                ml: 2,
                                mb: 3
                            }}
                        >
                            <FormControlLabel
                                value="sameOrder"
                                control={
                                    <Radio disabled />
                                }
                                label="All Users see the Same Questions in Same Order"
                            />

                            <FormControlLabel
                                value="differentOrder"
                                control={
                                    <Radio disabled />
                                }
                                label="All Users see the Same Questions in Different Order"
                                sx={{
                                    display: "block",
                                    mt: 1
                                }}
                            />
                        </RadioGroup>

                        {/* ==================================================
                            MARKING TABLE
                        ================================================== */}

                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            mb={2}
                        >
                            Desired Marking Scheme
                        </Typography>

                        <Box
                            sx={{
                                width: 520,
                                maxWidth: "100%",
                                border: "1px solid #ccc",
                                borderRadius: 1,
                                p: 2,
                                mb: 3
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell />

                                        <TableCell>
                                            <Typography fontWeight={500}>
                                                Points for Correct
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight={500}>
                                                Points for Wrong
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {/* EASY */}

                                    <TableRow>
                                        <TableCell>
                                            Easy
                                        </TableCell>

                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={
                                                    points.easyCorrect
                                                }
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={
                                                    points.easyWrong
                                                }
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>

                                    {/* MEDIUM */}

                                    <TableRow>
                                        <TableCell>
                                            Medium
                                        </TableCell>

                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={
                                                    points.mediumCorrect
                                                }
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={
                                                    points.mediumWrong
                                                }
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>

                                    {/* DIFFICULT */}

                                    <TableRow>
                                        <TableCell>
                                            Difficult
                                        </TableCell>

                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={
                                                    points.difficultCorrect
                                                }
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                fullWidth
                                                value={
                                                    points.difficultWrong
                                                }
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </DialogContent>

                    {/* ONLY CLOSE BUTTON */}

                    <DialogActions
                        sx={{
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleCloseSettings}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default QueastionQuizPage;
