"use client";

import { useMemo, useState, useEffect } from "react";

import {
    Avatar,
    Box,
    Button,
    FormHelperText,
    Paper,
    Stack,
    MenuItem,
    Divider,
    Tab,
    TextField,
    Typography,
} from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";

import Grid from "@mui/material/Grid2";

import { toast } from "react-toastify";

import AttachmentField from "./AttachmentField";
import SessionList from "./SessionList";
import CompanyLearnerSelector from "./CompanyLearnerSelector";
import LearnerList from "./LearnerList";
import ModalFooter from "./ModalFooter";
import ImportUserModal from "../ModalComponent/ImportUserModal";

const LEARNER_STATUS = {
    NOMINATED: "nominated",
    NOT_RESPONDED: "not_responded",
    CONFIRMED: "confirmed",
    DECLINED: "declined",
    ATTENDANCE: "attendance"
};

const fieldStyleSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 1,
    },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const emptySession = () => ({
    id: `${Date.now()}-${Math.random()}`,
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    trainers: [],
    errors: {},
});

const getUserName = (user) => {
    const fullName =
        `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

    return (
        fullName ||
        user?.name ||
        user?.fullName ||
        user?.email ||
        "Unnamed learner"
    );
};

const getUserId = (user) => {
    return String(user?._id || user?.id || "");
};

const isLearnerUser = (user) => {
    const role = String(user?.role || "").toLowerCase();

    const roles = Array.isArray(user?.roles)
        ? user.roles.map((item) => {
            if (typeof item === "string") {
                return item.toLowerCase();
            }

            return String(
                item?.name ||
                item?.role ||
                item?.role_id?.name ||
                ""
            ).toLowerCase();
        })
        : [];

    return role === "learner" || roles.includes("learner");
};

const DefinedBatch = ({
    setOpenBatchModal,
    mId,
    token,
    setValue,
    handleFetchData,
    finalData = {},
    users = [],
    canManage = false,
    onBatchSaved,
    editingBatch = null,
}) => {
    const [participantTab, setParticipantTab] = useState(LEARNER_STATUS.NOMINATED);

    const [sessions, setSessions] =
        useState(() => {
            if (
                Array.isArray(
                    editingBatch?.sessions
                ) &&
                editingBatch.sessions.length > 0
            ) {
                return editingBatch.sessions.map(
                    (session) => ({
                        id:
                            session?._id ||
                            `${Date.now()}-${Math.random()}`,

                        date: session?.session_date
                            ? new Date(
                                session.session_date
                            )
                                .toISOString()
                                .split(
                                    "T"
                                )[0]
                            : "",

                        startTime:
                            session?.start_time ||
                            "",

                        endTime:
                            session?.end_time ||
                            "",

                        venue:
                            session?.venue ||
                            "",

                        /*
                         * If backend returns populated
                         * trainers, normalize them.
                         */
                        trainers:
                            Array.isArray(
                                session?.trainers
                            )
                                ? session.trainers.map(
                                    (trainer) =>
                                        String(
                                            trainer?.trainer_id ||
                                            trainer?._id ||
                                            trainer
                                        )
                                )
                                : [],

                        errors: {},
                    })
                );
            }

            return [emptySession()];
        });

    const [attendanceSessionId, setAttendanceSessionId] =
        useState(
            sessions?.[0]?.id || ""
        );

    const [attendance, setAttendance] = useState({});

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState(() => ({
        name: editingBatch?.name || "",

        startDate: editingBatch?.start_date
            ? new Date(editingBatch.start_date)
                .toISOString()
                .split("T")[0]
            : "",

        endDate: editingBatch?.end_date
            ? new Date(editingBatch.end_date)
                .toISOString()
                .split("T")[0]
            : "",

        venue: editingBatch?.venue || "",

        cost:
            editingBatch?.cost_per_learner ??
            "0",
    }));

    const [attachment, setAttachment] = useState(null);
    const [attachmentError, setAttachmentError] = useState("");

    const [sessionsError, setSessionsError] = useState("");

    const [learners, setLearners] =
        useState(() => {
            if (
                Array.isArray(
                    editingBatch?.learners
                )
            ) {
                return editingBatch.learners.map(
                    (learner) => ({
                        id:
                            learner?.learner_id?._id ||
                            learner?.learner_id ||
                            learner?._id,

                        learner_id:
                            learner?.learner_id?._id ||
                            learner?.learner_id,

                        name:
                            getUserName(
                                learner?.learner_id
                            ) ||
                            learner?.name ||
                            "",

                        email:
                            learner?.learner_id
                                ?.email ||
                            learner?.email ||
                            "",

                        emp_id:
                            learner?.learner_id
                                ?.emp_id ||
                            learner?.emp_id,

                        status:
                            learner?.status ||
                            LEARNER_STATUS.NOMINATED,
                    })
                );
            }

            return [];
        });

    const [importOpen, setImportOpen] = useState(false);

    const learnerUsers = useMemo(() => {

        const dataLearners = Array.isArray(finalData?.learner) ? finalData.learner : [];

        if (dataLearners.length > 0) {
            return dataLearners;
        }

        return users.filter(isLearnerUser);
    }, [finalData, users]);

    const trainers = useMemo(() => {

        return Array.isArray(finalData?.trainer) ? finalData.trainer : [];
    }, [finalData]);

    const setField = (field) => (event) => {
        const value = event.target.value;

        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
            submit: undefined,
        }));
    };

    const updateAttendance = (
        learnerId,
        status
    ) => {
        setAttendance((prev) => ({
            ...prev,
            [attendanceSessionId]: {
                ...(prev[attendanceSessionId] || {}),
                [String(learnerId)]: status,
            },
        }));
    };

    const handleAttachmentChange = (file, error) => {
        setAttachment(file);
        setAttachmentError(error || "");

        setErrors((prev) => ({
            ...prev,
            attachment: undefined,
        }));
    };

    const createLearnerObject = (user) => {
        const id = getUserId(user);

        return {
            id,
            learner_id: id,
            name: getUserName(user),
            email: user?.email || "",
            emp_id: user?.emp_id,
            status: LEARNER_STATUS.NOMINATED,
        };
    };

    const handleLearnerSelection = (selectedIds = []) => {
        const normalizedIds = selectedIds.map(String);

        const selectedIdSet = new Set(normalizedIds);

        const selectedUsers = learnerUsers.filter((user) =>
            selectedIdSet.has(getUserId(user))
        );

        setLearners((prev) => {
            const existingMap = new Map(
                prev.map((learner) => {
                    const id = String(
                        learner?.id || learner?.learner_id || ""
                    );

                    return [id, learner];
                })
            );

            /*
             * Add newly selected learners.
             */
            selectedUsers.forEach((user) => {
                const id = getUserId(user);

                if (!existingMap.has(id)) {
                    existingMap.set(
                        id,
                        createLearnerObject(user)
                    );
                }
            });

            const result = [];

            existingMap.forEach((learner) => {

                const learnerId = String(learner?.id || learner?.learner_id || "");

                if (
                    learner?.status !==
                    LEARNER_STATUS.NOMINATED ||
                    selectedIdSet.has(learnerId)
                ) {
                    result.push(learner);
                }
            });

            return result;
        });

        setErrors((prev) => ({
            ...prev,
            learners: undefined,
            submit: undefined,
        }));
    };

    const selectedLearnerIds = useMemo(() => {
        return learners
            .filter(
                (learner) =>
                    learner?.status ===
                    LEARNER_STATUS.NOMINATED
            )
            .map((learner) =>
                String(learner?.id || learner?.learner_id || "")
            )
            .filter(Boolean);
    }, [learners]);

    const handleRemoveLearner = (id) => {
        setLearners((prev) =>
            prev.filter(
                (learner) =>
                    String(
                        learner?.id ||
                        learner?.learner_id ||
                        ""
                    ) !== String(id)
            )
        );

        setErrors((prev) => ({
            ...prev,
            learners: undefined,
        }));
    };

    const handleImportClose = () => {
        setImportOpen(false);
    };

    const handleImportedUsers = (importedIds = []) => {
        const importedIdSet = new Set(
            importedIds.map(String)
        );

        const importedLearners = learnerUsers
            .filter((user) =>
                importedIdSet.has(getUserId(user))
            )
            .map(createLearnerObject);

        setLearners((prev) => {
            const existingIds = new Set(
                prev.map((learner) =>
                    String(learner?.id || learner?.learner_id || "")
                )
            );

            const newLearners =
                importedLearners.filter(
                    (learner) =>
                        !existingIds.has(
                            String(learner?.id || learner?.learner_id || "")
                        )
                );

            return [...prev, ...newLearners];
        });

        setImportOpen(false);

        setErrors((prev) => ({
            ...prev,
            learners: undefined,
        }));
    };

    const handleMoveToConfirmed = async (learnerId) => {
        if (!canManage) {
            toast.error(
                "You don't have permission to change learner status."
            );

            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/company/ILT/batch/${mId}/learner/${learnerId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status: LEARNER_STATUS.CONFIRMED,
                    }),
                }
            );

            const result =
                await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Could not update learner status."
                );
            }

            setLearners((prev) =>
                prev.map((learner) =>
                    String(
                        learner?.id ||
                        learner?.learner_id ||
                        ""
                    ) === String(learnerId)
                        ? {
                            ...learner,
                            status:
                                LEARNER_STATUS.CONFIRMED,
                        }
                        : learner
                )
            );

            toast.success(
                "Learner moved to Confirmed."
            );
        } catch (error) {
            console.error(
                "Move learner to confirmed error:",
                error
            );

            toast.error(
                error?.message ||
                "Could not update learner status."
            );
        }
    };

    const nominatedCount = learners.filter(
        (learner) =>
            learner?.status ===
            LEARNER_STATUS.NOMINATED
    ).length;

    const notRespondedCount = learners.filter(
        (learner) =>
            learner?.status ===
            LEARNER_STATUS.NOT_RESPONDED
    ).length;

    const confirmedCount = learners.filter(
        (learner) =>
            learner?.status ===
            LEARNER_STATUS.CONFIRMED
    ).length;

    const declinedCount = learners.filter(
        (learner) =>
            learner?.status ===
            LEARNER_STATUS.DECLINED
    ).length;

    /*
     * Validate entire batch.
     */
    const validate = () => {
        const next = {};

        if (!form.name.trim()) {
            next.name = "Batch name is required.";
        } else if (form.name.trim().length < 3) {
            next.name =
                "Batch name must be at least 3 characters.";
        }

        if (!form.startDate) {
            next.startDate =
                "Start date is required.";
        }

        if (!form.endDate) {
            next.endDate =
                "End date is required.";
        }

        if (form.startDate && form.endDate) {
            const start = new Date(
                `${form.startDate}T00:00:00`
            );

            const end = new Date(
                `${form.endDate}T00:00:00`
            );

            if (end < start) {
                next.endDate =
                    "End date cannot be before the start date.";
            }
        }

        const costNum = Number(form.cost);

        if (form.cost === "" || Number.isNaN(costNum)) {

            next.cost = "Enter a valid number.";
        } else if (costNum < 0) {

            next.cost = "Cost cannot be negative.";
        }

        if (attachmentError) {
            next.attachment = attachmentError;
        }

        if (!learners.length) {
            next.learners =
                "Select at least one learner.";
        }

        let sessionsValid = true;

        const validatedSessions =
            sessions.map((session) => {
                const sessionErrors = {};

                if (!session.date) {
                    sessionErrors.date = "Required";
                    sessionsValid = false;
                } else if (
                    form.startDate &&
                    form.endDate
                ) {

                    const sessionDate = new Date(`${session.date}T00:00:00`);

                    const batchStart = new Date(`${form.startDate}T00:00:00`);

                    const batchEnd = new Date(`${form.endDate}T00:00:00`);

                    if (sessionDate < batchStart || sessionDate > batchEnd) {

                        sessionErrors.date = "Must fall within batch dates";
                        sessionsValid = false;
                    }
                }

                if (!session.startTime) {

                    sessionErrors.startTime = "Required";
                    sessionsValid = false;
                }

                if (!session.endTime) {

                    sessionErrors.endTime = "Required";
                    sessionsValid = false;
                }

                if (
                    session.startTime &&
                    session.endTime &&
                    session.endTime <=
                    session.startTime
                ) {

                    sessionErrors.endTime = "Must be after start time";
                    sessionsValid = false;
                }

                return {
                    ...session,
                    errors: sessionErrors,
                };
            });

        if (!sessionsValid) {

            setSessions(validatedSessions);
            setSessionsError("Please fix the errors in your sessions.");
        } else {
            setSessionsError("");
        }

        setErrors(next);

        return (
            Object.keys(next).length === 0 &&
            sessionsValid
        );
    };

    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        if (!canManage) {
            toast.error(
                "You don't have permission to save this batch."
            );

            return;
        }

        setSaving(true);

        setErrors((prev) => ({
            ...prev,
            submit: undefined,
        }));

        try {
            const body = new FormData();

            body.append("type", "defined");

            body.append(
                "name",
                form.name.trim()
            );

            body.append(
                "startDate",
                form.startDate
            );

            body.append(
                "endDate",
                form.endDate
            );

            body.append(
                "venue",
                form.venue.trim()
            );

            body.append(
                "cost",
                String(Number(form.cost))
            );

            const cleanSessions =
                sessions.map(
                    ({
                        id,
                        date,
                        startTime,
                        endTime,
                        venue,
                        trainers: sessionTrainers = [],
                    }) => ({
                        id,
                        date,
                        startTime,
                        endTime,
                        venue: venue || "",
                        trainers: Array.isArray(sessionTrainers) ? sessionTrainers.map(String) : [],
                    })
                );

            body.append("sessions", JSON.stringify(cleanSessions));

            const cleanLearners =
                learners.map(
                    ({
                        id,
                        learner_id,
                        name,
                        email,
                        status,
                    }) => ({
                        learner_id: String(learner_id || id),
                        name: name || "",
                        email: email || "",
                        status: status || LEARNER_STATUS.NOMINATED,
                    })
                );

            body.append("learners", JSON.stringify(cleanLearners));

            if (attachment) {
                body.append("attachment", attachment);
            }

            const isEdit = Boolean(
                editingBatch?._id
            );

            const response = await fetch(
                isEdit
                    ? `${API_URL}/company/ILT/batch/${editingBatch._id}`
                    : `${API_URL}/company/ILT/batch/${mId}`,
                {
                    method: isEdit
                        ? "PUT"
                        : "POST",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },

                    body,
                }
            );

            const result = await response.json().catch(
                () => ({})
            );

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Could not save the batch."
                );
            }

            /*
             * Backend-created batch.
             */
            const savedBatch =
                result?.data ||
                result?.batch ||
                result;

            toast.success(
                "Batch saved successfully"
            );

            onBatchSaved?.({
                ...savedBatch,

                id:
                    savedBatch?._id ||
                    savedBatch?.id,

                type:
                    savedBatch?.type ||
                    "defined",

                name:
                    savedBatch?.name ||
                    form.name.trim(),

                startDate:
                    savedBatch?.startDate ||
                    form.startDate,

                endDate:
                    savedBatch?.endDate ||
                    form.endDate,

                venue:
                    savedBatch?.venue ??
                    form.venue,

                cost:
                    savedBatch?.cost ??
                    Number(form.cost),

                sessions:
                    savedBatch?.sessions ||
                    cleanSessions,

                learners:
                    savedBatch?.learners ||
                    cleanLearners,
            });

            setOpenBatchModal(false);

            handleFetchData()
            setValue("invite")

        } catch (error) {
            console.error(
                "Save defined batch error:",
                error
            );

            const message =
                error?.message ||
                "Could not save the batch. Please try again.";

            setErrors((prev) => ({
                ...prev,
                submit: message,
            }));

            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    /*
     * Unique trainers assigned to sessions.
     */
    const assignedTrainerIds = useMemo(() => {
        return Array.from(
            new Set(
                sessions.flatMap((session) =>
                    Array.isArray(session?.trainers)
                        ? session.trainers.map(String)
                        : []
                )
            )
        );
    }, [sessions]);

    const assignedTrainers = useMemo(() => {
        return assignedTrainerIds
            .map((trainerId) =>
                trainers.find(
                    (trainer) =>
                        String(trainer?._id) ===
                        String(trainerId)
                )
            )
            .filter(Boolean);
    }, [assignedTrainerIds, trainers]);

    useEffect(() => {
        if (!editingBatch) {
            setForm({
                name: "",
                startDate: "",
                endDate: "",
                venue: "",
                cost: "0",
            });

            setSessions([
                emptySession(),
            ]);

            setLearners([]);

            return;
        }

        setForm({
            name: editingBatch?.name || "",

            startDate:
                editingBatch?.start_date
                    ? new Date(
                        editingBatch.start_date
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            endDate:
                editingBatch?.end_date
                    ? new Date(
                        editingBatch.end_date
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            venue:
                editingBatch?.venue || "",

            cost:
                editingBatch?.cost_per_learner ??
                "0",
        });

        /*
         * Sessions
         */
        if (
            Array.isArray(
                editingBatch?.sessions
            ) &&
            editingBatch.sessions.length > 0
        ) {
            setSessions(
                editingBatch.sessions.map(
                    (session) => ({
                        id:
                            session?._id ||
                            `${Date.now()}-${Math.random()}`,

                        date:
                            session?.session_date
                                ? new Date(
                                    session.session_date
                                )
                                    .toISOString()
                                    .split(
                                        "T"
                                    )[0]
                                : "",

                        startTime:
                            session?.start_time ||
                            "",

                        endTime:
                            session?.end_time ||
                            "",

                        venue:
                            session?.venue ||
                            "",

                        trainers:
                            Array.isArray(
                                session?.trainers
                            )
                                ? session.trainers.map(
                                    (trainer) =>
                                        String(
                                            trainer?.trainer_id?._id ||
                                            trainer?.trainer_id ||
                                            trainer?._id ||
                                            trainer
                                        )
                                )
                                : [],

                        errors: {},
                    })
                )
            );
        } else {
            setSessions([
                emptySession(),
            ]);
        }

        /*
         * Learners
         */
        if (
            Array.isArray(
                editingBatch?.learners
            )
        ) {
            setLearners(
                editingBatch.learners.map(
                    (learner) => ({
                        id:
                            learner?.learner_id
                                ?._id ||
                            learner?.learner_id ||
                            learner?._id,

                        learner_id:
                            learner?.learner_id
                                ?._id ||
                            learner?.learner_id,

                        name:
                            getUserName(
                                learner?.learner_id
                            ) ||
                            learner?.name ||
                            "",

                        email:
                            learner?.learner_id
                                ?.email ||
                            learner?.email ||
                            "",

                        emp_id:
                            learner?.learner_id
                                ?.emp_id ||
                            learner?.emp_id,

                        status:
                            learner?.status ||
                            LEARNER_STATUS.NOMINATED,
                    })
                )
            );
        } else {
            setLearners([]);
        }

        setErrors({});
        setSessionsError("");
    }, [editingBatch]);

    return (
        <Box>
            <Typography
                variant="h6"
                gutterBottom
            >
                Batch detail
            </Typography>

            <Grid
                container
                spacing={3}
                sx={{ mb: 4 }}
            >
                <Grid
                    size={{
                        xs: 12,
                        md: 8,
                    }}
                >
                    <TextField
                        fullWidth
                        label="Batch name *"
                        placeholder="e.g. October cohort"
                        size="small"
                        sx={fieldStyleSx}
                        value={form.name}
                        onChange={setField("name")}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        md: 4,
                    }}
                    display="flex"
                    alignItems="stretch"
                >
                    <AttachmentField
                        attachment={attachment}
                        onChange={
                            handleAttachmentChange
                        }
                        error={errors.attachment}
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                    }}
                >
                    <TextField
                        fullWidth
                        label="From (start date) *"
                        type="date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        size="small"
                        sx={fieldStyleSx}
                        value={
                            form.startDate
                        }
                        onChange={setField(
                            "startDate"
                        )}
                        error={
                            !!errors.startDate
                        }
                        helperText={
                            errors.startDate
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                    }}
                >
                    <TextField
                        fullWidth
                        label="To (end date) *"
                        type="date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        size="small"
                        sx={fieldStyleSx}
                        value={form.endDate}
                        onChange={setField(
                            "endDate"
                        )}
                        error={
                            !!errors.endDate
                        }
                        helperText={
                            errors.endDate
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                    }}
                >
                    <TextField
                        fullWidth
                        label="Venue (place or conference link)"
                        placeholder="Optional"
                        size="small"
                        sx={fieldStyleSx}
                        value={form.venue}
                        onChange={setField(
                            "venue"
                        )}
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                    }}
                >
                    <TextField
                        fullWidth
                        label="Cost per learner"
                        type="number"
                        size="small"
                        sx={fieldStyleSx}
                        value={form.cost}
                        onChange={setField(
                            "cost"
                        )}
                        error={!!errors.cost}
                        helperText={errors.cost}
                        inputProps={{
                            min: 0,
                        }}
                    />
                </Grid>
            </Grid>

            {/* TRAINING PROGRESS */}

            <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 2 }}
                >
                    Training Overview
                </Typography>

                <Grid
                    container
                    spacing={2}
                >
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Participants
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {learners.length}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Sessions
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {sessions.length}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Trainers
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {assignedTrainers.length}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Confirmed
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {confirmedCount}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ mb: 1 }}
                >
                    Training Progress
                </Typography>

                <Stack spacing={1}>
                    <Typography
                        variant="body2"
                        color="success.main"
                    >
                        ✓ Batch created
                    </Typography>

                    <Typography
                        variant="body2"
                        color={
                            learners.length > 0
                                ? "success.main"
                                : "text.secondary"
                        }
                    >
                        {learners.length > 0
                            ? "✓"
                            : "○"}{" "}
                        Participants assigned
                    </Typography>

                    <Typography
                        variant="body2"
                        color={
                            assignedTrainers.length > 0
                                ? "success.main"
                                : "text.secondary"
                        }
                    >
                        {assignedTrainers.length > 0
                            ? "✓"
                            : "○"}{" "}
                        Trainers assigned
                    </Typography>

                    <Typography
                        variant="body2"
                        color={
                            sessions.length > 0
                                ? "success.main"
                                : "text.secondary"
                        }
                    >
                        {sessions.length > 0
                            ? "✓"
                            : "○"}{" "}
                        Sessions scheduled
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        ○ Training completed
                    </Typography>
                </Stack>
            </Paper>

            <SessionList
                sessions={sessions}
                finalData={finalData}
                setSessions={setSessions}
                sessionsError={sessionsError}
            />

            {/* LEARNERS */}

            <Box sx={{ mt: 4, mb: 3 }}>
                <Typography
                    variant="h6"
                    gutterBottom
                >
                    Learners
                </Typography>

                <CompanyLearnerSelector
                    finalData={finalData}
                    selectedIds={
                        selectedLearnerIds
                    }
                    onChange={
                        handleLearnerSelection
                    }
                    disabled={
                        saving || !canManage
                    }
                />

                {errors.learners && (
                    <FormHelperText error>
                        {errors.learners}
                    </FormHelperText>
                )}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "flex-end",
                        mt: 1,
                    }}
                >
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                            setImportOpen(true)
                        }
                        disabled={
                            saving ||
                            !canManage
                        }
                    >
                        Import learners
                    </Button>
                </Box>
            </Box>

            {/* PARTICIPANT STATUS */}

            <TabContext
                value={participantTab}
            >
                <TabList
                    onChange={(
                        event,
                        value
                    ) =>
                        setParticipantTab(
                            value
                        )
                    }
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        label={`Nominated (${nominatedCount})`}
                        value={
                            LEARNER_STATUS.NOMINATED
                        }
                    />

                    <Tab
                        label={`Not responded (${notRespondedCount})`}
                        value={
                            LEARNER_STATUS.NOT_RESPONDED
                        }
                    />

                    <Tab
                        label={`Confirmed (${confirmedCount})`}
                        value={
                            LEARNER_STATUS.CONFIRMED
                        }
                    />

                    <Tab
                        label={`Declined (${declinedCount})`}
                        value={
                            LEARNER_STATUS.DECLINED
                        }
                    />

                    <Tab
                        label="Instructors"
                        value="instructors"
                    />
                    <Tab
                        label="Instructors"
                        value="instructors"
                    />
                </TabList>

                <TabPanel
                    value={participantTab}
                    sx={{ p: 0 }}
                >
                    {participantTab ===
                        LEARNER_STATUS.NOMINATED && (
                            <Box sx={{ mt: 3 }}>
                                <LearnerList
                                    learners={learners}
                                    status={
                                        LEARNER_STATUS.NOMINATED
                                    }
                                    onRemove={
                                        handleRemoveLearner
                                    }
                                    canManage={
                                        canManage
                                    }
                                    emptyLabel="No nominated learners yet"
                                />
                            </Box>
                        )}

                    {participantTab ===
                        LEARNER_STATUS.NOT_RESPONDED && (
                            <Box sx={{ mt: 3 }}>
                                <LearnerList
                                    learners={learners}
                                    status={
                                        LEARNER_STATUS.NOT_RESPONDED
                                    }
                                    canManage={
                                        canManage
                                    }
                                    emptyLabel="No learners waiting for a response"
                                />
                            </Box>
                        )}

                    {participantTab ===
                        LEARNER_STATUS.CONFIRMED && (
                            <Box sx={{ mt: 3 }}>
                                <LearnerList
                                    learners={learners}
                                    status={LEARNER_STATUS.CONFIRMED}
                                    canManage={canManage}
                                    emptyLabel="No confirmed participants yet"
                                />
                            </Box>
                        )}

                    {participantTab ===
                        LEARNER_STATUS.DECLINED && (
                            <Box sx={{ mt: 3 }}>
                                <LearnerList
                                    learners={learners}
                                    status={LEARNER_STATUS.DECLINED}
                                    onMoveToConfirmed={handleMoveToConfirmed}
                                    canManage={canManage}
                                    emptyLabel="No declined participants"
                                />
                            </Box>
                        )}

                    {participantTab ===
                        "instructors" && (
                            <Box sx={{ mt: 3 }}>
                                {assignedTrainers.length >
                                    0 ? (
                                    <Stack spacing={1}>
                                        {assignedTrainers.map(
                                            (trainer) => {

                                                const trainerName = getUserName(trainer);

                                                return (
                                                    <Paper
                                                        key={String(trainer._id)}
                                                        variant="outlined"
                                                        sx={{
                                                            p: 1.5,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1.5,
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                            }}
                                                        >
                                                            {trainerName.charAt(0).toUpperCase()}
                                                        </Avatar>

                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={600}
                                                            >
                                                                {trainerName}
                                                            </Typography>

                                                            {trainer?.emp_id && (
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {trainer.emp_id}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Paper>
                                                );
                                            }
                                        )}
                                    </Stack>
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            textAlign:
                                                "center",
                                            py: 2,
                                        }}
                                    >
                                        No trainers assigned
                                        to any session yet.
                                    </Typography>
                                )}
                            </Box>
                        )}

                    {participantTab === "attendance" && (
                        <Box sx={{ mt: 3 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                }}
                            >
                                <Stack
                                    direction={{
                                        xs: "column",
                                        sm: "row",
                                    }}
                                    justifyContent="space-between"
                                    spacing={2}
                                    sx={{ mb: 3 }}
                                >
                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={700}
                                        >
                                            Session Attendance
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Record attendance for each learner
                                            for the selected session.
                                        </Typography>
                                    </Box>

                                    <TextField
                                        select
                                        size="small"
                                        label="Session"
                                        value={attendanceSessionId}
                                        onChange={(e) =>
                                            setAttendanceSessionId(
                                                e.target.value
                                            )
                                        }
                                        sx={{
                                            minWidth: 240,
                                            ...fieldStyleSx,
                                        }}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        {sessions.map((session, index) => (
                                            <option
                                                key={session.id}
                                                value={session.id}
                                            >
                                                {`Session ${index + 1}${session.date
                                                    ? ` - ${session.date}`
                                                    : ""
                                                    }`}
                                            </option>
                                        ))}
                                    </TextField>
                                </Stack>

                                {learners.length === 0 ? (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            textAlign: "center",
                                            py: 4,
                                        }}
                                    >
                                        No learners assigned to this batch.
                                    </Typography>
                                ) : (
                                    <Stack spacing={1}>
                                        {learners
                                            .filter(
                                                (learner) =>
                                                    learner.status ===
                                                    LEARNER_STATUS.CONFIRMED
                                            )
                                            .map((learner) => {
                                                const learnerId = String(
                                                    learner.id ||
                                                    learner.learner_id
                                                );

                                                const currentStatus =
                                                    attendance[
                                                    attendanceSessionId
                                                    ]?.[learnerId] ||
                                                    "pending";

                                                return (
                                                    <Paper
                                                        key={learnerId}
                                                        variant="outlined"
                                                        sx={{
                                                            p: 1.5,
                                                        }}
                                                    >
                                                        <Grid
                                                            container
                                                            spacing={2}
                                                            alignItems="center"
                                                        >
                                                            <Grid
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 6,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={600}
                                                                >
                                                                    {learner.name}
                                                                </Typography>

                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {
                                                                        learner.email
                                                                    }
                                                                </Typography>
                                                            </Grid>

                                                            <Grid
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 6,
                                                                }}
                                                            >
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    size="small"
                                                                    label="Attendance"
                                                                    value={
                                                                        currentStatus
                                                                    }
                                                                    onChange={(e) =>
                                                                        updateAttendance(
                                                                            learnerId,
                                                                            e.target
                                                                                .value
                                                                        )
                                                                    }
                                                                    sx={
                                                                        fieldStyleSx
                                                                    }
                                                                >
                                                                    <MenuItem value="pending">
                                                                        Pending
                                                                    </MenuItem>

                                                                    <MenuItem value="present">
                                                                        Present
                                                                    </MenuItem>

                                                                    <MenuItem value="late">
                                                                        Late
                                                                    </MenuItem>

                                                                    <MenuItem value="absent">
                                                                        Absent
                                                                    </MenuItem>
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>
                                                    </Paper>
                                                );
                                            })}
                                    </Stack>
                                )}

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        mt: 3,
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        disabled={!canManage}
                                        onClick={() => {
                                            /*
                                             * Connect your attendance API here.
                                             * Current UI keeps the attendance state
                                             * locally until the API is connected.
                                             */
                                            toast.success(
                                                "Attendance saved."
                                            );
                                        }}
                                    >
                                        Save Attendance
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    )}

                </TabPanel>
            </TabContext>

            {errors.submit && (
                <FormHelperText
                    error
                    sx={{
                        textAlign: "center",
                        mb: 1,
                    }}
                >
                    {errors.submit}
                </FormHelperText>
            )}

            <ModalFooter
                onClose={() => setOpenBatchModal(false)}
                onSave={handleSave}
                onPublish={() => { }}
                saving={saving}
                canPublish={false}
            />

            <ImportUserModal
                open={importOpen}
                handleClose={handleImportClose}
                token={token}
                mId={mId}
                users={users}
                setAllData={handleImportedUsers}
            />
        </Box>
    );
};

export default DefinedBatch;
