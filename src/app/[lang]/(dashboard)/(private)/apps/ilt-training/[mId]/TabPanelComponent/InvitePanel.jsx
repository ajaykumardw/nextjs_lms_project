import { useState } from "react";

import {
    Box,
    Divider,
    Paper,
    RadioGroup,
    Stack,
    Typography,
    FormHelperText,
    Radio,
    Button,
} from "@mui/material";

import InvitePanelSkeleton from "../SkeletonComponent/InvitePanelSkeleton";
import BatchModal from "../ModalComponent/BatchModal";
import ImportBatchModal from "../ModalComponent/ImportBatchModal";

const batchOptions = [
    {
        value: "defined",
        title: "Batch with defined details",
        description:
            "Has a fixed date, venue and trainer assigned before learners are invited.",
    },
    {
        value: "nominations",
        title: "Nominations batch",
        description:
            "Lightweight — used mainly to gauge interest before details are finalised.",
    },
    {
        value: "import",
        title: "Import batches and sessions",
        description:
            "Bring in batches that already have dates, venues and trainers assigned.",
        link: "Download the template",
    },
];

const InvitePanel = ({
    loading,
    mId,
    finalData,
    handleFetchData,
    token,
    setValue,
    users = [],
    canManage = true,
}) => {
    const [batchType, setBatchType] =
        useState("nominations");

    const [openBatchModal, setOpenBatchModal] =
        useState(false);

    const [editingBatch, setEditingBatch] =
        useState(null);

    const [importError, setImportError] =
        useState("");

    const [importBatchOpen, setImportBatchOpen] =
        useState(false);

    const [batches, setBatches] =
        useState([]);

    /*
     * ----------------------------------------------------
     * CREATE BATCH
     * ----------------------------------------------------
     */

    const handleCreateBatch = () => {
        setEditingBatch(null);
        setOpenBatchModal(true);
    };

    /*
     * ----------------------------------------------------
     * EDIT BATCH
     * ----------------------------------------------------
     */

    const handleEditBatch = (batch) => {
        setEditingBatch(batch);

        setBatchType(
            batch?.type === "defined"
                ? "defined"
                : "nominations"
        );

        setOpenBatchModal(true);
    };

    /*
     * ----------------------------------------------------
     * CLOSE MODAL
     * ----------------------------------------------------
     */

    const handleCloseBatchModal = () => {
        setOpenBatchModal(false);
        setEditingBatch(null);
    };

    /*
     * ----------------------------------------------------
     * IMPORT
     * ----------------------------------------------------
     */

    const handleImportBatchClick = () => {
        setImportError("");
        setImportBatchOpen(true);
    };

    const handleBatchesImported = async (
        parsedBatches
    ) => {
        setBatches((prev) => [
            ...prev,
            ...parsedBatches.map((b) => ({
                id:
                    Date.now() +
                    Math.random(),

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

    /*
     * ----------------------------------------------------
     * AFTER BATCH SAVE
     * ----------------------------------------------------
     */

    const handleBatchSaved = (savedBatch) => {
        /*
         * If this was an edit, replace the existing batch.
         */
        if (editingBatch?._id) {
            setBatches((prev) =>
                prev.map((batch) =>
                    String(
                        batch?._id ||
                        batch?.id
                    ) ===
                        String(
                            savedBatch?._id ||
                            savedBatch?.id
                        )
                        ? savedBatch
                        : batch
                )
            );
        } else {
            /*
             * New batch
             */
            setBatches((prev) => [
                ...prev,
                savedBatch,
            ]);
        }

        setOpenBatchModal(false);
        setEditingBatch(null);
    };

    if (loading) {
        return <InvitePanelSkeleton />;
    }

    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 4,
                    borderColor:
                        "warning.main",
                    bgcolor:
                        "warning.lighter",
                }}
            >
                <Typography variant="body2">
                    There are no batches yet.
                    Choose one of the options
                    below to create the first —
                    you can add more once it
                    exists.
                </Typography>
            </Paper>

            <RadioGroup
                name="batch-type"
                value={batchType}
                onChange={(e) =>
                    setBatchType(
                        e.target.value
                    )
                }
            >
                <Stack spacing={1} mb={1}>
                    {batchOptions.map(
                        (option) => (
                            <Paper
                                key={
                                    option.value
                                }
                                variant="outlined"
                                onClick={() =>
                                    setBatchType(
                                        option.value
                                    )
                                }
                                sx={{
                                    display:
                                        "flex",
                                    gap: 1.5,
                                    alignItems:
                                        "flex-start",
                                    p: 2,
                                    cursor:
                                        "pointer",
                                    borderColor:
                                        batchType ===
                                            option.value
                                            ? "primary.main"
                                            : "divider",
                                }}
                            >
                                <Radio
                                    checked={
                                        batchType ===
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                    size="small"
                                    sx={{
                                        mt: -0.25,
                                    }}
                                />

                                <Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={
                                            600
                                        }
                                    >
                                        {
                                            option.title
                                        }
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {
                                            option.description
                                        }

                                        {option.link && (
                                            <>
                                                {" — "}

                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={(
                                                        e
                                                    ) => {
                                                        e.stopPropagation();

                                                        const link =
                                                            document.createElement(
                                                                "a"
                                                            );

                                                        link.href =
                                                            "/sample/sample_batch_import.xlsx";

                                                        link.download =
                                                            "sample_batch_import.xlsx";

                                                        document.body.appendChild(
                                                            link
                                                        );

                                                        link.click();

                                                        document.body.removeChild(
                                                            link
                                                        );
                                                    }}
                                                >
                                                    {
                                                        option.link
                                                    }
                                                </Button>
                                            </>
                                        )}
                                    </Typography>
                                </Box>
                            </Paper>
                        )
                    )}
                </Stack>
            </RadioGroup>

            {importError && (
                <FormHelperText
                    error
                    sx={{ mb: 3 }}
                >
                    {importError}
                </FormHelperText>
            )}

            <Divider
                sx={{
                    mb: 3,
                    mt: importError
                        ? 0
                        : 3,
                }}
            />

            <Box
                display="flex"
                justifyContent="flex-end"
            >
                <Button
                    variant="contained"
                    onClick={() =>
                        batchType ===
                            "import"
                            ? handleImportBatchClick()
                            : handleCreateBatch()
                    }
                >
                    {batchType === "import"
                        ? "Import XLSX"
                        : "Create batch"}
                </Button>
            </Box>

            {finalData?.batch?.length >
                0 && (
                    <Box mt={4}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            gutterBottom
                        >
                            Batches
                        </Typography>

                        <Stack spacing={1}>
                            {finalData.batch.map(
                                (b) => (
                                    <Paper
                                        key={
                                            b?._id
                                        }
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                        }}
                                    >
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            gap={2}
                                        >
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={
                                                        600
                                                    }
                                                >
                                                    {b?.name}{" "}
                                                    (
                                                    {b?.type ===
                                                        "defined"
                                                        ? "Defined type"
                                                        : "Nominated type"}
                                                    )
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {b?.start_date
                                                        ? new Date(
                                                            b.start_date
                                                        )
                                                            .toLocaleDateString(
                                                                "en-GB"
                                                            )
                                                            .replace(
                                                                /\//g,
                                                                "-"
                                                            )
                                                        : "-"}{" "}
                                                    —{" "}
                                                    {b?.end_date
                                                        ? new Date(
                                                            b.end_date
                                                        )
                                                            .toLocaleDateString(
                                                                "en-GB"
                                                            )
                                                            .replace(
                                                                /\//g,
                                                                "-"
                                                            )
                                                        : "-"}{" "}
                                                    ·{" "}
                                                    {b?.sessions
                                                        ?.length ||
                                                        0}{" "}
                                                    session(s)
                                                </Typography>
                                            </Box>

                                            {canManage && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() =>
                                                        handleEditBatch(
                                                            b
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                        </Box>
                                    </Paper>
                                )
                            )}
                        </Stack>
                    </Box>
                )}

            <BatchModal
                batchType={batchType}
                openBatchModal={
                    openBatchModal
                }
                handleFetchData={handleFetchData}
                setValue={setValue}
                setOpenBatchModal={
                    handleCloseBatchModal
                }
                mId={mId}
                token={token}
                users={users}
                finalData={finalData}
                canManage={canManage}
                editingBatch={
                    editingBatch
                }
                onBatchSaved={
                    handleBatchSaved
                }
            />

            <ImportBatchModal
                open={importBatchOpen}
                handleClose={() => setImportBatchOpen(false)}
                mId={mId}
                setValue={setValue}
                handleFetchData={handleFetchData}
                token={token}
                finalData={finalData}
                onImported={handleBatchesImported}
            />
        </Box>
    );
};

export default InvitePanel;
