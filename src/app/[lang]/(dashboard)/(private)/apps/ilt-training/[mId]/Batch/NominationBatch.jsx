import { useState } from "react";

import { Box, Typography, Stack, TextField, Tab, FormHelperText } from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";

import AttachmentField from "./AttachmentField";
import CompanyLearnerSelector from "./CompanyLearnerSelector";
import LearnerList from "./LearnerList";
import ModalFooter from "./ModalFooter";

const LEARNER_STATUS = {
    NOMINATED: "nominated",
    NOT_RESPONDED: "not_responded",
    CONFIRMED: "confirmed",
    DECLINED: "declined",
};

const fieldStyleSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1 },
};

const NominationBatch = ({
    setOpenBatchModal,
    mId,
    token,
    users = [],
    canManage,
    onBatchSaved,
}) => {
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [tabValue, setTabValue] = useState("nominated");

    const [form, setForm] = useState({
        name: "",
        capacity: "",
        closeBy: "",
    });

    const [attachment, setAttachment] = useState(null);
    const [attachmentError, setAttachmentError] = useState("");

    const [learners, setLearners] = useState([]);

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

    const handleAttachmentChange = (file, error) => {
        setAttachment(file);
        setAttachmentError(error || "");
    };

    /*
     * Company selects learners from existing company users.
     */
    const handleLearnerSelection = (selectedIds) => {
        const selected = selectedIds
            .map((id) => {
                const user = users.find(
                    (u) => String(u._id) === String(id)
                );

                if (!user) return null;

                return {
                    id: String(user._id),
                    learner_id: String(user._id),

                    name:
                        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                        user.name ||
                        user.email ||
                        "Unnamed learner",

                    email: user.email || "",

                    // IMPORTANT:
                    // Company nomination starts here.
                    status: LEARNER_STATUS.NOMINATED,
                };
            })
            .filter(Boolean);

        setLearners(selected);
    };

    const handleRemoveLearner = (learnerId) => {
        setLearners((prev) =>
            prev.filter(
                (learner) =>
                    String(learner.id) !== String(learnerId)
            )
        );
    };

    const selectedLearnerIds = learners.map((learner) =>
        String(learner.learner_id || learner.id)
    );

    const nominatedCount = learners.filter(
        (l) => l.status === LEARNER_STATUS.NOMINATED
    ).length;

    const notRespondedCount = learners.filter(
        (l) => l.status === LEARNER_STATUS.NOT_RESPONDED
    ).length;

    const confirmedCount = learners.filter(
        (l) => l.status === LEARNER_STATUS.CONFIRMED
    ).length;

    const declinedCount = learners.filter(
        (l) => l.status === LEARNER_STATUS.DECLINED
    ).length;

    const validate = () => {
        const next = {};

        if (!form.name.trim()) {
            next.name = "Batch name is required.";
        } else if (form.name.trim().length < 3) {
            next.name =
                "Batch name must be at least 3 characters.";
        }

        const capacity = Number(form.capacity);

        if (
            form.capacity === "" ||
            Number.isNaN(capacity)
        ) {
            next.capacity = "Enter a valid capacity.";
        } else if (capacity < 1) {
            next.capacity =
                "Capacity must be at least 1.";
        }

        if (
            learners.length > capacity &&
            capacity > 0
        ) {
            next.capacity = `You selected ${learners.length} learners, but capacity is ${capacity}.`;
        }

        if (form.closeBy) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (new Date(form.closeBy) < today) {
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

        setErrors(next);

        return Object.keys(next).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            setTabValue("nominated");
            return;
        }

        setSaving(true);

        try {
            const body = new FormData();

            body.append("type", "nominations");
            body.append("name", form.name.trim());
            body.append(
                "capacity",
                String(Number(form.capacity))
            );
            body.append(
                "closeBy",
                form.closeBy || ""
            );

            /*
             * Only nominated learners are sent when the
             * Company creates the batch.
             *
             * Backend should create nomination records.
             */
            body.append(
                "learners",
                JSON.stringify(
                    learners.map((learner) => ({
                        learner_id:
                            learner.learner_id ||
                            learner.id,

                        status:
                            LEARNER_STATUS.NOMINATED,
                    }))
                )
            );

            if (attachment) {
                body.append("attachment", attachment);
            }

            const response = await fetch(
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

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Could not save nomination batch."
                );
            }

            /*
             * Use backend-created batch ID.
             * Do NOT use Date.now() as database ID.
             */
            const savedBatch =
                result?.data || result?.batch;

            toast.success(
                "Nomination batch saved successfully"
            );

            onBatchSaved?.({
                ...(savedBatch || {}),
                type: "nominations",
                learners,
            });

            setOpenBatchModal(false);
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

    return (
        <Box>
            <Typography
                variant="h6"
                gutterBottom
            >
                Batch detail
            </Typography>

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
                        error={errors.attachment}
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
                    onChange={setField("capacity")}
                    error={!!errors.capacity}
                    helperText={errors.capacity}
                    inputProps={{ min: 1 }}
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
                    onChange={setField("closeBy")}
                    error={!!errors.closeBy}
                    helperText={errors.closeBy}
                />
            </Stack>

            {/* COMPANY LEARNER SELECTION */}
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
                    Select learners from the company users.
                    Learners will receive an invitation after
                    nomination.
                </Typography>

                <CompanyLearnerSelector
                    users={users}
                    selectedIds={selectedLearnerIds}
                    onChange={handleLearnerSelection}
                    disabled={!canManage}
                />

                {errors.learners && (
                    <FormHelperText error>
                        {errors.learners}
                    </FormHelperText>
                )}
            </Box>

            <TabContext value={tabValue}>
                <TabList
                    onChange={(e, value) =>
                        setTabValue(value)
                    }
                    className="border-b px-0 pt-0"
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
                </TabList>

                <TabPanel
                    value="nominated"
                    className="p-0"
                >
                    <Box sx={{ mt: 3 }}>
                        <LearnerList
                            learners={learners}
                            status={
                                LEARNER_STATUS.NOMINATED
                            }
                            onRemove={
                                handleRemoveLearner
                            }
                            onMoveToConfirmed={() => { }}
                            canManage={canManage}
                            emptyLabel="No nominated learners"
                        />
                    </Box>
                </TabPanel>

                <TabPanel
                    value="not_responded"
                    className="p-0"
                >
                    <Box sx={{ mt: 3 }}>
                        <LearnerList
                            learners={learners}
                            status={
                                LEARNER_STATUS.NOT_RESPONDED
                            }
                            onRemove={
                                handleRemoveLearner
                            }
                            onMoveToConfirmed={() => { }}
                            canManage={canManage}
                            emptyLabel="No learners are waiting for a response"
                        />
                    </Box>
                </TabPanel>

                <TabPanel
                    value="confirmed"
                    className="p-0"
                >
                    <Box sx={{ mt: 3 }}>
                        <LearnerList
                            learners={learners}
                            status={
                                LEARNER_STATUS.CONFIRMED
                            }
                            onRemove={
                                handleRemoveLearner
                            }
                            onMoveToConfirmed={() => { }}
                            canManage={canManage}
                            emptyLabel="No confirmed learners"
                        />
                    </Box>
                </TabPanel>

                <TabPanel
                    value="declined"
                    className="p-0"
                >
                    <Box sx={{ mt: 3 }}>
                        <LearnerList
                            learners={learners}
                            status={
                                LEARNER_STATUS.DECLINED
                            }
                            onRemove={
                                handleRemoveLearner
                            }
                            onMoveToConfirmed={() =>
                                handleMoveToConfirmed
                            }
                            canManage={canManage}
                            emptyLabel="No declined learners"
                        />
                    </Box>
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
                onClose={() =>
                    setOpenBatchModal(false)
                }
                onSave={handleSave}
                onPublish={() => { }}
                saving={saving}
                canPublish={false}
            />
        </Box>
    );
};

export default NominationBatch;
