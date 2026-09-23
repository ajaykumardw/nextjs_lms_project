"use client";

import { useState } from "react";

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

import Grid from "@mui/material/Grid2"

import {
    TabContext,
    TabList,
    TabPanel,
} from "@mui/lab";

import { toast } from "react-toastify";

import AttachmentField from "./AttachmentField";
import CompanyLearnerSelector from "./CompanyLearnerSelector";
import LearnerList from "./LearnerList";
import ModalFooter from "./ModalFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LEARNER_STATUS = {
    NOMINATED: "nominated",
    NOT_RESPONDED: "not_responded",
    CONFIRMED: "confirmed",
    DECLINED: "declined",
};

const fieldStyleSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 1,
    },
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
}) => {
    const [saving, setSaving] = useState(false);

    const [errors, setErrors] = useState({});

    const [tabValue, setTabValue] = useState("nominated");

    const [finalParticipantIds, setFinalParticipantIds] = useState(() => {
        return Array.isArray(editingBatch?.learners)
            ? editingBatch.learners
                .filter(
                    (learner) =>
                        learner?.status === LEARNER_STATUS.CONFIRMED
                )
                .map((learner) =>
                    String(
                        learner?.learner_id?._id ||
                        learner?.learner_id ||
                        learner?._id
                    )
                )
            : [];
    });

    const [finalizing, setFinalizing] = useState(false);

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
                item?.learner_id;

            return {
                id: String(learnerId),

                learner_id: String(
                    learnerId
                ),

                name:
                    `${learnerUser?.first_name || ""} ${learnerUser?.last_name || ""} `.trim() ||
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
    |--------------------------------------------------------------------------
    | Field change
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Attachment
    |--------------------------------------------------------------------------
    */

    const handleAttachmentChange = (
        file,
        error
    ) => {
        setAttachment(file);

        setAttachmentError(
            error || ""
        );

        setErrors((prev) => ({
            ...prev,
            attachment: undefined,
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | Learner selection
    |--------------------------------------------------------------------------
    */

    const handleLearnerSelection = (
        selectedIds
    ) => {
        const selected = selectedIds
            .map((id) => {
                const selectedUser =
                    users.find(
                        (u) =>
                            String(u._id) ===
                            String(id)
                    );

                if (!selectedUser) {
                    return null;
                }

                /*
                 * If learner already exists, preserve
                 * the current status.
                 */

                const existingLearner =
                    learners.find(
                        (learner) =>
                            String(
                                learner.learner_id ||
                                learner.id
                            ) ===
                            String(id)
                    );

                return {
                    id: String(
                        selectedUser._id
                    ),

                    learner_id: String(
                        selectedUser._id
                    ),

                    name:
                        `${selectedUser.first_name || ""} ${selectedUser.last_name || ""} `.trim() ||
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

        setErrors((prev) => ({
            ...prev,
            learners: undefined,
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | Remove learner
    |--------------------------------------------------------------------------
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
                    ) !==
                    String(learnerId)
            )
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Move learner to confirmed
    |--------------------------------------------------------------------------
    |
    | Normally learner response should control this status.
    | This function is kept for the LearnerList callback.
    |
    */

    const handleMoveToConfirmed = (
        learnerId
    ) => {
        setLearners((prev) =>
            prev.map((learner) => {

                const id = learner.learner_id || learner.id;

                if (String(id) != String(learnerId)) {
                    return learner;
                }

                return {

                    ...learner,
                    status: LEARNER_STATUS.CONFIRMED,
                };
            })
        );
    };

    const selectedLearnerIds = learners.map((learner) => String(learner.learner_id || learner.id));

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

    const validate = () => {
        const next = {};

        if (!form.name.trim()) {

            next.name = "Batch name is required.";
        } else if (

            form.name.trim().length < 3
        ) {

            next.name = "Batch name must be at least 3 characters.";
        }

        const capacity = Number(form.capacity);

        if (form.capacity === "" || Number.isNaN(capacity)) {
            next.capacity = "Enter a valid capacity.";
        } else if (capacity < 1) {
            next.capacity = "Capacity must be at least 1.";
        }

        if (!Number.isNaN(capacity) && capacity > 0 && learners.length > capacity) {
            next.capacity = `You selected ${learners.length} learners, but capacity is ${capacity}.`;
        }

        if (form.closeBy) {
            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const closeDate = new Date(`${form.closeBy} T00:00:00`);

            if (closeDate < today) {
                next.closeBy = "Close date cannot be in the past.";
            }
        }

        if (learners.length === 0) {
            next.learners = "Select at least one company learner.";
        }

        if (attachmentError) {
            next.attachment = attachmentError;
        }


        setErrors(next);

        return (Object.keys(next).length === 0);
    };

    const confirmedLearners = learners.filter(
        (learner) =>
            learner.status === LEARNER_STATUS.CONFIRMED
    );

    const toggleFinalParticipant = (learnerId) => {
        const id = String(learnerId);

        setFinalParticipantIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }

            if (
                Number(form.capacity) > 0 &&
                prev.length >= Number(form.capacity)
            ) {
                toast.warning(
                    `You can select maximum ${form.capacity} participants.`
                );

                return prev;
            }

            return [...prev, id];
        });
    };

    const handleFinalizeTraining = async () => {
        if (!canManage) {
            toast.error(
                "You don't have permission to finalize this training."
            );

            return;
        }

        if (finalParticipantIds.length === 0) {
            toast.error(
                "Select at least one confirmed learner."
            );

            return;
        }

        setFinalizing(true);

        try {
            if (typeof onFinalizeTraining === "function") {
                await onFinalizeTraining({
                    batchId:
                        editingBatch?._id ||
                        editingBatch?.id,

                    learnerIds: finalParticipantIds,
                });
            }

            toast.success(
                "Final participants selected successfully."
            );
        } catch (error) {
            toast.error(
                error?.message ||
                "Could not finalize training."
            );
        } finally {
            setFinalizing(false);
        }
    };

    const handleSave = async () => {
        if (!validate()) {
            setTabValue("nominated");

            return;
        }

        setSaving(true);

        try {
            const body = new FormData();

            body.append("type", "nominated");
            body.append("name", form.name.trim());
            body.append("capacity", String(Number(form.capacity)));
            body.append("closeBy", form.closeBy || "");

            const cleanLearners = learners.map((learner) => ({
                learner_id: String(learner.learner_id || learner.id),
                status: learner.status || LEARNER_STATUS.NOMINATED,
            }));


            body.append("learners", JSON.stringify(cleanLearners));

            if (attachment) {
                body.append("attachment", attachment);
            }

            const isEdit = Boolean(editingBatch?._id);

            const url = isEdit ? `${API_URL}/company/ILT/batch/${editingBatch._id} ` : `${API_URL}/company/ILT/batch/${mId} `;


            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    Authorization:
                        `Bearer ${token} `,
                },
                body,
            });


            const result = await response.json();


            if (!response.ok) {

                throw new Error(result?.message || (isEdit ? "Could not update nomination batch." : "Could not save nomination batch."));
            }

            const savedBatch = result?.data || result?.batch || result;

            toast.success(isEdit ? "Nomination batch updated successfully" : "Nomination batch saved successfully");

            onBatchSaved?.({
                ...(savedBatch || {}),

                id: savedBatch?._id || editingBatch?._id,
                type: "nominated",
                name: savedBatch?.name || form.name.trim(),
                capacity: savedBatch?.capacity || Number(form.capacity),
                close_by: savedBatch?.close_by || form.closeBy,
                learners: savedBatch?.learners || cleanLearners,
            });

            setOpenBatchModal(false);

            handleFetchData()
            setValue("invite")

        } catch (error) {

            console.error("Nomination batch save error:", error);

            setErrors((prev) => ({ ...prev, submit: error?.message || "Could not save the batch. Please try again.", }));

            toast.error(error?.message || "Could not save the batch.");

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


            {/* Batch name + attachment */}

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
                    onChange={setField(
                        "name"
                    )}
                    error={!!errors.name}
                    helperText={
                        errors.name
                    }
                />


                <Box
                    sx={{
                        minWidth: {
                            sm: 220,
                        },
                    }}
                >
                    <AttachmentField
                        attachment={
                            attachment
                        }
                        onChange={
                            handleAttachmentChange
                        }
                        error={
                            errors.attachment
                        }
                    />
                </Box>

            </Stack>


            {/* Capacity + close date */}

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
                    value={
                        form.capacity
                    }
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
                    value={
                        form.closeBy
                    }
                    onChange={setField(
                        "closeBy"
                    )}
                    error={
                        !!errors.closeBy
                    }
                    helperText={
                        errors.closeBy
                    }
                />

            </Stack>


            {/* Learner selection */}

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

                <TabList onChange={(e, value) => setTabValue(value)} className="border-b px-0 pt-0">

                    <Tab label={`Nominated(${nominatedCount})`} value="nominated" />
                    <Tab label={`Not responded(${notRespondedCount})`} value="not_responded" />
                    <Tab label={`Confirmed(${confirmedCount})`} value="confirmed" />
                    <Tab label={`Declined(${declinedCount})`} value="declined" />
                    <Tab label={`Final Participants (${finalParticipantIds.length})`} value="final" />
                </TabList>

                <TabPanel value="nominated" className="p-0"                >
                    <Box sx={{ mt: 3, }}>

                        <LearnerList
                            learners={learners}
                            status={LEARNER_STATUS.NOMINATED}
                            onRemove={handleRemoveLearner}
                            onMoveToConfirmed={handleMoveToConfirmed}
                            canManage={canManage}
                            emptyLabel="No nominated learners"
                        />

                    </Box>
                </TabPanel>

                <TabPanel value="not_responded" className="p-0"                >
                    <Box sx={{ mt: 3, }}>

                        <LearnerList
                            learners={learners}
                            status={LEARNER_STATUS.NOT_RESPONDED}
                            onRemove={handleRemoveLearner}
                            onMoveToConfirmed={handleMoveToConfirmed}
                            canManage={canManage}
                            emptyLabel="No learners are waiting for a response"
                        />

                    </Box>
                </TabPanel>

                <TabPanel value="confirmed" className="p-0">
                    <Box sx={{ mt: 3, }}>

                        <LearnerList
                            learners={learners}
                            status={LEARNER_STATUS.CONFIRMED}
                            onRemove={handleRemoveLearner}
                            onMoveToConfirmed={handleMoveToConfirmed}
                            canManage={canManage}
                            emptyLabel="No confirmed learners"
                        />

                    </Box>
                </TabPanel>

                <TabPanel value="declined" className="p-0">

                    <Box sx={{ mt: 3, }}>

                        <LearnerList
                            learners={learners}
                            status={LEARNER_STATUS.DECLINED}
                            onRemove={handleRemoveLearner}
                            onMoveToConfirmed={handleMoveToConfirmed}
                            canManage={canManage}
                            emptyLabel="No declined learners"
                        />

                    </Box>
                </TabPanel>

                <TabPanel value="final" className="p-0">
                    <Box sx={{ mt: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{ p: 2, mb: 2, borderRadius: 2, }}
                        >
                            <Stack
                                direction={{ xs: "column", sm: "row", }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center", }}
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
                                        Select confirmed learners who will
                                        attend the actual training.
                                    </Typography>
                                </Box>

                                <Chip
                                    label={`${finalParticipantIds.length} / ${form.capacity} selected`}
                                    color={
                                        finalParticipantIds.length > 0
                                            ? "primary"
                                            : "default"
                                    }
                                />
                            </Stack>
                        </Paper>

                        {confirmedLearners.length === 0 ? (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 4,
                                    textAlign: "center",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No confirmed learners are available.
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={1}>
                                {confirmedLearners.map((learner) => {
                                    const learnerId = String(
                                        learner.learner_id ||
                                        learner.id
                                    );

                                    const selected =
                                        finalParticipantIds.includes(
                                            learnerId
                                        );

                                    return (
                                        <Paper
                                            key={learnerId}
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
                                                        checked={selected}
                                                        disabled={
                                                            !canManage ||
                                                            (
                                                                !selected &&
                                                                finalParticipantIds.length >=
                                                                Number(form.capacity)
                                                            )
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
                                                            fontWeight={600}
                                                        >
                                                            {learner.name}
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {learner.email}
                                                            {learner.emp_id
                                                                ? ` • ${learner.emp_id}`
                                                                : ""}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
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
                                disabled={
                                    !canManage ||
                                    finalizing ||
                                    finalParticipantIds.length === 0
                                }
                                onClick={handleFinalizeTraining}
                            >
                                {finalizing
                                    ? "Finalizing..."
                                    : "Finalize Training"}
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>

            </TabContext>

            {errors.submit && (

                <FormHelperText error sx={{ textAlign: "center", mb: 1, }}>
                    {errors.submit}
                </FormHelperText>
            )}
            {/* NOMINATION SUMMARY */}

            <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    mb: 4,
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
                            Review learner responses and finalize
                            participants for training.
                        </Typography>
                    </Box>

                    <Chip
                        label={
                            `${finalParticipantIds.length} / ${form.capacity || 0} selected`
                        }
                        color={
                            finalParticipantIds.length > 0
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
                    <Grid size={{ xs: 6, sm: 3 }}>
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
                                {nominatedCount}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
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
                                {notRespondedCount}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
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

                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Declined
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {declinedCount}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

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
                            Select confirmed learners who will
                            participate in the final training.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        disabled={!canManage || finalizing || confirmedCount === 0}
                        onClick={() => setTabValue("final")}
                    >
                        Select Final Participants
                    </Button>
                </Stack>
            </Paper>

            {/* Footer */}

            <ModalFooter
                onClose={() => setOpenBatchModal(false)}
                onSave={handleSave}
                onPublish={() => { }}
                saving={saving}
                canPublish={false}
            />

        </Box>
    );
};

export default NominationBatch;
