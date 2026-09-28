"use client";

import { useEffect, useMemo, useState } from "react";

import {
    Box,
    Typography,
    Paper,
    Chip,
    Divider,
    Checkbox,
    FormControlLabel,
    Button,
    Stack,
    TextField,
    Tab,
    FormHelperText,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import {
    TabContext,
    TabList,
    TabPanel,
} from "@mui/lab";

import { toast } from "react-toastify";

import AttachmentField from "./AttachmentField";
import CompanyLearnerSelector from "./CompanyLearnerSelector";
import LearnerList from "./LearnerList";
import SessionList from "./SessionList";
import ModalFooter from "./ModalFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LEARNER_STATUS = {
    NOMINATED: "nominated",
    NOT_RESPONDED: "not_responded",
    CONFIRMED: "confirmed",
    DECLINED: "declined",
    SESSION: "sessions"
};

const fieldStyleSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 1,
    },
};

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

const NominationBatch = ({
    setOpenBatchModal,
    mId,
    token,
    users = [],
    handleFetchData,
    setValue,
    canManage = false,
    finalData = {},
    onBatchSaved,
    editingBatch = null,

    /*
     * Parent can optionally handle finalization.
     *
     * Expected:
     * onFinalizeTraining({
     *     batchId,
     *     learnerIds
     * })
     */
    onFinalizeTraining,
}) => {
    const [saving, setSaving] = useState(false);

    const [errors, setErrors] = useState({});

    const [tabValue, setTabValue] = useState("nominated");

    const [finalizing, setFinalizing] = useState(false);

    /*
     * Once participants are finalized, sessions become available.
     *
     * We also detect this from editingBatch if backend already returns
     * finalized participants.
     */
    const initialFinalParticipantIds = useMemo(() => {
        if (!Array.isArray(editingBatch?.learners)) {
            return [];
        }

        return editingBatch.learners
            .filter(
                (learner) =>
                    learner?.status ===
                    LEARNER_STATUS.CONFIRMED
            )
            .map((learner) =>
                String(
                    learner?.learner_id?._id ||
                    learner?.learner_id ||
                    learner?._id
                )
            );
    }, [editingBatch]);

    const [finalParticipantIds, setFinalParticipantIds] =
        useState(initialFinalParticipantIds);

    /*
     * If backend sends final participants separately, support that too.
     */
    useEffect(() => {
        if (
            Array.isArray(
                editingBatch?.final_participants
            )
        ) {
            setFinalParticipantIds(
                editingBatch.final_participants.map(
                    (item) =>
                        String(
                            item?._id ||
                            item?.learner_id ||
                            item
                        )
                )
            );
        }
    }, [editingBatch]);

    /*
     * Sessions
     *
     * Important:
     * For nominated batches sessions are initially empty.
     * Once final participants are selected, the UI allows sessions.
     */
    const [sessions, setSessions] = useState(() => {
        if (
            Array.isArray(editingBatch?.sessions) &&
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
                            .split("T")[0]
                        : "",

                    startTime:
                        session?.start_time || "",

                    endTime:
                        session?.end_time || "",

                    venue:
                        session?.venue || "",

                    trainers: Array.isArray(
                        session?.trainers
                    )
                        ? session.trainers.map(
                            (trainer) =>
                                String(
                                    trainer
                                        ?.trainer_id
                                        ?._id ||
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

        return [];
    });

    const [sessionsError, setSessionsError] =
        useState("");

    /*
     * Form
     */
    const [form, setForm] = useState({
        name: editingBatch?.name || "",

        capacity:
            editingBatch?.capacity !== null &&
                editingBatch?.capacity !== undefined
                ? String(editingBatch.capacity)
                : "",

        closeBy: editingBatch?.close_by
            ? new Date(editingBatch.close_by)
                .toISOString()
                .split("T")[0]
            : "",
    });

    const [attachment, setAttachment] =
        useState(null);

    const [attachmentError, setAttachmentError] =
        useState("");

    /*
     * Learners
     */
    const [learners, setLearners] = useState(() => {
        if (!Array.isArray(editingBatch?.learners)) {
            return [];
        }

        return editingBatch.learners.map((item) => {
            const learnerUser =
                item?.learner_id &&
                    typeof item.learner_id === "object"
                    ? item.learner_id
                    : null;

            const learnerId =
                learnerUser?._id ||
                item?.learner_id ||
                item?._id;

            return {
                id: String(learnerId),

                learner_id: String(learnerId),

                name:
                    `${learnerUser?.first_name || ""} ${learnerUser?.last_name || ""
                        }`.trim() ||
                    learnerUser?.name ||
                    learnerUser?.email ||
                    item?.name ||
                    "Unnamed learner",

                email:
                    learnerUser?.email ||
                    item?.email ||
                    "",

                emp_id:
                    learnerUser?.emp_id ||
                    item?.emp_id ||
                    "",

                status:
                    item?.status ||
                    LEARNER_STATUS.NOMINATED,
            };
        });
    });

    /*
     * Trainer list comes from finalData.trainer,
     * same as DefinedBatch.
     */
    const trainers = useMemo(() => {
        return Array.isArray(finalData?.trainer)
            ? finalData.trainer
            : [];
    }, [finalData]);

    /*
     * Finalized means the company has selected
     * at least one final participant.
     */
    const isFinalized = finalParticipantIds.length > 0;

    const safeTabValue =
        tabValue === "sessions" && !isFinalized
            ? "nominated"
            : tabValue;

    /*
     * ---------------------------------------------------------
     * Form field
     * ---------------------------------------------------------
     */
    const setField = (field) => (e) => {
        const value = e.target.value;

        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }));
    };

    /*
     * ---------------------------------------------------------
     * Attachment
     * ---------------------------------------------------------
     */
    const handleAttachmentChange = (
        file,
        error
    ) => {
        setAttachment(file);

        setAttachmentError(error || "");

        setErrors((prev) => ({
            ...prev,
            attachment: undefined,
        }));
    };

    /*
     * ---------------------------------------------------------
     * Learner selection
     * ---------------------------------------------------------
     */
    const handleLearnerSelection = (
        selectedIds
    ) => {
        const selected = selectedIds
            .map((id) => {
                const selectedUser = users.find(
                    (u) =>
                        String(u._id) ===
                        String(id)
                );

                if (!selectedUser) {
                    return null;
                }

                const existingLearner =
                    learners.find(
                        (learner) =>
                            String(
                                learner.learner_id ||
                                learner.id
                            ) === String(id)
                    );

                return {
                    id: String(selectedUser._id),

                    learner_id: String(
                        selectedUser._id
                    ),

                    name:
                        `${selectedUser.first_name || ""} ${selectedUser.last_name || ""
                            }`.trim() ||
                        selectedUser.name ||
                        selectedUser.email ||
                        "Unnamed learner",

                    email:
                        selectedUser.email || "",

                    emp_id:
                        selectedUser.emp_id || "",

                    status:
                        existingLearner?.status ||
                        LEARNER_STATUS.NOMINATED,
                };
            })
            .filter(Boolean);

        setLearners(selected);

        /*
         * Remove final participant IDs for learners
         * that have been removed from the batch.
         */
        const selectedSet = new Set(
            selected.map((item) =>
                String(
                    item.learner_id || item.id
                )
            )
        );

        setFinalParticipantIds((prev) =>
            prev.filter((id) =>
                selectedSet.has(String(id))
            )
        );

        setErrors((prev) => ({
            ...prev,
            learners: undefined,
        }));
    };

    /*
     * ---------------------------------------------------------
     * Remove learner
     * ---------------------------------------------------------
     */
    const handleRemoveLearner = (
        learnerId
    ) => {
        setLearners((prev) =>
            prev.filter(
                (learner) =>
                    String(
                        learner.learner_id ||
                        learner.id
                    ) !== String(learnerId)
            )
        );

        setFinalParticipantIds((prev) =>
            prev.filter(
                (id) =>
                    String(id) !==
                    String(learnerId)
            )
        );
    };

    /*
     * ---------------------------------------------------------
     * Move learner to confirmed
     *
     * This callback is kept for LearnerList.
     * Normally learner response should update this.
     * ---------------------------------------------------------
     */
    const handleMoveToConfirmed = async (
        learnerId
    ) => {
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
                        "Content-Type":
                            "application/json",

                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        status:
                            LEARNER_STATUS.CONFIRMED,
                    }),
                }
            );

            const result =
                await response
                    .json()
                    .catch(() => ({}));

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

    /*
     * ---------------------------------------------------------
     * Counts
     * ---------------------------------------------------------
     */
    const selectedLearnerIds =
        learners.map((learner) =>
            String(
                learner.learner_id ||
                learner.id
            )
        );

    const nominatedCount = learners.filter(
        (learner) =>
            learner.status ===
            LEARNER_STATUS.NOMINATED
    ).length;

    const notRespondedCount =
        learners.filter(
            (learner) =>
                learner.status ===
                LEARNER_STATUS.NOT_RESPONDED
        ).length;

    const confirmedCount = learners.filter(
        (learner) =>
            learner.status ===
            LEARNER_STATUS.CONFIRMED
    ).length;

    const declinedCount = learners.filter(
        (learner) =>
            learner.status ===
            LEARNER_STATUS.DECLINED
    ).length;

    const confirmedLearners =
        learners.filter(
            (learner) =>
                learner.status ===
                LEARNER_STATUS.CONFIRMED
        );

    /*
     * ---------------------------------------------------------
     * Validation
     * ---------------------------------------------------------
     */
    const validate = () => {
        const next = {};

        if (!form.name.trim()) {
            next.name =
                "Batch name is required.";
        } else if (
            form.name.trim().length < 3
        ) {
            next.name =
                "Batch name must be at least 3 characters.";
        }

        const capacity = Number(
            form.capacity
        );

        if (
            form.capacity === "" ||
            Number.isNaN(capacity)
        ) {
            next.capacity =
                "Enter a valid capacity.";
        } else if (capacity < 1) {
            next.capacity =
                "Capacity must be at least 1.";
        }

        if (
            !Number.isNaN(capacity) &&
            capacity > 0 &&
            learners.length > capacity
        ) {
            next.capacity = `You selected ${learners.length} learners, but capacity is ${capacity}.`;
        }

        if (form.closeBy) {
            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const closeDate = new Date(
                `${form.closeBy}T00:00:00`
            );

            if (closeDate < today) {
                next.closeBy =
                    "Close date cannot be in the past.";
            }
        }

        if (learners.length === 0) {
            next.learners =
                "Select at least one company learner.";
        }

        if (attachmentError) {
            next.attachment = attachmentError;
        }

        /*
         * Sessions are required ONLY after
         * final participants have been selected.
         *
         * This is the main difference from the
         * initial nomination stage.
         */
        if (isFinalized) {
            if (!sessions.length) {
                setSessionsError(
                    "Add at least one session after finalizing participants."
                );

                next.sessions =
                    "At least one session is required.";
            } else {
                let sessionsValid = true;

                const validatedSessions =
                    sessions.map((session) => {
                        const sessionErrors = {};

                        if (!session.date) {
                            sessionErrors.date =
                                "Required";

                            sessionsValid = false;
                        }

                        if (!session.startTime) {
                            sessionErrors.startTime =
                                "Required";

                            sessionsValid = false;
                        }

                        if (!session.endTime) {
                            sessionErrors.endTime =
                                "Required";

                            sessionsValid = false;
                        }

                        if (
                            session.startTime &&
                            session.endTime &&
                            session.endTime <=
                            session.startTime
                        ) {
                            sessionErrors.endTime =
                                "Must be after start time";

                            sessionsValid = false;
                        }

                        return {
                            ...session,
                            errors: sessionErrors,
                        };
                    });

                if (!sessionsValid) {
                    setSessions(
                        validatedSessions
                    );

                    setSessionsError(
                        "Please fix the errors in your sessions."
                    );

                    next.sessions =
                        "Please fix the session errors.";
                } else {
                    setSessionsError("");
                }
            }
        }

        setErrors(next);

        return (
            Object.keys(next).length === 0
        );
    };

    /*
     * ---------------------------------------------------------
     * Final participant selection
     * ---------------------------------------------------------
     */
    const toggleFinalParticipant = (
        learnerId
    ) => {
        const id = String(learnerId);

        setFinalParticipantIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter(
                    (item) => item !== id
                );
            }

            if (
                Number(form.capacity) > 0 &&
                prev.length >=
                Number(form.capacity)
            ) {
                toast.warning(
                    `You can select maximum ${form.capacity} participants.`
                );

                return prev;
            }

            return [...prev, id];
        });
    };

    /*
     * ---------------------------------------------------------
     * Finalize participants
     * ---------------------------------------------------------
     */
    const handleFinalizeTraining = async () => {
        if (!canManage) {
            toast.error(
                "You don't have permission to finalize this training."
            );

            return;
        }

        const selectedFinalIds = Array.from(
            new Set(
                finalParticipantIds
                    .map((id) => String(id))
                    .filter(Boolean)
            )
        );

        if (selectedFinalIds.length === 0) {
            toast.error(
                "Select at least one confirmed learner."
            );

            return;
        }

        if (
            Number(form.capacity) > 0 &&
            selectedFinalIds.length > Number(form.capacity)
        ) {
            toast.error(`You can select maximum ${form.capacity} participants.`);

            return;
        }

        setFinalizing(true);

        try {
            if (
                typeof onFinalizeTraining === "function"
            ) {
                await onFinalizeTraining({
                    batchId:
                        editingBatch?._id ||
                        editingBatch?.id,

                    learnerIds: selectedFinalIds,
                });
            }

            setFinalParticipantIds(selectedFinalIds);

            setTabValue("sessions");

            toast.success("Final participants selected successfully. You can now schedule sessions.");
        } catch (error) {

            console.error("Finalize training error:", error);

            toast.error(error?.message || "Could not finalize training.");
        } finally {
            setFinalizing(false);
        }
    };

    const handleSave = async () => {
        if (!canManage) {
            toast.error(
                "You don't have permission to save this batch."
            );

            return;
        }

        if (!validate()) {
            /*
             * Open the appropriate tab.
             */
            if (errors.sessions) {
                setTabValue("sessions");
            } else {
                setTabValue("nominated");
            }

            return;
        }

        setSaving(true);

        setErrors((prev) => ({
            ...prev,
            submit: undefined,
        }));

        try {
            const body = new FormData();

            body.append(
                "type",
                "nominated"
            );

            body.append(
                "name",
                form.name.trim()
            );

            body.append(
                "capacity",
                String(
                    Number(form.capacity)
                )
            );

            body.append(
                "closeBy",
                form.closeBy || ""
            );

            /*
             * Learners
             */
            const cleanLearners =
                learners.map((learner) => ({
                    learner_id: String(
                        learner.learner_id ||
                        learner.id
                    ),

                    name: learner.name || "",
                    email: learner.email || "",

                    status: learner.status || LEARNER_STATUS.NOMINATED,
                }));

            body.append(
                "learners",
                JSON.stringify(cleanLearners)
            );
            body.append(
                "finalParticipantIds",
                JSON.stringify(
                    finalParticipantIds
                )
            );

            /*
             * Sessions
             *
             * Only send sessions once participants
             * have been finalized.
             */
            if (isFinalized) {
                const cleanSessions =
                    sessions.map(
                        ({
                            id,
                            date,
                            startTime,
                            endTime,
                            venue,
                            trainers:
                            sessionTrainers = [],
                        }) => ({
                            id,

                            date,

                            startTime,

                            endTime,

                            venue:
                                venue || "",

                            trainers:
                                Array.isArray(
                                    sessionTrainers
                                )
                                    ? sessionTrainers.map(
                                        String
                                    )
                                    : [],
                        })
                    );

                body.append(
                    "sessions",
                    JSON.stringify(
                        cleanSessions
                    )
                );
            } else {
                body.append(
                    "sessions",
                    JSON.stringify([])
                );
            }

            /*
             * Attachment
             */
            if (attachment) {
                body.append(
                    "attachment",
                    attachment
                );
            }

            const isEdit = Boolean(
                editingBatch?._id
            );

            const url = isEdit
                ? `${API_URL}/company/ILT/batch/${editingBatch._id}`
                : `${API_URL}/company/ILT/batch/${mId}`;

            const response = await fetch(
                url,
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

            const result =
                await response
                    .json()
                    .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    (isEdit
                        ? "Could not update nomination batch."
                        : "Could not save nomination batch.")
                );
            }

            const savedBatch =
                result?.data ||
                result?.batch ||
                result;

            toast.success(
                isEdit
                    ? "Nomination batch updated successfully."
                    : "Nomination batch saved successfully."
            );

            onBatchSaved?.({
                ...(savedBatch || {}),

                id:
                    savedBatch?._id ||
                    savedBatch?.id ||
                    editingBatch?._id,

                type: "nominated",

                name:
                    savedBatch?.name ||
                    form.name.trim(),

                capacity:
                    savedBatch?.capacity ||
                    Number(form.capacity),

                close_by:
                    savedBatch?.close_by ||
                    form.closeBy,

                learners:
                    savedBatch?.learners ||
                    cleanLearners,

                final_participants:
                    savedBatch?.final_participants ||
                    finalParticipantIds,

                sessions:
                    savedBatch?.sessions ||
                    sessions,
            });

            setOpenBatchModal(false);

            await handleFetchData();

            setValue("invite");
        } catch (error) {
            console.error(
                "Nomination batch save error:",
                error
            );

            setErrors((prev) => ({
                ...prev,

                submit:
                    error?.message ||
                    "Could not save the batch. Please try again.",
            }));

            toast.error(
                error?.message ||
                "Could not save the batch."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * ---------------------------------------------------------
     * Assigned trainers
     * ---------------------------------------------------------
     */
    const assignedTrainerIds = useMemo(() => {
        return Array.from(
            new Set(
                sessions.flatMap(
                    (session) =>
                        Array.isArray(
                            session?.trainers
                        )
                            ? session.trainers.map(
                                String
                            )
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
                        String(
                            trainer?._id
                        ) ===
                        String(trainerId)
                )
            )
            .filter(Boolean);
    }, [
        assignedTrainerIds,
        trainers,
    ]);

    /*
     * ---------------------------------------------------------
     * Keep edit data synchronized
     * ---------------------------------------------------------
     */
    useEffect(() => {
        if (!editingBatch) {
            setForm({
                name: "",
                capacity: "",
                closeBy: "",
            });

            setLearners([]);

            setFinalParticipantIds([]);

            setSessions([]);

            setSessionsError("");

            return;
        }

        setForm({
            name:
                editingBatch?.name || "",

            capacity:
                editingBatch?.capacity !==
                    null &&
                    editingBatch?.capacity !==
                    undefined
                    ? String(
                        editingBatch.capacity
                    )
                    : "",

            closeBy:
                editingBatch?.close_by
                    ? new Date(
                        editingBatch.close_by
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",
        });

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
                    (learner) => {
                        const user =
                            learner?.learner_id &&
                                typeof learner.learner_id ===
                                "object"
                                ? learner.learner_id
                                : null;

                        const id =
                            user?._id ||
                            learner?.learner_id ||
                            learner?._id;

                        return {
                            id: String(id),

                            learner_id:
                                String(id),

                            name:
                                getUserName(
                                    user
                                ) ||
                                learner?.name ||
                                "",

                            email:
                                user?.email ||
                                learner?.email ||
                                "",

                            emp_id:
                                user?.emp_id ||
                                learner?.emp_id ||
                                "",

                            status:
                                learner?.status ||
                                LEARNER_STATUS.NOMINATED,
                        };
                    }
                )
            );
        }

        /*
         * Existing final participants
         */
        if (
            Array.isArray(
                editingBatch?.final_participants
            )
        ) {
            setFinalParticipantIds(
                editingBatch.final_participants.map(
                    (item) =>
                        String(
                            item?._id ||
                            item?.learner_id ||
                            item
                        )
                )
            );
        } else if (
            Array.isArray(
                editingBatch?.learners
            )
        ) {
            /*
             * Backward-compatible fallback:
             * confirmed learners are treated as
             * available final participants.
             */
            setFinalParticipantIds(
                editingBatch.learners
                    .filter(
                        (learner) =>
                            learner?.status ===
                            LEARNER_STATUS.CONFIRMED
                    )
                    .map((learner) =>
                        String(
                            learner?.learner_id
                                ?._id ||
                            learner?.learner_id ||
                            learner?._id
                        )
                    )
            );
        }

        /*
         * Existing sessions
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
                                    (
                                        trainer
                                    ) =>
                                        String(
                                            trainer
                                                ?.trainer_id
                                                ?._id ||
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
            setSessions([]);
        }
    }, [editingBatch]);

    useEffect(() => {
        if (!isFinalized && tabValue === "sessions") {
            setTabValue("nominated");
        }
    }, [isFinalized, tabValue]);

    /*
     * ---------------------------------------------------------
     * Render
     * ---------------------------------------------------------
     */
    return (
        <Box>
            <Typography
                variant="h6"
                gutterBottom
            >
                Nominated Batch
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
            >
                Nominate learners first. After
                final participants are selected,
                you can schedule the training
                sessions.
            </Typography>

            {/* =====================================================
                BATCH DETAILS
            ====================================================== */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <TextField
                    label="Batch name"
                    placeholder="Nominations batch"
                    required
                    fullWidth
                    size="small"
                    sx={fieldStyleSx}
                    value={form.name}
                    onChange={setField("name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={!canManage}
                />

                <Box
                    sx={{
                        minWidth: {
                            sm: 220,
                        },
                    }}
                >
                    <AttachmentField
                        attachment={attachment}
                        onChange={
                            handleAttachmentChange
                        }
                        error={
                            errors.attachment
                        }
                    />
                </Box>
            </Stack>

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={2}
                sx={{ mb: 4 }}
            >
                <TextField
                    label="Nominations capacity"
                    type="number"
                    required
                    size="small"
                    sx={{
                        width: {
                            sm: 220,
                        },
                        ...fieldStyleSx,
                    }}
                    value={form.capacity}
                    onChange={setField(
                        "capacity"
                    )}
                    error={
                        !!errors.capacity
                    }
                    helperText={
                        errors.capacity
                    }
                    inputProps={{
                        min: 1,
                    }}
                    disabled={!canManage}
                />

                <TextField
                    label="Close registrations by"
                    type="date"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    size="small"
                    sx={{
                        width: {
                            sm: 260,
                        },
                        ...fieldStyleSx,
                    }}
                    value={form.closeBy}
                    onChange={setField(
                        "closeBy"
                    )}
                    error={
                        !!errors.closeBy
                    }
                    helperText={
                        errors.closeBy
                    }
                    disabled={!canManage}
                />
            </Stack>

            {/* =====================================================
                LEARNERS
            ====================================================== */}

            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 1 }}
                >
                    Select learners
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    Select learners from the
                    company users. Learners
                    will receive an invitation
                    after nomination.
                </Typography>

                <CompanyLearnerSelector
                    users={users}
                    finalData={finalData}
                    selectedIds={
                        selectedLearnerIds
                    }
                    onChange={
                        handleLearnerSelection
                    }
                    disabled={!canManage}
                />

                {errors.learners && (
                    <FormHelperText error>
                        {errors.learners}
                    </FormHelperText>
                )}
            </Box>

            {/* =====================================================
                TABS
            ====================================================== */}

            <TabContext value={safeTabValue}>
                <TabList
                    onChange={(e, value) => {
                        if (value === "sessions" && !isFinalized) {
                            return;
                        }

                        setTabValue(value);
                    }}
                >
                    <Tab
                        label={`Nominated (${nominatedCount})`}
                        value="nominated"
                    />

                    <Tab
                        label={`Not responded (${notRespondedCount})`}
                        value="not_responded"
                    />

                    <Tab
                        label={`Confirmed (${confirmedCount})`}
                        value="confirmed"
                    />

                    <Tab
                        label={`Declined (${declinedCount})`}
                        value="declined"
                    />

                    <Tab
                        label={`Final Participants (${finalParticipantIds.length})`}
                        value="final"
                        disabled={
                            confirmedCount === 0
                        }
                    />

                    {isFinalized && (
                        <Tab
                            label={`Sessions (${sessions.length})`}
                            value="sessions"
                        />
                    )}
                </TabList>

                {/* =================================================
                    NOMINATED
                ================================================== */}

                <TabPanel
                    value="nominated"
                    sx={{ px: 0 }}
                >
                    <Box sx={{ mt: 2 }}>
                        <LearnerList
                            learners={learners}
                            status={
                                LEARNER_STATUS.NOMINATED
                            }
                            onRemove={
                                handleRemoveLearner
                            }
                            onMoveToConfirmed={
                                handleMoveToConfirmed
                            }
                            canManage={
                                canManage
                            }
                            emptyLabel="No nominated learners"
                        />
                    </Box>
                </TabPanel>

                {/* =================================================
                    NOT RESPONDED
                ================================================== */}

                <TabPanel
                    value="not_responded"
                    sx={{ px: 0 }}
                >
                    <Box sx={{ mt: 2 }}>
                        <LearnerList
                            learners={learners}
                            status={
                                LEARNER_STATUS.NOT_RESPONDED
                            }
                            onRemove={
                                handleRemoveLearner
                            }
                            onMoveToConfirmed={
                                handleMoveToConfirmed
                            }
                            canManage={
                                canManage
                            }
                            emptyLabel="No learners are waiting for a response"
                        />
                    </Box>
                </TabPanel>

                {/* =================================================
                    CONFIRMED
                ================================================== */}

                <TabPanel
                    value="confirmed"
                    sx={{ px: 0 }}
                >
                    <Box sx={{ mt: 2 }}>
                        <LearnerList
                            learners={learners}
                            status={
                                LEARNER_STATUS.CONFIRMED
                            }
                            onRemove={
                                handleRemoveLearner
                            }
                            onMoveToConfirmed={
                                handleMoveToConfirmed
                            }
                            canManage={
                                canManage
                            }
                            emptyLabel="No confirmed learners"
                        />
                    </Box>
                </TabPanel>

                {/* =================================================
                    DECLINED
                ================================================== */}

                <TabPanel
                    value="declined"
                    sx={{ px: 0 }}
                >
                    <Box sx={{ mt: 2 }}>
                        <LearnerList
                            learners={learners}
                            status={
                                LEARNER_STATUS.DECLINED
                            }
                            onRemove={
                                handleRemoveLearner
                            }
                            onMoveToConfirmed={
                                handleMoveToConfirmed
                            }
                            canManage={
                                canManage
                            }
                            emptyLabel="No declined learners"
                        />
                    </Box>
                </TabPanel>

                {/* =================================================
                    FINAL PARTICIPANTS
                ================================================== */}

                <TabPanel
                    value="final"
                    sx={{ px: 0 }}
                >
                    <Box sx={{ mt: 2 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                            }}
                        >
                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                justifyContent="space-between"
                                alignItems={{
                                    xs: "flex-start",
                                    sm: "center",
                                }}
                                spacing={2}
                            >
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={700}
                                    >
                                        Final Participants
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Select confirmed
                                        learners who
                                        will attend
                                        the actual
                                        training.
                                    </Typography>
                                </Box>

                                <Chip
                                    label={`${finalParticipantIds.length} / ${form.capacity ||
                                        0
                                        } selected`}
                                    color={
                                        finalParticipantIds.length >
                                            0
                                            ? "primary"
                                            : "default"
                                    }
                                />
                            </Stack>
                        </Paper>

                        {confirmedLearners.length ===
                            0 ? (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 4,
                                    textAlign:
                                        "center",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No confirmed
                                    learners are
                                    available.
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={1}>
                                {confirmedLearners.map(
                                    (
                                        learner
                                    ) => {
                                        const learnerId =
                                            String(
                                                learner.learner_id ||
                                                learner.id
                                            );

                                        const selected =
                                            finalParticipantIds.includes(
                                                learnerId
                                            );

                                        return (
                                            <Paper
                                                key={
                                                    learnerId
                                                }
                                                variant="outlined"
                                                sx={{
                                                    px: 2,
                                                    py: 1.5,
                                                    borderRadius: 1.5,
                                                }}
                                            >
                                                <FormControlLabel
                                                    sx={{
                                                        width: "100%",
                                                        m: 0,
                                                    }}
                                                    control={
                                                        <Checkbox
                                                            checked={
                                                                selected
                                                            }
                                                            disabled={
                                                                !canManage ||
                                                                (!selected &&
                                                                    finalParticipantIds.length >=
                                                                    Number(
                                                                        form.capacity
                                                                    ))
                                                            }
                                                            onChange={() =>
                                                                toggleFinalParticipant(
                                                                    learnerId
                                                                )
                                                            }
                                                        />
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={
                                                                    600
                                                                }
                                                            >
                                                                {
                                                                    learner.name
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    learner.email
                                                                }

                                                                {learner.emp_id
                                                                    ? ` • ${learner.emp_id}`
                                                                    : ""}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </Paper>
                                        );
                                    }
                                )}
                            </Stack>
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                mt: 3,
                            }}
                        >
                            <Button
                                variant="contained"
                                disabled={
                                    !canManage ||
                                    finalizing ||
                                    finalParticipantIds.length ===
                                    0
                                }
                                onClick={
                                    handleFinalizeTraining
                                }
                            >
                                {finalizing
                                    ? "Finalizing..."
                                    : isFinalized
                                        ? "Participants Finalized"
                                        : "Finalize Participants"}
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>

                {/* =================================================
                    SESSIONS
                ================================================== */}

                {isFinalized && (
                    <TabPanel
                        value="sessions"
                        sx={{ px: 0 }}
                    >
                        <Box sx={{ mt: 2 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    mb: 3,
                                    borderRadius: 2,
                                }}
                            >
                                <Stack
                                    direction={{
                                        xs: "column",
                                        md: "row",
                                    }}
                                    justifyContent="space-between"
                                    alignItems={{
                                        xs: "flex-start",
                                        md: "center",
                                    }}
                                    spacing={2}
                                >
                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={700}
                                        >
                                            Schedule Training
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Final participants
                                            have been
                                            selected. You
                                            can now add
                                            one or more
                                            training
                                            sessions and
                                            assign
                                            trainers.
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={`${finalParticipantIds.length} final participant${finalParticipantIds.length ===
                                            1
                                            ? ""
                                            : "s"
                                            }`}
                                        color="primary"
                                    />
                                </Stack>
                            </Paper>

                            <SessionList
                                sessions={sessions}
                                finalData={finalData}
                                setSessions={
                                    setSessions
                                }
                                sessionsError={
                                    sessionsError
                                }
                            />

                            {errors.sessions && (
                                <FormHelperText
                                    error
                                    sx={{ mt: 1 }}
                                >
                                    {
                                        errors.sessions
                                    }
                                </FormHelperText>
                            )}

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    mt: 3,
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                >
                                    Training Progress
                                </Typography>

                                <Stack
                                    spacing={1}
                                    sx={{ mt: 1.5 }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="success.main"
                                    >
                                        ✓ Batch
                                        created
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="success.main"
                                    >
                                        ✓{" "}
                                        {
                                            finalParticipantIds.length
                                        } final
                                        participant
                                        {finalParticipantIds.length ===
                                            1
                                            ? ""
                                            : "s"}{" "}
                                        selected
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color={
                                            assignedTrainers.length >
                                                0
                                                ? "success.main"
                                                : "text.secondary"
                                        }
                                    >
                                        {assignedTrainers.length >
                                            0
                                            ? "✓"
                                            : "○"}{" "}
                                        Trainers
                                        assigned
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color={
                                            sessions.length >
                                                0
                                                ? "success.main"
                                                : "text.secondary"
                                        }
                                    >
                                        {sessions.length >
                                            0
                                            ? "✓"
                                            : "○"}{" "}
                                        Sessions
                                        scheduled
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        ○ Training
                                        completed
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Box>
                    </TabPanel>
                )}
            </TabContext>

            {/* =====================================================
                SUMMARY
            ====================================================== */}

            <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    mt: 4,
                    mb: 2,
                    borderRadius: 2,
                }}
            >
                <Stack
                    direction={{
                        xs: "column",
                        md: "row",
                    }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                        >
                            Nomination Summary
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Review learner responses,
                            finalize participants,
                            and then schedule the
                            training sessions.
                        </Typography>
                    </Box>

                    <Chip
                        label={`${finalParticipantIds.length} / ${form.capacity || 0
                            } final participants`}
                        color={
                            finalParticipantIds.length >
                                0
                                ? "primary"
                                : "default"
                        }
                    />
                </Stack>

                <Grid
                    container
                    spacing={2}
                    sx={{ mt: 2 }}
                >
                    <Grid
                        size={{
                            xs: 6,
                            sm: 3,
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Nominated
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {
                                    nominatedCount
                                }
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid
                        size={{
                            xs: 6,
                            sm: 3,
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Awaiting Response
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {
                                    notRespondedCount
                                }
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid
                        size={{
                            xs: 6,
                            sm: 3,
                        }}
                    >
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
                                {
                                    confirmedCount
                                }
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid
                        size={{
                            xs: 6,
                            sm: 3,
                        }}
                    >
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
                </Grid>

                {!isFinalized && (
                    <>
                        <Divider
                            sx={{ my: 3 }}
                        />

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            justifyContent="space-between"
                            alignItems={{
                                xs: "stretch",
                                sm: "center",
                            }}
                            spacing={2}
                        >
                            <Box>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                >
                                    Ready to finalize?
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Select confirmed
                                    learners who will
                                    participate in the
                                    actual training.
                                    Sessions will be
                                    available after
                                    finalization.
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                disabled={
                                    !canManage ||
                                    finalizing ||
                                    confirmedCount ===
                                    0
                                }
                                onClick={() =>
                                    setTabValue(
                                        "final"
                                    )
                                }
                            >
                                Select Final
                                Participants
                            </Button>
                        </Stack>
                    </>
                )}

                {isFinalized && (
                    <>
                        <Divider
                            sx={{ my: 3 }}
                        />

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            justifyContent="space-between"
                            alignItems={{
                                xs: "stretch",
                                sm: "center",
                            }}
                            spacing={2}
                        >
                            <Box>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                >
                                    Participants finalized
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    You can now create
                                    and schedule one
                                    or more sessions.
                                </Typography>
                            </Box>

                            <Button
                                variant="outlined"
                                onClick={() =>
                                    setTabValue(
                                        "sessions"
                                    )
                                }
                            >
                                Schedule Sessions
                            </Button>
                        </Stack>
                    </>
                )}
            </Paper>

            {
                errors.submit && (
                    <FormHelperText
                        error
                        sx={{
                            textAlign: "center",
                            mb: 1,
                        }}
                    >
                        {errors.submit}
                    </FormHelperText>
                )
            }

            {/* =====================================================
                FOOTER
            ====================================================== */}

            <ModalFooter
                onClose={() =>
                    setOpenBatchModal(false)
                }
                onSave={handleSave}
                onPublish={() => { }}
                saving={saving}
                canPublish={false}
            />
        </Box >
    );
};

export default NominationBatch;
