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


const ImportUserModal = ({
    open, handleClose, API_URL, mId, id, activityId, token,
    fetchActivities, users, setAllData
}) => {
    const { control, handleSubmit } = useForm();
    const [file, setFile] = useState(null);
    const [imageError, setImageError] = useState("");
    const [loading, setLoading] = useState(false);
    const [excelData, setExcelData] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [matchedUsers, setMatchedUsers] = useState([]);

    // Save uploaded data
    const handleDataSave = async () => {
        if (Object.keys(rowErrors)?.length > 0) {
            toast.error("Please fix the errors in the table before submitting.");

            return;
        }

        if (!file) {
            setImageError("Please upload a valid .xlsx file.");

            return;
        }

        setAllData(matchedUsers);

        // Close after state update
        setTimeout(() => {
            handleClose();
        }, 0);
    };

    const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
        const [value, setValue] = useState(initialValue);

        useEffect(() => { setValue(initialValue); }, [initialValue]);
        useEffect(() => {

            const timeout = setTimeout(() => { onChange(value); }, debounce);


            return () => clearTimeout(timeout);
        }, [value]);

        return <TextField size="small" {...props} value={value} onChange={e => setValue(e.target.value)} />;
    };

    const validateExcelHeaders = (headers) => {
        const requiredHeaders = ["sno", "empid/email"];

        for (let req of requiredHeaders) {
            if (!headers.includes(req.toLowerCase())) {
                throw new Error(`Missing required column: ${req}`);
            }
        }
    };

    const { getRootProps, getInputProps } = useDropzone({

        multiple: false,
        maxSize: 5 * 1024 * 1024, // 5MB
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

                const worksheet = workbook.worksheets[0]; // first sheet

                if (!worksheet) throw new Error("Excel file is empty.");

                // Read header row
                const headerRow = worksheet.getRow(1).values.slice(1).map(h => String(h || "").trim());
                const cleanHeaders = headerRow.map((h, idx) => h || `Column${idx + 1}`);

                // Validate headers
                validateExcelHeaders(cleanHeaders.map(h => h.toLowerCase()));

                // Read all rows starting from row 2
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
                const matchedUsersArray = [];

                rows.forEach((row, index) => {
                    const snoVal = String(row["Sno"] || "").trim();
                    const empVal = String(row["EmpId/Email"] || "").trim();

                    const snoFilled = snoVal !== "";
                    const empFilled = empVal !== "";

                    if (snoFilled !== empFilled) {

                        errors[index] = "Sno and EmpId/Email must both be filled or both be empty.";

                        return;
                    }

                    if (empFilled) {
                        const isEmail = empVal.includes("@");
                        let matchedUser = null;

                        if (isEmail) {
                            // NOTE: normalizeEmail/hash must come from your auth/user utils.
                            const norm = typeof normalizeEmail === "function" ? normalizeEmail(empVal) : empVal.toLowerCase();
                            const hashed = typeof hash === "function" ? hash(norm) : norm;

                            matchedUser = (users || []).find(user => user.email_hash === hashed || user.email?.toLowerCase() === norm);
                        } else {
                            matchedUser = (users || []).find(user =>
                                (user.codes || []).some(c => String(c.code).trim().toLowerCase() === empVal.trim().toLowerCase())
                            );
                        }

                        if (matchedUser) {
                            matchedUsersArray.push(matchedUser._id);
                        } else {
                            errors[index] = `${empVal} does not exist`;
                        }
                    }
                });

                setRowErrors(errors);
                setExcelData(rows);
                setFile(selectedFile);
                setImageError("");
                setMatchedUsers(matchedUsersArray);

            } catch (err) {
                console.error("Error processing Excel file:", err);
                setFile(null);
                setExcelData([]);
                setRowErrors({});
                setMatchedUsers([]);
                setImageError(err.message);
                toast.error(err.message);
            }
        },
        onDropRejected: (rejectedFiles) => {
            rejectedFiles.forEach(file => {
                file.errors.forEach(error => {
                    let msg = "";

                    switch (error.code) {
                        case "file-invalid-type":
                            msg = `Invalid file type. Only .xlsx files are allowed.`;
                            break;
                        case "file-too-large":
                            msg = `File is too large. Max allowed size is 5MB.`;
                            break;
                        case "too-many-files":
                            msg = `Only one file can be uploaded.`;
                            break;
                        default:
                            msg = `There was an issue with the uploaded file.`;
                    }

                    toast.error(msg);
                    setImageError(msg);
                });
            });
        }
    });

    const columns = useMemo(() => {
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
                        {key === "EmpId/Email" && (
                            <div>
                                {error && (
                                    <Typography variant="caption" color="error">
                                        {error}
                                    </Typography>
                                )}
                            </div>
                        )}
                    </div>
                );
            }
        }));
    }, [excelData, rowErrors]);

    const table = useReactTable({
        data: excelData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    useEffect(() => {
        if (open) {
            setFile(null);
            setImageError("");
            setExcelData([]);
            setRowErrors({});
            setMatchedUsers([]);
        }
    }, [open]);

    const TableImportComponent = () => (
        <Card className="mt-4" variant="outlined">
            <CardContent style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Typography>Show</Typography>
                    <TextField
                        select
                        size="small"
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                        sx={{ width: 90 }}
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={200}>200</MenuItem>
                    </TextField>
                </div>
                <DebouncedInput
                    value={table.getState().globalFilter ?? ""}
                    onChange={value => table.setGlobalFilter(String(value))}
                    placeholder="Search"
                />
            </CardContent>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e0e0e0" }}>
                                        <div
                                            style={{ display: "flex", alignItems: "center", cursor: header.column.getCanSort() ? "pointer" : "default" }}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() === "asc" && <i className="tabler-chevron-up" />}
                                            {header.column.getIsSorted() === "desc" && <i className="tabler-chevron-down" />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows?.length === 0 ? (
                            <tr>
                                <td colSpan={columns?.length} style={{ textAlign: "center", padding: 16 }}>No data available</td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );

    return (
        <Dialog open={open} fullWidth maxWidth="lg" sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}>
            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className="tabler-x" />
            </DialogCloseButton>
            <DialogTitle>Import User</DialogTitle>
            <form onSubmit={handleSubmit(handleDataSave)} noValidate>
                <DialogContent sx={{ maxHeight: "80vh", overflowY: "auto" }}>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }} item>
                            <Typography variant="body1" fontWeight={500} gutterBottom>
                                XLSX <span>*</span>
                                <Button variant="contained" href="/sample/import_user_sample.xlsx" sx={{ ml: 2 }}>
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

                                {imageError && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                        {imageError}
                                    </Typography>
                                )}
                            </div>
                        </Grid>
                    </Grid>

                    {excelData?.length > 0 && <TableImportComponent />}

                    <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 4 }}>
                        {excelData.length > 0 && Object.keys(rowErrors)?.length === 0 && (
                            <Button
                                onClick={handleSubmit(handleDataSave)}
                                variant="contained"
                                sx={{ height: 40 }}
                                disabled={loading}
                            >
                                {loading ? "Uploading..." : "Submit"}
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


export default ImportUserModal;
