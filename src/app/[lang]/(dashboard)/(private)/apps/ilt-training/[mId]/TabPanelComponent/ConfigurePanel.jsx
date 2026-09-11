import { useState, useEffect } from "react";

const ConfigurePanel = ({ token, handleFetchData, finalData, setQuestions, questions, mId, createData, certificateData, loading, finalScheduleData }) => {

    const [enrollment, setEnrollment] = useState("1");
    const [selectedCertificateId, setSelectedCertificateId] = useState(null);
    const [isCertificateSelected, setIsCertificateSelected] = useState(false)
    const [isEmailAllowed, setIsEmailAllowed] = useState(false)
    const [isSurveyAllowed, setIsSurveyAllowed] = useState(false)
    const [isEditPermissionEnabled, setIsEditPermissionEnabled] = useState(false);

    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false)
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)

    const [targetOptionPairs, setTargetOptionPairs] = useState([
        { target: "", options: [], secondOptions: [] },
    ]);

    const [allData, setAllData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPairIndex, setSelectedPairIndex] = useState(null);

    const [fetching, setFetching] = useState(false);
    const [selfEnrollData, setSelfEnrollData] = useState()

    const handleImportUser = (index) => {
        setSelectedPairIndex(index);
        setIsOpen(true);
    };

    const handleFirstChange = (index, value) => {
        setTargetOptionPairs((prev) => {
            const updated = prev.map((p) => ({ ...p }));

            updated[index].target = value;
            updated[index].options = [];

            switch (value) {
                case "1":
                    updated[index].secondOptions = createData.designation || [];
                    break;
                case "2":
                    updated[index].secondOptions = createData.department || [];
                    break;
                case "3":
                    updated[index].secondOptions = createData.group || [];
                    break;
                case "4":
                    updated[index].secondOptions = createData.region || [];
                    break;
                case "5":
                    updated[index].secondOptions = createData.user || [];
                    break;
                default:
                    updated[index].secondOptions = [];
            }

            return updated;
        });
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedPairIndex(null);
        setAllData([]);
    };

    // FIX: setAllData from ImportUserModal returns an array of matched user
    // IDs. Previously this modal's result was never merged back into the
    // target-audience "User" option list for the pair that opened it — the
    // imported users vanished. Now we merge them into that pair's `options`.
    const handleImportedTargetUsers = (importedIds) => {
        if (selectedPairIndex === null) return;

        setTargetOptionPairs((prev) => {
            const updated = prev.map((p) => ({ ...p }));
            const existing = new Set(updated[selectedPairIndex].options);

            importedIds.forEach((id) => existing.add(String(id)));
            updated[selectedPairIndex].options = Array.from(existing);

            return updated;
        });

        handleClose();
    };

    const handleSecondChange = (index, value) => {
        setTargetOptionPairs((prev) => {
            const updated = prev.map((p) => ({ ...p }));

            updated[index].options = normalizeOptions(value);

            return updated;
        });
    };

    const handleAddClick = () => {
        setTargetOptionPairs((prev) => {
            if (prev?.length >= MAX_PAIRS) return prev;

            return [...prev, { target: "", options: [], secondOptions: [] }];

        });
    };

    const handleRemoveClick = (index) => {
        setTargetOptionPairs((prev) => {
            if (prev?.length === 1) return prev;
            const copy = [...prev];

            copy.splice(index, 1);

            return copy;
        });
    };

    const handleSave = async () => {
        // Certificate validation
        if (isCertificateSelected && !selectedCertificateId) {
            toast.error("Please select a certificate.");
            return;
        }

        // Feedback survey validation - at least one question required if enabled
        if (isSurveyAllowed && (!questions || questions.length === 0 || !questions.some(q => q.text?.trim() && q.type))) {
            toast.error("Please add at least one survey question before saving.");
            return;
        }

        // Communication/reminder validation - at least one reminder required if enabled
        if (isEmailAllowed && !finalData?.moduleReminder) {
            toast.error("Please add a reminder before saving.");
            return;
        }

        // Target audience validation
        if ((selfEnrollData || enrollment) === "3") {
            const isValid = targetOptionPairs.every(
                (item) => item.target && item.options.length > 0
            );

            if (!isValid) {
                toast.error("Please select target and option for every row.");
                return;
            }
        }

        const payload = {
            editPermission: {
                disallowOtherTrainers: isEditPermissionEnabled,
            },
            certificate: {
                enabled: isCertificateSelected,
                certificate_id: isCertificateSelected ? selectedCertificateId : null,
            },
            feedbackSurvey: {
                enabled: isSurveyAllowed,
                questions: questions,
            },
            selfEnrollment: {
                type: selfEnrollData || enrollment,
                targetAudience:
                    (selfEnrollData || enrollment) === "3"
                        ? targetOptionPairs.map((item) => ({
                            target: item.target,
                            options: item.options,
                        }))
                        : [],
            },
            communication: {
                emailReminder: isEmailAllowed,
            },
        };

        try {

            const response = await fetch(`${API_URL}/company/ILT/module/setting/data/${mId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })


            if (response.ok) {

                toast.success("Module setting saved successfully", {
                    autoClose: 1000
                })
            }

        } catch (error) {
            throw new Error(error)
        }
    };

    useEffect(() => {
        const setting = finalScheduleData?.moduleSetting;
        if (!setting) return;

        setIsEditPermissionEnabled(setting.trainerAllowed);
        setIsCertificateSelected(setting.certificateEnabled ?? false);
        setSelectedCertificateId(setting.selectedCertificateId ?? null);
        setIsSurveyAllowed(setting.feedbackSurveyEnabled ?? false);
        setIsEmailAllowed(setting.reminderEnabled ?? false);

        const enrollmentType = String(finalScheduleData.selfEnrollmentSetting ?? "1");
        setEnrollment(enrollmentType);
        setSelfEnrollData(enrollmentType);

        const resolveSecondOptions = (target) => {
            switch (target) {
                case "1": return createData.designation || [];
                case "2": return createData.department || [];
                case "3": return createData.group || [];
                case "4": return createData.region || [];
                case "5": return createData.user || [];
                default: return [];
            }
        };

        if (finalScheduleData.targetPairs?.length) {
            setTargetOptionPairs(
                finalScheduleData.targetPairs.map(p => ({
                    target: p.target || "",
                    options: normalizeOptions(p.options),
                    secondOptions: resolveSecondOptions(p.target)
                }))
            );
        }
    }, [finalScheduleData, createData]);

    if (loading) return <ConfigurePanelSkeleton />

    return (
        <Grid container spacing={4}>
            <Grid item size={{ xs: 12, md: 9 }}>
                <SectionBlock title="Edit permissions">
                    <FormControlLabel
                        control={<Checkbox
                            size="small"
                            checked={isEditPermissionEnabled}
                            onChange={(e) => setIsEditPermissionEnabled(e.target.checked)}
                        />}
                        label={<Typography variant="body2">Disallow other trainers from making changes to this module</Typography>}
                    />
                </SectionBlock>

                <SectionBlock
                    title="On completion, module launches the following"
                >
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isCertificateSelected}
                                    onChange={(e) => setIsCertificateSelected(e.target.checked)}
                                    size="small"
                                />
                            }
                            label={
                                <Typography variant="body2" fontWeight={600}>
                                    Certificate
                                </Typography>
                            }
                        />
                    </Box>

                    {isCertificateSelected && (
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
                </SectionBlock>

                <SectionBlock title="Feedback survey">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Checkbox
                            checked={isSurveyAllowed}
                            onChange={(e) => {

                                setIsSurveyAllowed(e.target.checked)
                            }}
                            size="small"
                        />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            Collect a short survey from learners after they complete this module
                        </Typography>
                        {isSurveyAllowed && (

                            <Button size="small" variant="outlined" onClick={() => setIsSurveyModalOpen(true)}>
                                Add a survey
                            </Button>
                        )}
                    </Box>
                </SectionBlock>

                <SectionBlock title="Self enrollment settings">
                    <RadioGroup name="self-enrollment" value={enrollment} onChange={(e) => setEnrollment(e.target.value)}>
                        <Stack spacing={1}>
                            {enrollmentOptions.map((option) => (
                                <Paper
                                    key={option.value}
                                    variant="outlined"
                                    onClick={() => {

                                        setEnrollment(option.value)
                                        setSelfEnrollData(option?.value)
                                    }}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        cursor: "pointer",
                                        borderColor: enrollment === option.value ? "primary.main" : "divider",
                                    }}
                                >
                                    <FormControlLabel
                                        value={option.value}
                                        control={<Radio size="small" />}
                                        label={<Typography variant="body2">{option.label}</Typography>}
                                        sx={{ width: "100%" }}
                                    />
                                </Paper>
                            ))}
                        </Stack>
                    </RadioGroup>
                </SectionBlock>

                {/* Target Audience */}
                {selfEnrollData === "3" && (

                    <>
                        <Typography variant="h6" gutterBottom>
                            This Module Is Targeted At
                        </Typography>
                        {targetOptionPairs.map((pair, idx) => (
                            <Grid container spacing={2} alignItems="center" mb={3} key={idx}>
                                <Grid item size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        select
                                        label="Select module targets"
                                        fullWidth
                                        size="small"
                                        value={pair.target}
                                        onChange={(e) => handleFirstChange(idx, e.target.value)}
                                    >
                                        <MenuItem value="">Select Module Target</MenuItem>
                                        <MenuItem
                                            value="1"
                                            disabled={targetOptionPairs.some(
                                                (p, i) => p.target === "1" && i !== idx
                                            )}
                                        >
                                            Designation
                                        </MenuItem>
                                        <MenuItem
                                            value="2"
                                            disabled={targetOptionPairs.some(
                                                (p, i) => p.target === "2" && i !== idx
                                            )}
                                        >
                                            Department
                                        </MenuItem>
                                        <MenuItem
                                            value="3"
                                            disabled={targetOptionPairs.some(
                                                (p, i) => p.target === "3" && i !== idx
                                            )}
                                        >
                                            Group
                                        </MenuItem>
                                        <MenuItem
                                            value="4"
                                            disabled={targetOptionPairs.some(
                                                (p, i) => p.target === "4" && i !== idx
                                            )}
                                        >
                                            Region
                                        </MenuItem>
                                        <MenuItem
                                            value="5"
                                            disabled={targetOptionPairs.some(
                                                (p, i) => p.target === "5" && i !== idx
                                            )}
                                        >
                                            User
                                        </MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        select
                                        label="Select option"
                                        fullWidth
                                        size="small"
                                        value={pair.options}
                                        onChange={(e) => handleSecondChange(idx, e.target.value)}
                                        SelectProps={{ multiple: true }}
                                    >
                                        {pair.target !== "5" &&
                                            (pair.secondOptions || []).map((item, i) => (
                                                <MenuItem
                                                    key={String(item._id ?? i)}
                                                    value={String(item._id ?? item.id ?? item)}
                                                >
                                                    {item.name || item.title || item.label || item._id}
                                                </MenuItem>
                                            ))}
                                        {pair.target === "5" &&
                                            (pair.secondOptions || []).map((item, i) => (
                                                <MenuItem
                                                    key={String(item._id ?? i)}
                                                    value={String(item._id ?? item.id ?? item)}
                                                >
                                                    {item.first_name} {item.last_name}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                </Grid>

                                {pair.target === "5" && (
                                    <Grid item size={{ xs: 12, md: 2 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleImportUser(idx)}
                                        >
                                            Import User
                                        </Button>
                                    </Grid>
                                )}

                                <Grid
                                    item
                                    size={{ xs: 12, md: 1 }}
                                    display="flex"
                                    justifyContent="center"
                                >
                                    {idx === 0 ? (
                                        <Button
                                            variant="contained"
                                            onClick={handleAddClick}
                                            disabled={targetOptionPairs?.length >= MAX_PAIRS}
                                        >
                                            + Add
                                        </Button>
                                    ) : (
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveClick(idx)}
                                        >
                                            <i className="tabler-trash" />
                                        </IconButton>
                                    )}
                                </Grid>
                            </Grid>
                        ))}
                    </>
                )}

                <SectionBlock title="Communication settings">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Switch
                            checked={isEmailAllowed}
                            onChange={(e) => setIsEmailAllowed(e.target.checked)}
                        />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            Send a reminder email to learners who have not finished the module
                        </Typography>
                        {isEmailAllowed && (

                            <Button size="small" variant="outlined" onClick={() => {

                                setIsReminderModalOpen(true)
                            }}>
                                Add reminder
                            </Button>
                        )}
                    </Box>
                </SectionBlock>

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleSave}
                >
                    Save
                </Button>
            </Grid>
            <SurveyModalComponent
                open={isSurveyModalOpen}
                setISOpen={setIsSurveyModalOpen}
                setFetching={setFetching}
                fetching={fetching}
                token={token}
                setQuestions={setQuestions}
                questions={questions}
                handleFetchQuestion={handleFetchData}
                mId={mId}
            />
            <NotificationModalComponent
                open={isReminderModalOpen}
                setIsOpen={setIsReminderModalOpen}
                mId={mId}
                token={token}
                finalData={finalData}
                handleFetchData={handleFetchData}
            />
            <ImportUserModal
                open={isOpen}
                handleClose={handleClose}
                token={token}
                mId={mId}
                users={createData.user}
                setAllData={handleImportedTargetUsers}
            />
        </Grid>
    );
};

export default ConfigurePanel;
