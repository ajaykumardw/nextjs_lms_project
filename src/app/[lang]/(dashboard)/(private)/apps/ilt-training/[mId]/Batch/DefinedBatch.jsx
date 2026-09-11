import { useState, useMemo } from "react";

import {
    Box,
    Typography,
    TextField,
    Button,
    FormHelperText,
    Tab,
    Stack
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { TabContext, TabList, TabPanel } from "@mui/lab";

import { toast } from "react-toastify";

import AttachmentField from "./AttachmentField";
import SessionList from "./SessionList";
import CompanyLearnerSelector from "./CompanyLearnerSelector";
import LearnerList from "./LearnerList";
import ModalFooter from "./ModalFooter";
import ImportUserModal from "./ImportUserModal";

const LEARNER_STATUS = {
    NOMINATED: "nominated",
    NOT_RESPONDED: "not_responded",
    CONFIRMED: "confirmed",
    DECLINED: "declined",
};

const fieldStyleSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1 },
};

// A single session row (date, start/end time, venue, trainer)
const emptySession = () => ({
    id: Date.now() + Math.random(),
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    trainers: [],
    errors: {},
});

const getUserName = (user) => {
    const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

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
        ? user.roles.map((item) =>
            typeof item === "string"
                ? item.toLowerCase()
                : String(item?.name || item?.role || "").toLowerCase()
        )
        : [];

    return role === "learner" || roles.includes("learner");
};

