import { useState, useMemo, useEffect } from "react";

import { useForm } from "react-hook-form";

import {
    Card,
    CardContent,
    Typography,
    TextField,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

import Grid from "@mui/material/Grid2"

import { useDropzone } from "react-dropzone";

import {
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";

const ImportBatchModal = ({ open, handleClose, mId, token, onImported }) => {
    const { handleSubmit } = useForm();
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [loading, setLoading] = useState(false);
    const [excelData, setExcelData] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [parsedBatches, setParsedBatches] = useState([]);

    useEffect(() => {
        if (open) {
            setFile(null);
            setFileError("");
            setExcelData([]);
            setRowErrors({});
            setParsedBatches([]);
        }
    }, [open]);

    const validateHeaders = (headers) => {
        const required = ["batchname", "startdate", "enddate", "sessiondate", "sessionstart", "sessionend"];

        for (const req of required) {
            if (!headers.includes(req)) {
                throw new Error(`Missing required column: ${req}`);
            }
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        maxSize: 5 * 1024 * 1024,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
        },
        onDrop: async (acceptedFiles) => {
            if (!acceptedFiles?.length) return;

            const selectedFile = acceptedFiles[0];

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const workbook = new ExcelJS.Workbook();

                await workbook.xlsx.load(arrayBuffer);

                const worksheet = workbook.worksheets[0];

                if (!worksheet) throw new Error("Excel file is empty.");

                const headerRow = worksheet.getRow(1).values.slice(1).map(h => String(h || "").trim());
                const cleanHeaders = headerRow.map((h, idx) => h || `Column${idx + 1}`);

                validateHeaders(cleanHeaders.map(h => h.toLowerCase().replace(/\s+/g, "")));

                const rows = [];

                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber === 1) return;

                    const rowValues = row.values.slice(1);
                    const rowData = {};

                    cleanHeaders.forEach((header, idx) => {
                        rowData[header] = rowValues[idx] ?? "";
                    });
                    rows.push(rowData);
                });

                const errors = {};
                const batchMap = new Map(); // batchName -> batch shell

                rows.forEach((row, index) => {
                    const batchName = String(row["BatchName"] || "").trim();
                    const startDate = String(row["StartDate"] || "").trim();
                    const endDate = String(row["EndDate"] || "").trim();
                    const sessionDate = String(row["SessionDate"] || "").trim();
                    const sessionStart = String(row["SessionStart"] || "").trim();
                    const sessionEnd = String(row["SessionEnd"] || "").trim();
                    const venue = String(row["Venue"] || "").trim();
                    const cost = String(row["Cost"] || "0").trim();
                    const trainerEmail = String(row["TrainerEmail"] || "").trim();

                    if (!batchName || !startDate || !endDate || !sessionDate || !sessionStart || !sessionEnd) {
                        errors[index] = "BatchName, StartDate, EndDate, SessionDate, SessionStart and SessionEnd are required.";
                        return;
                    }

                    if (new Date(sessionDate) < new Date(startDate) || new Date(sessionDate) > new Date(endDate)) {
                        errors[index] = "Session date must fall within the batch's start/end dates.";
                        return;
                    }

                    if (sessionEnd <= sessionStart) {
                        errors[index] = "Session end time must be after start time.";
                        return;
                    }

                    if (!batchMap.has(batchName)) {
                        batchMap.set(batchName, {
                            name: batchName,
                            startDate,
                            endDate,
                            venue,
                            cost,
                            sessions: [],
                        });
                    }

                    batchMap.get(batchName).sessions.push({
                        id: Date.now() + Math.random(),
                        date: sessionDate,
                        startTime: sessionStart,
                        endTime: sessionEnd,
                        venue,
                        trainerEmail,
                        errors: {},
                    });
                });

                setRowErrors(errors);
                setExcelData(rows);
                setParsedBatches(Array.from(batchMap.values()));
                setFile(selectedFile);
                setFileError("");
            } catch (err) {
                console.error("Error processing batch import file:", err);
                setFile(null);
                setExcelData([]);
                setRowErrors({});
                setParsedBatches([]);
                setFileError(err.message);
                toast.error(err.message);
            }
        },
        onDropRejected: (rejectedFiles) => {
            rejectedFiles.forEach(file => {
                file.errors.forEach(error => {
                    let msg = "";

                    switch (error.code) {
                        case "file-invalid-type":
                            msg = "Invalid file type. Only .xlsx files are allowed.";
                            break;
                        case "file-too-large":
                            msg = "File is too large. Max allowed size is 5MB.";
                            break;
                        case "too-many-files":
                            msg = "Only one file can be uploaded.";
                            break;
                        default:
                            msg = "There was an issue with the uploaded file.";
                    }

                    toast.error(msg);
                    setFileError(msg);
                });
            });
        }
    });

    const handleImportSubmit = async () => {
        if (Object.keys(rowErrors).length > 0) {
            toast.error("Please fix the errors in the file before submitting.");
            return;
        }

        if (!file || parsedBatches.length === 0) {
            setFileError("Please upload a valid .xlsx file.");
            return;
        }

        setLoading(true);

        try {
            // Hand grouped batches back to the caller (InvitePanel), which
            // is responsible for actually persisting them via the API and
            // updating the batch list state.
            await onImported(parsedBatches);

            toast.success(`${parsedBatches.length} batch(es) imported successfully`, { autoClose: 1500 });
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error("Could not import batches. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const previewColumns = useMemo(() => {
        if (!excelData?.length) return [];

        return Object.keys(excelData[0]).map(key => ({
            header: key,
            accessorKey: key,
            cell: ({ row, getValue }) => {
                const value = getValue();
                const error = rowErrors[row.index];

                return (
                    <div>
                        {value}
                        {key === "BatchName" && error && (
                            <div>
                                <Typography variant="caption" color="error">
                                    {error}
                                </Typography>
                            </div>
                        )}
                    </div>
                );
            }
        }));
    }, [excelData, rowErrors]);

    const table = useReactTable({
        data: excelData,
        columns: previewColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    return (
        <Dialog open={open} fullWidth maxWidth="lg" sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}>
            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className="tabler-x" />
            </DialogCloseButton>
            <DialogTitle>Import Batches &amp; Sessions</DialogTitle>
            <form onSubmit={handleSubmit(handleImportSubmit)} noValidate>
                <DialogContent sx={{ maxHeight: "80vh", overflowY: "auto" }}>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }} item>
                            <Typography variant="body1" fontWeight={500} gutterBottom>
                                XLSX <span>*</span>
                                <Button variant="contained" href="/sample/sample_batch_import.xlsx" sx={{ ml: 2 }}>
                                    Download sample file
                                </Button>
                            </Typography>
                            <div
                                {...getRootProps()}
                                style={{
                                    minHeight: "150px",
                                    border: "2px dashed #ccc",
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "1rem"
                                }}
                            >
                                <input {...getInputProps()} />
                                <Avatar variant="rounded" sx={{ bgcolor: "#f5f5f5", width: 48, height: 48 }}>
                                    <i className="tabler-upload" />
                                </Avatar>
                                <Typography variant="body2">Allowed: *.xlsx, Max 5MB</Typography>

                                {file && (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                                        <Avatar variant="rounded" sx={{ bgcolor: "#f5f5f5", color: "#0A2E73", width: 48, height: 48 }}>
                                            <i className="tabler-file" />
                                        </Avatar>
                                        <Typography variant="body2" fontWeight={500}>{file.name}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                    </div>
                                )}

                                {fileError && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                        {fileError}
                                    </Typography>
                                )}
                            </div>
                        </Grid>
                    </Grid>

                    {excelData?.length > 0 && (
                        <Card className="mt-4" variant="outlined" sx={{ mt: 4 }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                    {parsedBatches.length} batch(es) detected from {excelData.length} row(s)
                                </Typography>
                            </CardContent>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <th key={header.id} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e0e0e0" }}>
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody>
                                        {table.getRowModel().rows.map(row => (
                                            <tr key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 4 }}>
                        {excelData.length > 0 && Object.keys(rowErrors).length === 0 && (
                            <Button
                                onClick={handleSubmit(handleImportSubmit)}
                                variant="contained"
                                sx={{ height: 40 }}
                                disabled={loading}
                            >
                                {loading ? "Importing..." : `Import ${parsedBatches.length} Batch(es)`}
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                                setFile(null);
                                setExcelData([]);
                                setRowErrors({});
                                setParsedBatches([]);
                                handleClose();
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default ImportBatchModal
