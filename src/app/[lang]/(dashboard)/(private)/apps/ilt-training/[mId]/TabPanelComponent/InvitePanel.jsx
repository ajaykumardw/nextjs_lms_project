const InvitePanel = ({ loading, mId, finalData, activityData, token, users = [], canManage = true }) => {
    const [batchType, setBatchType] = useState("nominations");
    const [openBatchModal, setOpenBatchModal] = useState(false);
    const [importError, setImportError] = useState("");

    // FIX: "Import batches and sessions" now opens a real ImportBatchModal
    // instead of a raw hidden <input type=file>. Batches created come back
    // through onImported and are appended to `batches` — the single source
    // of truth for created batches on this panel.
    const [importBatchOpen, setImportBatchOpen] = useState(false);
    const [batches, setBatches] = useState([]);

    const handleImportBatchClick = () => {
        setImportError("");
        setImportBatchOpen(true);
    };

    const handleBatchesImported = async (parsedBatches) => {
        // In production this is where you'd POST each parsed batch (with its
        // sessions) to your API, e.g.:
        //
        // const saved = await Promise.all(parsedBatches.map((b) =>
        //     fetch(`${API_URL}/company/ILT/batch/${mId}`, {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        //         body: JSON.stringify({ type: "defined", ...b }),
        //     }).then((r) => r.json())
        // ));
        //
        // For now we just merge them into local state so the UI reflects
        // the import immediately.
        setBatches((prev) => [
            ...prev,
            ...parsedBatches.map((b) => ({
                id: Date.now() + Math.random(),
                type: "defined",
                name: b.name,
                startDate: b.startDate,
                endDate: b.endDate,
                venue: b.venue,
                cost: b.cost,
                sessions: b.sessions,
                learners: [],
            })),
        ]);
    };

    const batchOptions = [
        {
            value: "defined",
            title: "Batch with defined details",
            description: "Has a fixed date, venue and trainer assigned before learners are invited.",
        },
        {
            value: "nominations",
            title: "Nominations batch",
            description: "Lightweight — used mainly to gauge interest before details are finalised.",
        },
        {
            value: "import",
            title: "Import batches and sessions",
            description: "Bring in batches that already have dates, venues and trainers assigned.",
            link: "Download the template",
        },
    ];

    if (loading) return <InvitePanelSkeleton />;

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2, mb: 4, borderColor: "warning.main", bgcolor: "warning.lighter" }}>
                <Typography variant="body2">
                    There are no batches yet. Choose one of the options below to create the first — you can add
                    more once it exists.
                </Typography>
            </Paper>

            <RadioGroup name="batch-type" value={batchType} onChange={(e) => setBatchType(e.target.value)}>
                <Stack spacing={1} mb={1}>
                    {batchOptions.map((option) => (
                        <Paper
                            key={option.value}
                            variant="outlined"
                            onClick={() => setBatchType(option.value)}
                            sx={{
                                display: "flex",
                                gap: 1.5,
                                alignItems: "flex-start",
                                p: 2,
                                cursor: "pointer",
                                borderColor: batchType === option.value ? "primary.main" : "divider",
                            }}
                        >
                            <Radio checked={batchType === option.value} value={option.value} size="small" sx={{ mt: -0.25 }} />
                            <Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {option.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {option.description}
                                    {option.link && (
                                        <>
                                            {" — "}
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const link = document.createElement("a");
                                                    link.href = "/sample/sample_batch_import.xlsx";
                                                    link.download = "sample_batch_import.xlsx";
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                            >
                                                {option.link}
                                            </Button>
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            </RadioGroup>

            {importError && (
                <FormHelperText error sx={{ mb: 3 }}>
                    {importError}
                </FormHelperText>
            )}

            <Divider sx={{ mb: 3, mt: importError ? 0 : 3 }} />

            <Box display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    onClick={() => (batchType === "import" ? handleImportBatchClick() : setOpenBatchModal(true))}
                >
                    {batchType === "import" ? "Import XLSX" : "Create batch"}
                </Button>
            </Box>

            {batches.length > 0 && (
                <Box mt={4}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Batches
                    </Typography>
                    <Stack spacing={1}>
                        {batches.map((b) => (
                            <Paper key={b.id} variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="body2" fontWeight={600}>{b.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {b.startDate} — {b.endDate} · {b.sessions?.length || 0} session(s)
                                </Typography>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            )}

            <BatchModal
                batchType={batchType}
                openBatchModal={openBatchModal}
                setOpenBatchModal={setOpenBatchModal}
                mId={mId}
                token={token}
                users={users}
                canManage={canManage}
                onBatchSaved={(batch) => setBatches((prev) => [...prev, batch])}
            />

            <ImportBatchModal
                open={importBatchOpen}
                handleClose={() => setImportBatchOpen(false)}
                mId={mId}
                token={token}
                onImported={handleBatchesImported}
            />
        </Box>
    );
};

export default InvitePanel