const DefinedBatch = ({
    setOpenBatchModal,
    mId,
    token,
    users = [],
    canManage = false,
    onBatchSaved,
}) => {
    const [participantTab, setParticipantTab] = useState(
        LEARNER_STATUS.NOMINATED
    );

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: "",
        startDate: "",
        endDate: "",
        venue: "",
        cost: "0",
    });

    const [attachment, setAttachment] = useState(null);
    const [attachmentError, setAttachmentError] = useState("");

    const [sessions, setSessions] = useState([
        emptySession(),
    ]);

    const [sessionsError, setSessionsError] = useState("");

    const [learners, setLearners] = useState([]);

    const [importOpen, setImportOpen] = useState(false);

    const learnerUsers = useMemo(() => {
        return users.filter(isLearnerUser);
    }, [users]);


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
            status: LEARNER_STATUS.NOMINATED,
        };
    };

    const handleLearnerSelection = (selectedIds) => {
        const selectedIdSet = new Set(
            selectedIds.map(String)
        );

        const selectedUsers = learnerUsers.filter((user) =>
            selectedIdSet.has(getUserId(user))
        );

        setLearners((prev) => {
            const existingMap = new Map(
                prev.map((learner) => [
                    String(
                        learner.id ||
                        learner.learner_id
                    ),
                    learner,
                ])
            );

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
                const learnerId = String(
                    learner.id ||
                    learner.learner_id
                );

                if (
                    learner.status !==
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
        }));
    };

    const selectedLearnerIds = learners
        .filter(
            (learner) =>
                learner.status ===
                LEARNER_STATUS.NOMINATED
        )
        .map(
            (learner) =>
                String(
                    learner.id ||
                    learner.learner_id
                )
        );


    const handleRemoveLearner = (id) => {
        setLearners((prev) =>
            prev.filter(
                (learner) =>
                    String(
                        learner.id ||
                        learner.learner_id
                    ) !== String(id)
            )
        );
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
                importedIdSet.has(
                    getUserId(user)
                )
            )
            .map(createLearnerObject);

        setLearners((prev) => {
            const existingIds = new Set(
                prev.map((learner) =>
                    String(
                        learner.id ||
                        learner.learner_id
                    )
                )
            );

            return [
                ...prev,
                ...importedLearners.filter(
                    (learner) =>
                        !existingIds.has(
                            String(
                                learner.id ||
                                learner.learner_id
                            )
                        )
                ),
            ];
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
                        status:
                            LEARNER_STATUS.CONFIRMED,
                    }),
                }
            );

            const result =
                await response.json().catch(
                    () => ({})
                );

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Could not update learner status."
                );
            }

            setLearners((prev) =>
                prev.map((learner) =>
                    String(
                        learner.id ||
                        learner.learner_id
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
            learner.status ===
            LEARNER_STATUS.NOMINATED
    ).length;

    const notRespondedCount = learners.filter(
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


    /**
     * Validate entire batch.
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

        if (!form.startDate) {
            next.startDate =
                "Start date is required.";
        }

        if (!form.endDate) {
            next.endDate =
                "End date is required.";
        }

        if (
            form.startDate &&
            form.endDate
        ) {
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

        if (
            form.cost === "" ||
            Number.isNaN(costNum)
        ) {
            next.cost =
                "Enter a valid number.";
        } else if (costNum < 0) {
            next.cost =
                "Cost cannot be negative.";
        }


        if (attachmentError) {
            next.attachment =
                attachmentError;
        }


        /**
         * At least one learner must be nominated.
         */
        if (!learners.length) {
            next.learners =
                "Select at least one learner.";
        }


        /**
         * Validate sessions.
         */
        let sessionsValid = true;

        const validatedSessions =
            sessions.map((session) => {
                const sessionErrors = {};

                if (!session.date) {
                    sessionErrors.date =
                        "Required";

                    sessionsValid = false;
                } else if (
                    form.startDate &&
                    form.endDate
                ) {
                    const sessionDate =
                        new Date(
                            `${session.date}T00:00:00`
                        );

                    const batchStart =
                        new Date(
                            `${form.startDate}T00:00:00`
                        );

                    const batchEnd =
                        new Date(
                            `${form.endDate}T00:00:00`
                        );

                    if (
                        sessionDate <
                        batchStart ||
                        sessionDate >
                        batchEnd
                    ) {
                        sessionErrors.date =
                            "Must fall within batch dates";

                        sessionsValid = false;
                    }
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
        } else {
            setSessionsError("");
        }


        setErrors(next);

        return (
            Object.keys(next).length === 0 &&
            sessionsValid
        );
    };


    /**
     * Save batch to backend.
     */
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

            body.append(
                "type",
                "defined"
            );

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
                        venue:
                            venue || "",
                        trainers:
                            sessionTrainers || [],
                    })
                );


            body.append(
                "sessions",
                JSON.stringify(
                    cleanSessions
                )
            );

            const cleanLearners =
                learners.map(
                    ({
                        id,
                        learner_id,
                        name,
                        email,
                        status,
                    }) => ({
                        learner_id:
                            learner_id || id,
                        name,
                        email,
                        status:
                            status ||
                            LEARNER_STATUS.NOMINATED,
                    })
                );


            body.append(
                "learners",
                JSON.stringify(
                    cleanLearners
                )
            );


            if (attachment) {
                body.append(
                    "attachment",
                    attachment
                );
            }


            const response =
                await fetch(
                    `${API_URL}/company/ILT/batch/${mId}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body,
                    }
                );


            const result =
                await response.json().catch(
                    () => ({})
                );


            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Could not save the batch."
                );
            }


            /**
             * Prefer backend-created batch.
             * Never create Date.now() fake IDs.
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
                        error={
                            errors.attachment
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
                        onChange={
                            setField(
                                "startDate"
                            )
                        }
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
                        value={
                            form.endDate
                        }
                        onChange={
                            setField(
                                "endDate"
                            )
                        }
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
                        value={
                            form.venue
                        }
                        onChange={
                            setField("venue")
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
                        label="Cost per learner"
                        type="number"
                        size="small"
                        sx={fieldStyleSx}
                        value={
                            form.cost
                        }
                        onChange={
                            setField("cost")
                        }
                        error={
                            !!errors.cost
                        }
                        helperText={
                            errors.cost
                        }
                        inputProps={{
                            min: 0,
                        }}
                    />
                </Grid>
            </Grid>


            <SessionList
                sessions={sessions}
                setSessions={setSessions}
                sessionsError={sessionsError}
            />


            {/* =========================
                LEARNER SELECTION
            ========================== */}
            <Box sx={{ mt: 4, mb: 3 }}>
                <Typography
                    variant="h6"
                    gutterBottom
                >
                    Learners
                </Typography>


                <CompanyLearnerSelector
                    users={users}
                    selectedIds={
                        selectedLearnerIds
                    }
                    onChange={
                        handleLearnerSelection
                    }
                    disabled={
                        saving ||
                        !canManage
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
                        // variant="text"
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


            {/* =========================
                PARTICIPANT STATUS
            ========================== */}
            <TabContext
                value={participantTab}
            >
                <TabList
                    onChange={(event, value) =>
                        setParticipantTab(
                            value
                        )
                    }
                    className="border-b px-0 pt-0"
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
                </TabList>


                <TabPanel
                    value={participantTab}
                    className="p-0"
                >
                    {/* NOMINATED */}
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


                    {/* NOT RESPONDED */}
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


                    {/* CONFIRMED */}
                    {participantTab ===
                        LEARNER_STATUS.CONFIRMED && (
                            <Box sx={{ mt: 3 }}>
                                <LearnerList
                                    learners={learners}
                                    status={
                                        LEARNER_STATUS.CONFIRMED
                                    }
                                    canManage={
                                        canManage
                                    }
                                    emptyLabel="No confirmed participants yet"
                                />
                            </Box>
                        )}


                    {/* DECLINED */}
                    {participantTab ===
                        LEARNER_STATUS.DECLINED && (
                            <Box sx={{ mt: 3 }}>
                                <LearnerList
                                    learners={learners}
                                    status={
                                        LEARNER_STATUS.DECLINED
                                    }
                                    onMoveToConfirmed={
                                        handleMoveToConfirmed
                                    }
                                    canManage={
                                        canManage
                                    }
                                    emptyLabel="No declined participants"
                                />
                            </Box>
                        )}


                    {/* INSTRUCTORS */}
                    {participantTab ===
                        "instructors" && (
                            <Box sx={{ mt: 3 }}>
                                <Stack spacing={1}>
                                    {Array.from(
                                        new Set(
                                            sessions.flatMap(
                                                (session) =>
                                                    session.trainers ||
                                                    []
                                            )
                                        )
                                    ).map(
                                        (trainerId) => {
                                            const trainer =
                                                trainers.find(
                                                    (trainer) =>
                                                        String(
                                                            trainer._id
                                                        ) ===
                                                        String(
                                                            trainerId
                                                        )
                                                );

                                            if (
                                                !trainer
                                            ) {
                                                return null;
                                            }

                                            const trainerName =
                                                trainer.name ||
                                                `${trainer.first_name || ""} ${trainer.last_name || ""}`.trim() ||
                                                trainer.email ||
                                                "Trainer";

                                            return (
                                                <Paper
                                                    key={
                                                        trainerId
                                                    }
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.5,
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: 1.5,
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                        }}
                                                    >
                                                        {trainerName
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </Avatar>

                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            600
                                                        }
                                                    >
                                                        {
                                                            trainerName
                                                        }
                                                    </Typography>
                                                </Paper>
                                            );
                                        }
                                    )}


                                    {sessions.every(
                                        (session) =>
                                            !(
                                                session.trainers ||
                                                []
                                            ).length
                                    ) && (
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
                                </Stack>
                            </Box>
                        )}
                </TabPanel>
            </TabContext>


            {errors.submit && (
                <FormHelperText
                    error
                    sx={{
                        textAlign:
                            "center",
                        mb: 1,
                    }}
                >
                    {errors.submit}
                </FormHelperText>
            )}


            <ModalFooter
                onClose={() =>
                    setOpenBatchModal(false)
                }
                onSave={handleSave}
                onPublish={() => { }}
                saving={saving}
                canPublish={false}
            />


            <ImportUserModal
                open={importOpen}
                handleClose={
                    handleImportClose
                }
                token={token}
                mId={mId}
                users={users}
                setAllData={
                    handleImportedUsers
                }
            />
        </Box>
    );
};

export default DefinedBatch;
