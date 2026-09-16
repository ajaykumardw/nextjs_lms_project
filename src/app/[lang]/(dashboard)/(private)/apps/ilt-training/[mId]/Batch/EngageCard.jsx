"use client";

import { useMemo, useState } from "react";

import { useRouter, useParams } from "next/navigation";

import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    InputBase,
    Typography,
} from "@mui/material";

import { toast } from "react-toastify";

import ShowFileModal from "../Engage/ShowFileModal";

import ActivityModal from "../ModalComponent/ActivityModal";


const EngageCard = ({
    activity,
    title,
    subtitle,
    runtime,
    rightInfo,
    mId,
    token,
    API_URL,
    fetchActivities,
}) => {

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingError, setEditingError] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [docURL, setDocURL] = useState();
    const [isOpen, setISOpen] = useState(false);
    const [logData, setLogData] = useState();
    const [selectedId, setSelectedId] = useState();
    const [activityId, setActivityId] = useState();

    const [isModalOpen, setIsModalOpen] = useState(false)

    const activity_id = activity?._id || activity?.id || null;

    const router = useRouter();

    const { lang } = useParams();

    const activityData = useMemo(() => {
        return (
            activity?.activity_type?.activity_data ||
            activity?.activity_type_data ||
            activity?.activity_data ||
            {}
        );
    }, [activity]);

    const activityTitle = useMemo(() => {
        const value =
            activity?.name ||
            activityData?.title ||
            activity?.title ||
            title ||
            "Untitled Activity";

        return String(value).trim() || "Untitled Activity";
    }, [activity, activityData, title]);

    const activitySubtitle = useMemo(() => {
        const value =
            subtitle ||
            activityData?.description ||
            activity?.description ||
            "";

        return String(value).trim();
    }, [activity, activityData, subtitle]);

    const activityStatus = useMemo(() => {
        return (
            activity?.status ||
            activity?.activity_status ||
            "Draft"
        );
    }, [activity]);

    const svgContent = activityData?.svg_content || "";

    const handleEditClick = () => {
        if (!activity_id) {
            toast.error("Activity ID is missing");
            
            return;
        }

        setEditingId(activity_id);
        setEditingTitle(activityTitle);
        setEditingError("");
    };

    const handleCancelEdit = () => {
        if (saving) return;

        setEditingId(null);
        setEditingTitle("");
        setEditingError("");
    };

    const handleChangeName = async () => {
        if (saving) return;

        const trimmedTitle = String(editingTitle || "").trim();

        if (!trimmedTitle) {
            setEditingError("Title is required");
            
            return;
        }

        if (trimmedTitle.length > 150) {
            setEditingError("Title cannot exceed 150 characters");
            
            return;
        }

        if (!activity_id) {
            toast.error("Activity ID is missing");
            
            return;
        }

        if (!API_URL) {
            toast.error("API URL is missing");
            
            return;
        }

        if (!mId) {
            toast.error("Module ID is missing");
            
            return;
        }

        if (!token) {
            toast.error("Authentication token is missing");
            
            return;
        }

        setEditingError("");
        setSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/company/activity/set-name/${mId}/${activity_id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: trimmedTitle,
                    }),
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    result?.error ||
                    "Failed to update activity name"
                );
            }

            toast.success("Activity name saved successfully", {
                autoClose: 1000,
            });

            setEditingId(null);
            setEditingTitle("");
            setEditingError("");

            if (typeof fetchActivities === "function") {
                await fetchActivities();
            }
        } catch (error) {
            console.error("Error updating activity name:", error);

            toast.error(
                error?.message || "Error updating activity name"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteContent = async () => {
        if (deleting || saving) return;

        if (!activity_id) {
            toast.error("Activity ID is missing");
            
            return;
        }

        if (!API_URL) {
            toast.error("API URL is missing");
            
            return;
        }

        if (!mId) {
            toast.error("Module ID is missing");
            
            return;
        }

        if (!token) {
            toast.error("Authentication token is missing");
            
            return;
        }

        /*
         * Optional browser confirmation.
         * Remove this block if you don't want confirmation.
         */
        const confirmed = window.confirm(
            "Are you sure you want to delete this activity?"
        );

        if (!confirmed) return;

        setDeleting(true);

        try {
            const response = await fetch(
                `${API_URL}/company/activity/delete/${mId}/${activity_id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to delete activity"
                );
            }

            toast.success("Activity deleted successfully", {
                autoClose: 1000,
            });

            /*
             * Refresh activity list
             */
            if (typeof fetchActivities === "function") {
                await fetchActivities();
            }
        } catch (error) {
            console.error("Error deleting activity:", error);

            toast.error(
                error?.message || "Error deleting activity"
            );
        } finally {
            setDeleting(false);
        }
    };

    const isEditing = editingId === activity_id;

    const onClose = () => {
        setIsModalOpen(false)
    }

    const handleCardClick = (activity) => {
        const isDocumentType = activity.module_type_id === "688723af5dd97f4ccae68834";

        const quesLength = activity?.questions?.length || 0;

        console.log("Questions", activity)

        if (quesLength > 0) {

            router.replace(`/${lang}/apps/ilt-training/${mId}/ilt-quiz/${activity?._id}`);
        } else {
            setISOpen(false);
            setIsModalOpen(false);

            setTimeout(() => {
                setLogData(activity);
                setActivityId(activity._id);
                setSelectedId(activity.module_type_id);

                if (isDocumentType && activity.document_data?.image_url) {
                    setDocURL(activity.document_data.image_url);
                    setIsModalOpen(true);
                } else {
                    setISOpen(true);
                }
            }, 10);
        }
    };

    const handleImportUser = (index) => {
        setSelectedPairIndex(index);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedPairIndex(null);
        setAllData([]);
    };

    return (
        <>

            <Card
                variant="outlined"
                sx={{
                    height: 140,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <CardContent
                    sx={{
                        height: "100%",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                        "&:last-child": {
                            pb: 2,
                        },
                    }}
                >
                    {/* Activity icon */}
                    {svgContent && (
                        <Box
                            component="div"
                            sx={{
                                width: 40,
                                height: 40,
                                mb: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                flexShrink: 0,
                                color: "black",
                            }}
                            onClick={() => handleCardClick(activity)}
                            dangerouslySetInnerHTML={{
                                __html: svgContent,
                            }}
                        />
                    )}

                    {/* Title / Edit */}
                    <Box
                        sx={{
                            minWidth: 0,
                            width: "100%",
                        }}
                    >
                        {isEditing ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 0.5,
                                    width: "100%",
                                }}
                            >
                                <Box
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                    }}
                                >
                                    <InputBase
                                        value={editingTitle}
                                        onChange={(e) => {
                                            setEditingTitle(
                                                e.target.value
                                            );

                                            if (editingError) {
                                                setEditingError("");
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleChangeName();
                                            }

                                            if (e.key === "Escape") {
                                                e.preventDefault();
                                                handleCancelEdit();
                                            }
                                        }}
                                        autoFocus
                                        disabled={saving}
                                        placeholder="Enter title"
                                        inputProps={{
                                            maxLength: 150,
                                        }}
                                        fullWidth
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: 16,
                                            borderBottom: `1px solid ${editingError
                                                ? "#d32f2f"
                                                : "#ccc"
                                                }`,
                                            "&:focus-within": {
                                                borderBottomColor:
                                                    "#0A2E73",
                                            },
                                        }}
                                    />

                                    {editingError && (
                                        <Typography
                                            variant="caption"
                                            color="error"
                                            sx={{
                                                display: "block",
                                                mt: 0.25,
                                            }}
                                        >
                                            {editingError}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Save */}
                                <IconButton
                                    onClick={handleChangeName}
                                    disabled={saving}
                                    size="small"
                                    aria-label="Save activity name"
                                    sx={{
                                        color: "#0A2E73",
                                        mt: -0.25,
                                    }}
                                >
                                    <i
                                        className={
                                            saving
                                                ? "tabler-loader-2"
                                                : "tabler-check"
                                        }
                                        style={{
                                            fontSize: 18,
                                        }}
                                    />
                                </IconButton>

                                {/* Cancel */}
                                <IconButton
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    size="small"
                                    aria-label="Cancel editing"
                                    sx={{
                                        color: "text.secondary",
                                        mt: -0.25,
                                    }}
                                >
                                    <i
                                        className="tabler-x"
                                        style={{
                                            fontSize: 18,
                                        }}
                                    />
                                </IconButton>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    minWidth: 0,
                                }}
                            >
                                <Typography
                                    fontWeight={600}
                                    variant="body1"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        flex: 1,
                                        minWidth: 0,
                                    }}
                                    title={activityTitle}
                                >
                                    {activityTitle}
                                </Typography>

                                {/* Edit */}
                                <IconButton
                                    onClick={handleEditClick}
                                    disabled={deleting}
                                    size="small"
                                    aria-label="Edit activity name"
                                    sx={{
                                        color: "#0A2E73",
                                        flexShrink: 0,
                                    }}
                                >
                                    <i
                                        className="tabler-edit"
                                        style={{
                                            fontSize: 18,
                                        }}
                                    />
                                </IconButton>
                            </Box>
                        )}

                        {/* Description */}
                        {activitySubtitle && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                                title={activitySubtitle}
                            >
                                {activitySubtitle}
                            </Typography>
                        )}
                    </Box>

                    {/* Bottom information */}
                    <Box
                        sx={{
                            mt: "auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            minWidth: 0,
                        }}
                    >
                        {/* Runtime */}
                        <Box
                            sx={{
                                minWidth: 0,
                                overflow: "hidden",
                            }}
                        >
                            {runtime && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                >
                                    {runtime}
                                </Typography>
                            )}
                        </Box>

                        {/* Right information */}
                        {rightInfo && (
                            <Box
                                sx={{
                                    textAlign: "right",
                                    flexShrink: 0,
                                    minWidth: 0,
                                }}
                            >
                                {rightInfo}
                            </Box>
                        )}
                    </Box>

                    {/* Status / Delete */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mt: 0.5,
                        }}
                    >
                        {/* Status */}
                        <Button
                            type="button"
                            size="small"
                            variant="contained"
                            disableElevation
                            sx={{
                                fontSize: "0.75rem",
                                textTransform: "none",
                                backgroundColor: "#00b66c",
                                "&:hover": {
                                    backgroundColor: "#009956",
                                },
                                borderRadius: 10,
                                px: 2,
                                minWidth: "unset",
                                height: 28,
                            }}
                        >
                            {activityStatus}
                        </Button>

                        {/* Delete */}
                        <IconButton
                            type="button"
                            size="small"
                            onClick={handleDeleteContent}
                            disabled={deleting || saving}
                            aria-label="Delete activity"
                            sx={{
                                color: "error.main",
                            }}
                        >
                            <i
                                className={
                                    deleting
                                        ? "tabler-loader-2"
                                        : "tabler-trash"
                                }
                                style={{
                                    fontSize: 18,
                                }}
                            />
                        </IconButton>
                    </Box>
                </CardContent>
            </Card>

            <ShowFileModal open={isModalOpen} setOpen={setIsModalOpen} docURL={docURL} />

            <ActivityModal
                fetchActivities={fetchActivities}
                key={activity_id}
                open={isOpen}
                id={selectedId}
                setISOpen={setISOpen}
                editData={logData}
                API_URL={API_URL}
                token={token}
                mId={mId}
                activityId={activity_id}
            />

        </>
    );
};

export default EngageCard;
