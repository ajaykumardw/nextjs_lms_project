import { useState, useEffect } from "react";

import { Box, Card, IconButton, CircularProgress, Checkbox, FormControlLabel, Typography, Button, Radio, RadioGroup, InputBase } from "@mui/material";

import Grid from "@mui/material/Grid2"

import ActivityModal from "./ActivityModal";
import ShowFileModal from "../Engage/ShowFileModal";
import SurveyModalComponent from "./SurveyModalComponent";

const ContentFlowComponent = ({ setOpen, activities, API_URL, token, fetchActivities, mId }) => {

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingError, setEditingError] = useState("");

    const [selectedId, setSelectedId] = useState();
    const [isOpen, setISOpen] = useState(false);
    const [activityId, setActivityId] = useState();
    const [docURL, setDocURL] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logData, setLogData] = useState();

    const [questions, setQuestions] = useState([]);
    const [fetching, setFetching] = useState(false);

    const [orderType, setOrderType] = useState("any"); // ✅ correct useState syntax

    const handleOrderChange = (event) => {
        setOrderType(event.target.value); // update state when radio changes
    };

    const [checkCertificate, setCheckCertificate] = useState(false);
    const [selectedCertificateId, setSelectedCertificateId] = useState(null);
    const [certificateData, setCertificateData] = useState([]);

    const [isFeedbackChecked, setIsFeedbackChecked] = useState(false);
    const [isMandatoryChecked, setIsMandatoryChecked] = useState(false);

    const [surveyModal, setSurveyModal] = useState(false);

    const [loading, setLoading] = useState(false);

    const { lang } = useParams();
    const router = useRouter();
    const { handleSubmit, control } = useForm();

    // Fetch certificates
    const handleFetchCertificate = async () => {
        try {
            const response = await fetch(`${API_URL}/company/certificate/data`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();

            if (response.ok) setCertificateData(result.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch survey questions
    const handleFetchQuestion = async () => {
        setFetching(true);

        try {
            const response = await fetch(`${API_URL}/company/module/survey/setting/${mId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const value = await response.json();

            if (response.ok && Array.isArray(value?.data)) {
                setQuestions(
                    value.data?.length
                        ? value.data.map((q) => ({
                            id: Date.now() + Math.random(),
                            text: q.question || "",
                            options: q.options || [],
                            multiOption: q.multiOption || false,
                            type: q.questionsType || "",
                            mandatory: q.mandatory || false,
                            errors: { text: false, type: false },
                        }))
                        : []
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const fetchModuleSettings = async () => {
        try {
            const response = await fetch(`${API_URL}/company/modules/save/settings/${mId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();

            if (response.ok && result.data) {
                setOrderType(result.data.orderType || "any");
                setCheckCertificate(result.data.certificateEnabled || false);
                setSelectedCertificateId(result.data.selectedCertificateId || null);
                setIsFeedbackChecked(result.data.feedbackSurveyEnabled || false);
                setIsMandatoryChecked(result.data.mandatory || false);
            }
        } catch (error) {
            console.error("Error fetching module settings:", error);
        }
    };

    useEffect(() => {
        if (API_URL && token) {
            fetchModuleSettings()
            handleFetchCertificate();
            handleFetchQuestion();
        }
    }, [API_URL, token]);

    // Handle activity card click
    const handleCardClick = (activity) => {
        const isDocumentType = activity.module_type_id === "688723af5dd97f4ccae68834";
        const quesLength = activity?.questions?.length || 0;

        if (quesLength > 0) {
            router.replace(`/${lang}/apps/quiz/${mId}/${activity?._id}`);
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

    const handleChangeName = async (id) => {
        if (!editingTitle.trim()) {
            setEditingError("Title is required");

            return;
        }

        if (editingTitle?.length > 150) {
            setEditingError("Title cannot exceed 150 characters");

            return;
        }

        setEditingError("");

        try {
            const response = await fetch(`${API_URL}/company/activity/set-name/${mId}/${id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ title: editingTitle }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Activity name saved successfully", { autoClose: 1000 });
                fetchActivities();
            } else {
                toast.error(result.message || "Failed to update name");
            }
        } catch (error) {
            toast.error("Error updating activity name");
        }

        setEditingId(null);
        setEditingTitle("");
    };

    const handleEditClick = (activity) => {
        setEditingId(activity._id);
        setEditingTitle(activity?.name || activity?.activity_type?.activity_data?.title || "");
        setEditingError("");
    };

    const handleDeleteContent = async (id) => {
        try {
            const response = await fetch(`${API_URL}/company/activity/delete/${mId}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Activity deleted successfully", { autoClose: 1000 });
                fetchActivities();
            } else {
                toast.error(data.message || "Failed to delete activity");
            }
        } catch (error) {
            toast.error("Error deleting activity");
        }
    };

    const handleCheckboxChange = (event) => {
        setSelectedCertificateId(null);
        setCheckCertificate(event.target.checked);
    };

    const moduleSettingSave = async (formData) => {
        try {

            setLoading(true);

            if (checkCertificate && !selectedCertificateId) {
                toast.error("Please select a certificate", {
                    autoClose: 1000
                });

                return; // stop submission
            }

            const payload = {
                orderType: orderType || "any",
                certificateEnabled: checkCertificate,
                selectedCertificateId: checkCertificate ? selectedCertificateId : null,
                feedbackSurveyEnabled: isFeedbackChecked,
                mandatory: isMandatoryChecked,
            };


            const response = await fetch(`${API_URL}/company/modules/save/settings/${mId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success("Module settings saved successfully", { autoClose: 1000 });
                setLoading(false);
            }

        } catch (error) {
            console.error("Error saving module settings:", error);
            toast.error("Failed to save module settings");
        }
    };

    return (
        <Box p={3}>
            <Grid container spacing={3}>
                {/* Left Column - Activities */}
                <Grid item size={{ xs: 12, md: 7 }}>
                    <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
                        {activities?.length > 0 ? (
                            activities.map((activity, index) => (
                                <Card
                                    key={index}
                                    variant="outlined"
                                    sx={{
                                        borderColor: "#0A2E73",
                                        borderRadius: 2,
                                        p: 2,
                                        mb: 4,
                                        mt: 1,
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        "&:hover": {
                                            boxShadow: 3,
                                            transform: "translateY(-2px)",
                                            borderColor: "#0845b3",
                                        },
                                    }}
                                >
                                    <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                                        <Grid item xs>
                                            <Box display="flex" alignItems="flex-start" gap={2}>
                                                <Box
                                                    sx={{ inlineSize: 40, blockSize: 40, cursor: "pointer" }}
                                                    onClick={() => handleCardClick(activity)}
                                                    dangerouslySetInnerHTML={{
                                                        __html: activity?.activity_type?.activity_data?.svg_content,
                                                    }}
                                                />
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center">
                                                        {editingId === activity._id ? (
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <InputBase
                                                                    value={editingTitle}
                                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: 16,
                                                                        borderBottom: editingError ? "1px solid red" : "1px solid #ccc",
                                                                        width: "100%",
                                                                    }}
                                                                    autoFocus
                                                                    placeholder="Enter title"
                                                                />
                                                                <IconButton
                                                                    onClick={() => handleChangeName(activity._id)}
                                                                    size="small"
                                                                    sx={{ color: "#0A2E73" }}
                                                                >
                                                                    <i className="tabler-check" />
                                                                </IconButton>
                                                                {editingError && (
                                                                    <Typography variant="caption" color="error" ml={0.5}>
                                                                        {editingError}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        ) : (
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Typography fontWeight={600}>
                                                                    {activity?.name || activity?.activity_type?.activity_data?.title}
                                                                </Typography>
                                                                <IconButton
                                                                    onClick={() => handleEditClick(activity)}
                                                                    size="small"
                                                                    sx={{ color: "#0A2E73" }}
                                                                >
                                                                    <i className="tabler-edit" style={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
                                                        {activity.description}
                                                    </Typography>

                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        sx={{
                                                            mt: 1,
                                                            fontSize: "0.75rem",
                                                            textTransform: "none",
                                                            backgroundColor: "#00b66c",
                                                            "&:hover": { backgroundColor: "#009956" },
                                                            borderRadius: 10,
                                                            px: 2,
                                                            minWidth: "unset",
                                                        }}
                                                    >
                                                        Draft
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item>
                                            <IconButton
                                                size="small"
                                                sx={{ color: "#0A2E73" }}
                                                onClick={() => handleDeleteContent(activity._id)}
                                            >
                                                <i className="tabler-trash" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Card>
                            ))
                        ) : (
                            <Typography textAlign="center">No activity found</Typography>
                        )}
                    </Box>
                </Grid>

                {/* Right Column - Module Settings */}
                <Grid item size={{ xs: 12, md: 5 }}>
                    <Box display="flex" justifyContent="flex-start" gap={2} mb={2}>
                        <Button type="button" variant="contained" color="primary" onClick={() => setOpen(true)}>
                            Add Activity
                        </Button>
                    </Box>

                    <form onSubmit={handleSubmit(moduleSettingSave)}>
                        {/* Order Selection */}
                        <RadioGroup
                            value={orderType}        // ✅ controlled component
                            onChange={handleOrderChange} // ✅ handle state update
                            sx={{ mb: 3 }}
                            name="orderType"
                        >
                            <FormControlLabel value="ordered" control={<Radio />} label="Learner needs to follow the order" />
                            <FormControlLabel value="any" control={<Radio />} label="Learner can attempt any order" />
                        </RadioGroup>

                        <Typography variant="subtitle1" gutterBottom>
                            On completion of Module launch the following
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={3}>
                            {/* Certificate Checkbox */}
                            <FormControlLabel
                                control={<Checkbox checked={checkCertificate} onChange={handleCheckboxChange} />}
                                label={<Typography>Certificate</Typography>}
                            />

                            {checkCertificate && (
                                <Box sx={{ display: "flex", gap: 2, minWidth: "max-content", flexWrap: "wrap" }}>
                                    {certificateData.map((item, index) => {
                                        const id = item._id ?? index;
                                        const isSelected = selectedCertificateId === id;

                                        return (
                                            <Card
                                                key={id}
                                                sx={{
                                                    width: 180,
                                                    height: 120,
                                                    borderRadius: 2,
                                                    border: isSelected ? "2px solid #1976d2" : "1px solid #e0e0e0",
                                                    cursor: "pointer",
                                                    position: "relative",
                                                }}
                                                onClick={() => setSelectedCertificateId(id)}
                                            >
                                                {isSelected && (
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            top: 6,
                                                            right: 6,
                                                            backgroundColor: "primary.main",
                                                            color: "#fff",
                                                            borderRadius: "50%",
                                                            width: 18,
                                                            height: 18,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        <i className="tabler-check" />
                                                    </Box>
                                                )}
                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundImage: `url(${assert_url}/frames/${item.backgroundImage})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition: "center",
                                                    }}
                                                >
                                                    <Box sx={{ p: 1, textAlign: "center" }}>
                                                        {item?.logoURL && (
                                                            <img
                                                                src={`${assert_url}/company_logo/${item.logoURL}`}
                                                                alt="Logo"
                                                                width={40}
                                                                height={20}
                                                                style={{ objectFit: "contain" }}
                                                            />
                                                        )}
                                                        <Typography sx={{ fontSize: 10, fontWeight: 600 }}>{item.title}</Typography>
                                                        <Typography sx={{ fontSize: 9 }}>[UserName]</Typography>
                                                        <Typography sx={{ fontSize: 8, color: "text.secondary" }}>On [date]</Typography>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        );
                                    })}
                                </Box>
                            )}

                            {/* Feedback Survey */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isFeedbackChecked}
                                        onChange={(e) => setIsFeedbackChecked(e.target.checked)}
                                        disabled={!fetching && questions?.length === 0}
                                    />
                                }
                                label={
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography>Feedback survey</Typography>
                                        <Button size="small" variant="outlined" onClick={() => setSurveyModal(true)}>
                                            Add A Survey
                                        </Button>
                                    </Box>
                                }
                            />

                            {/* Mandatory Checkbox */}
                            {isFeedbackChecked && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isMandatoryChecked}
                                            onChange={(e) => setIsMandatoryChecked(e.target.checked)}
                                            disabled={!fetching && questions?.length === 0}
                                        />
                                    }
                                    label="Mandatory"
                                />
                            )}
                        </Box>

                        <Box mt={3}>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                    />
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </Box>
                    </form>
                </Grid>
            </Grid>

            <SurveyModalComponent
                open={surveyModal}
                setISOpen={setSurveyModal}
                API_URL={API_URL}
                setFetching={setFetching}
                fetching={fetching}
                token={token}
                setQuestions={setQuestions}
                questions={questions}
                handleFetchQuestion={handleFetchQuestion}
                mId={mId}
            />

            <ShowFileModal open={isModalOpen} setOpen={setIsModalOpen} docURL={docURL} />

            <ActivityModal
                fetchActivities={fetchActivities}
                key={activityId}
                open={isOpen}
                id={selectedId}
                setISOpen={setISOpen}
                editData={logData}
                API_URL={API_URL}
                token={token}
                mId={mId}
                activityId={activityId}
            />
        </Box>
    );
};

export default ContentFlowComponent;
