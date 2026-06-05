'use client';

import crypto from "crypto";

import { useState, useEffect, useMemo } from 'react';

import { useRouter, useParams } from "next/navigation"

import { useSession } from "next-auth/react";

import classnames from 'classnames'

import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Skeleton,
    Avatar,
    Card,
    Paper,
    CardContent,
    Checkbox,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import Grid from '@mui/material/Grid2';

import { useDropzone } from 'react-dropzone'

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'

import { useForm, Controller, set } from 'react-hook-form'

import ExcelJS from "exceljs";

import { toast } from "react-toastify";

import tableStyles from '@core/styles/table.module.css'

import TablePaginationComponent from '@components/TablePaginationComponent'

import CustomTextField from "@/@core/components/mui/TextField"

const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''

const MAX_PAIRS = 5;

const formatDateTimeLocal = (date) => {
    if (!date) return "";

    const d = new Date(date);

    return new Date(
        d.getTime() - d.getTimezoneOffset() * 60000
    )
        .toISOString()
        .slice(0, 16);
};

const normalizeOptions = (val) => {

    if (!val) return [];

    if (Array.isArray(val)) return val.map((v) => String(v));

    return [String(val)];
};

function normalizeEmail(email) {

    return email.trim().toLowerCase();
}

function hash(text) {

    return crypto.createHash("sha256").update(text).digest("hex");
}

const getCellValue = value => {

    if (value === null || value === undefined) return "";

    if (typeof value === "object") {
        if ("text" in value) return String(value.text || "");
        if ("result" in value) return String(value.result || "");

        return "";
    }

    return String(value);
};

const ImportUserModal = ({
    open,
    handleClose,
    users,
    onImportComplete
}) => {

    const { handleSubmit } = useForm();

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

        onImportComplete?.(matchedUsers);

        handleClose();

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

        return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />;
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

        onDrop: async acceptedFiles => {
            if (!acceptedFiles?.length) return;

            const selectedFile = acceptedFiles[0];

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();

                const workbook = new ExcelJS.Workbook();

                await workbook.xlsx.load(arrayBuffer);

                const worksheet = workbook.worksheets[0];

                if (!worksheet) {
                    throw new Error("Excel file is empty.");
                }

                const headerRow = worksheet
                    .getRow(1)
                    .values.slice(1)
                    .map(h => getCellValue(h).trim());

                const cleanHeaders = headerRow.map(
                    (h, idx) => h || `Column${idx + 1}`
                );

                validateExcelHeaders(
                    cleanHeaders.map(h => h.toLowerCase())
                );

                const rows = [];

                worksheet.eachRow(
                    { includeEmpty: false },
                    (row, rowNumber) => {
                        if (rowNumber === 1) return;

                        const rowValues = row.values.slice(1);

                        const rowData = {};

                        cleanHeaders.forEach((header, idx) => {
                            rowData[header] = getCellValue(
                                rowValues[idx]
                            ).trim();
                        });

                        rows.push(rowData);
                    }
                );

                const errors = {};
                const matchedUsersArray = [];

                rows.forEach((row, index) => {
                    const snoVal = getCellValue(
                        row["Sno"]
                    ).trim();

                    const empVal = getCellValue(
                        row["EmpId/Email"]
                    ).trim();

                    const snoFilled = snoVal !== "";
                    const empFilled = empVal !== "";

                    if (snoFilled !== empFilled) {
                        errors[index] =
                            "Sno and EmpId/Email must both be filled or both be empty.";

                        return;
                    }

                    if (empFilled) {
                        const isEmail = empVal.includes("@");

                        let matchedUser = null;

                        if (isEmail) {
                            const norm = normalizeEmail(empVal);
                            const hashed = hash(norm);

                            matchedUser = users?.find(
                                user => user.email_hash === hashed
                            );
                        } else {
                            matchedUser = users?.find(user =>
                                user.codes?.some(
                                    c =>
                                        String(c.code)
                                            .trim()
                                            .toLowerCase() ===
                                        empVal
                                            .trim()
                                            .toLowerCase()
                                )
                            );
                        }

                        if (matchedUser) {
                            matchedUsersArray.push(
                                matchedUser._id
                            );
                        } else {
                            errors[index] =
                                `${empVal} does not exist`;
                        }
                    }
                });

                setRowErrors(errors);
                setExcelData(rows);
                setFile(selectedFile);
                setImageError("");
                setMatchedUsers(matchedUsersArray);
            } catch (err) {
                console.error(err);

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
                const error = rowErrors[row.index];

                const value = getCellValue(getValue());

                return (
                    <div>
                        {value}

                        {key === "EmpId/Email" &&
                            error && (
                                <Typography
                                    variant="caption"
                                    color="error"
                                    display="block"
                                >
                                    {error}
                                </Typography>
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

    const TableImportComponent = () => (
        <Card className="mt-4">
            <CardContent className="flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <Typography>Show</Typography>
                    <CustomTextField
                        select
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                        className="max-sm:is-full sm:is-[70px]"
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={200}>200</MenuItem>
                    </CustomTextField>
                </div>
                <DebouncedInput
                    value={table.getState().globalFilter ?? ""}
                    className="max-sm:is-full min-is-[250px]"
                    onChange={value => table.setGlobalFilter(String(value))}
                    placeholder="Search"
                />
            </CardContent>
            <div className="overflow-x-auto">
                <table className={tableStyles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        <div
                                            className={classnames({
                                                "flex items-center": true,
                                                "cursor-pointer": header.column.getCanSort()
                                            })}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() === "asc" && <i className="tabler-chevron-up text-xl" />}
                                            {header.column.getIsSorted() === "desc" && <i className="tabler-chevron-down text-xl" />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows?.length === 0 ? (
                            <tr>
                                <td colSpan={columns?.length} className="text-center">No data available</td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <TablePaginationComponent table={table} />
        </Card>
    );

    return (
        <Dialog open={open} fullWidth maxWidth="lg" sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}>
            <DialogTitle>Import User</DialogTitle>
            <form onSubmit={handleSubmit(handleDataSave)} noValidate>
                <DialogContent sx={{ maxHeight: "80vh", overflowY: "auto" }}>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }} item>
                            <Typography variant="body1" fontWeight={500} gutterBottom>
                                XLSX <span style={{ color: "red" }}>*</span>
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
                                    <Typography variant="caption" color="var(--mui-palette-error-main)" sx={{ mt: 1 }}>
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

const ContestBadgeCreatePage = ({
    id, isEdit = false
}) => {


    const minDateTime = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
    )
        .toISOString()
        .slice(0, 16);

    const router = useRouter();

    const { lang: lang } = useParams();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const { data: session } = useSession();
    const token = session?.user?.token;


    const [selectedPairIndex, setSelectedPairIndex] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const [loading, setLoading] = useState(true);

    const [isLoading, setIsLoading] = useState(true)

    const [currentStatus, setCurrentStatus] = useState("0")

    const [selectedBadges, setSelectedBadges] = useState([]);

    const [targetOptionPairs, setTargetOptionPairs] = useState([
        { target: "", options: [], secondOptions: [] },
    ]);

    const [createData, setCreateData] = useState({
        designation: [],
        department: [],
        group: [],
        region: [],
        user: [],
        badges: [],
    });

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
        setError,
        clearErrors
    } = useForm({
        defaultValues: {
            contest_name: "",
            start_date: "",
            end_date: "",
            badges: [],
            status: "0"
        }
    });

    const handleClose = () => {
        setIsOpen(false);
        setSelectedPairIndex(null);
    };

    const handleFirstChange = (index, value) => {
        clearErrors("targetOption");

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

    const handleSecondChange = (index, value) => {
        const normalized = normalizeOptions(value);

        setTargetOptionPairs((prev) => {
            const updated = prev.map((p) => ({ ...p }));

            updated[index].options = normalized;

            return updated;
        });

        if (normalized.length > 0) {
            clearErrors("targetOption");
        }
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

    const fetchContestBadgeData = async () => {

        setLoading(true)

        try {

            const response = await fetch(`${API_URL}/company/contest/badges/create`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await response.json();

            if (response.ok) {

                const value = result?.data;

                setCreateData(value)
                setLoading(false)

            }

        } catch (error) {

            throw new Error(error)

        } finally {

            setLoading(false)
        }

    }

    useEffect(() => {

        if (API_URL && token) {

            fetchContestBadgeData();
        }

    }, [API_URL, token])

    const handleImportedUsers = (userIds) => {
        if (selectedPairIndex === null) return;

        setTargetOptionPairs(prev => {
            const updated = [...prev];

            updated[selectedPairIndex] = {
                ...updated[selectedPairIndex],
                options: [...new Set(userIds)]
            };

            return updated;
        });

        setIsOpen(false);
        setSelectedPairIndex(null);
    };

    const handleImportUser = (index) => {
        setSelectedPairIndex(index);
        setIsOpen(true);
    };

    useEffect(() => {
        const validTarget = targetOptionPairs.some(
            item =>
                item.target &&
                Array.isArray(item.options) &&
                item.options.length > 0
        );

        if (validTarget) {
            clearErrors("targetOption");
        }
    }, [targetOptionPairs, clearErrors]);

    const onSubmit = async (data) => {
        let hasError = false;

        // Validate target + option
        const validTarget = targetOptionPairs.some(
            item =>
                item.target &&
                item.options &&
                item.options.length > 0
        );

        if (!validTarget) {
            setError("targetOption", {
                type: "manual",
                message: "Please select at least one module target and option"
            });

            hasError = true;
        } else {
            clearErrors("targetOption");
        }


        // Validate badge
        if (!selectedBadges.length) {
            setError("badges", {
                type: "manual",
                message: "Please select at least one badge"
            });

            hasError = true;
        }

        if (hasError) return;

        const payload = {
            ...data,
            targetOptionPairs,
            badges: selectedBadges
        };

        try {

            const response = await fetch(isEdit ? `${API_URL}/company/contest/badge/update/${id}` : `${API_URL}/company/contest/badge/create`, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(payload)
            })

            if (response.ok) {

                toast.success("Contest & badge saved successfully", {
                    autoClose: 1000
                })

                router.push(`/${lang}/apps/admin/contest-badges`)

            }

        } catch (error) {

            throw new Error(error)

        }

    };

    const fetchEditData = async () => {
        try {

            setIsLoading(true)

            const response = await fetch(`${API_URL}/company/contest/badge/edit/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const result = await response.json()

            if (response.ok) {

                const value = result?.data;

                if (value?.status === "1") {
                    
                    router.push(`/${lang}/apps/admin/contest-badges`);
                    
                    return;
                }

                reset({
                    contest_name: value?.contest_name,
                    start_date: formatDateTimeLocal(value?.start_date),
                    end_date: formatDateTimeLocal(value?.end_date),
                    badges: value?.badge_id
                });

                setCurrentStatus(value?.status)

                setTargetOptionPairs(value?.target_pair)

                setSelectedBadges(value?.badge_id)


            }

        } catch (error) {

            console.log("Error", error)
        } finally {

            setIsLoading(false)
        }
    }

    useEffect(() => {

        if (API_URL && token && isEdit && id) {

            fetchEditData()
        }

    }, [API_URL, token, isEdit, id])

    if (loading || (isEdit && isLoading)) {

        return (

            <Box p={1}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                    }}
                >
                    <Grid container spacing={4}>
                        {/* Header */}
                        <Grid size={12}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Skeleton
                                    variant="rounded"
                                    width={40}
                                    height={40}
                                />

                                <Box>
                                    <Skeleton
                                        variant="text"
                                        width={220}
                                        height={40}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width={350}
                                        height={24}
                                    />
                                </Box>
                            </Stack>
                        </Grid>

                        {/* Dates */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Skeleton variant="text" width={100} height={24} />
                            <Skeleton
                                variant="rounded"
                                width="100%"
                                height={56}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <Skeleton variant="text" width={100} height={24} />
                            <Skeleton
                                variant="rounded"
                                width="100%"
                                height={56}
                            />
                        </Grid>

                        {/* Target Audience */}
                        <Grid size={12}>
                            <Skeleton
                                variant="text"
                                width={280}
                                height={35}
                                sx={{ mb: 2 }}
                            />

                            {[1, 2].map((item) => (
                                <Grid
                                    container
                                    spacing={2}
                                    alignItems="center"
                                    mb={3}
                                    key={item}
                                >
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Skeleton
                                            variant="rounded"
                                            width="100%"
                                            height={40}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Skeleton
                                            variant="rounded"
                                            width="100%"
                                            height={40}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 1 }}>
                                        <Skeleton
                                            variant="circular"
                                            width={40}
                                            height={40}
                                        />
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Event Badges Header */}
                        <Grid size={12}>
                            <Skeleton
                                variant="text"
                                width={180}
                                height={35}
                            />
                            <Skeleton
                                variant="text"
                                width={300}
                                height={24}
                            />
                        </Grid>

                        {/* Badge Cards */}
                        {[1, 2, 3, 4].map((item) => (
                            <Grid
                                key={item}
                                size={{ xs: 12, lg: 6 }}
                            >
                                <Card
                                    variant="outlined"
                                    sx={{ borderRadius: 3 }}
                                >
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <Skeleton
                                                    variant="rounded"
                                                    width={24}
                                                    height={24}
                                                />
                                                <Skeleton
                                                    variant="text"
                                                    width={180}
                                                    height={30}
                                                />
                                            </Stack>

                                            <Grid
                                                container
                                                spacing={2}
                                                alignItems="center"
                                            >
                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        sm: 3,
                                                    }}
                                                >
                                                    <Skeleton
                                                        variant="circular"
                                                        width={90}
                                                        height={90}
                                                        sx={{ mx: "auto" }}
                                                    />
                                                </Grid>

                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        sm: 9,
                                                    }}
                                                >
                                                    <Skeleton
                                                        variant="text"
                                                        width="80%"
                                                        height={30}
                                                    />
                                                    <Skeleton
                                                        variant="text"
                                                        width="100%"
                                                        height={24}
                                                    />
                                                    <Skeleton
                                                        variant="text"
                                                        width="70%"
                                                        height={24}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}

                        {/* Footer */}
                        <Grid size={12}>
                            <Stack
                                direction="row"
                                spacing={2}
                                justifyContent="center"
                            >
                                <Skeleton
                                    variant="rounded"
                                    width={140}
                                    height={45}
                                />
                                <Skeleton
                                    variant="rounded"
                                    width={180}
                                    height={45}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        );
    }

    return (

        <Box p={1}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    bgcolor: "background.paper",
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)} noValidate>

                    <Grid container spacing={4}>

                        {/* Header */}
                        <Grid size={12}>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                mb={1}
                            >
                                <IconButton
                                    onClick={() => router.push(`/${lang}/apps/admin/contest-badges`)}
                                    sx={{
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 2,
                                    }}
                                >
                                    <i className="tabler-arrow-left" />
                                </IconButton>

                                <Box>
                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        Create Contest
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Configure contest settings and select event badges.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack spacing={1}>
                                <Typography variant="body2" fontWeight={600}>
                                    Contest Name<span style={{ color: "red" }}>*</span>
                                </Typography>

                                <TextField
                                    fullWidth
                                    disabled={isEdit}
                                    placeholder="Enter contest name"
                                    {...register("contest_name", {
                                        required: "Contest name is required",
                                        maxLength: {
                                            value: 200,
                                            message: "Contest name cannot exceed 200 characters"
                                        }
                                    })}
                                    error={!!errors.contest_name}
                                    helperText={errors.contest_name?.message}
                                />
                            </Stack>
                        </Grid>

                        {/* Start Date */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Stack spacing={1}>
                                <Typography variant="body2" fontWeight={600}>
                                    Start Date<span style={{ color: "red" }}>*</span>
                                </Typography>

                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    disabled={isEdit}
                                    inputProps={{
                                        min: minDateTime
                                    }}
                                    {...register("start_date", {
                                        required: "Start date is required",
                                        validate: (value) => {
                                            const endDate = watch("end_date");

                                            if (endDate && new Date(value) >= new Date(endDate)) {
                                                return "Start time must be before end time";
                                            }

                                            return true;
                                        }
                                    })}
                                    error={!!errors.start_date}
                                    helperText={errors.start_date?.message}
                                />
                            </Stack>
                        </Grid>

                        {/* End Date */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Stack spacing={1}>
                                <Typography variant="body2" fontWeight={600}>
                                    End Date<span style={{ color: "red" }}>*</span>
                                </Typography>

                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    disabled={isEdit}
                                    inputProps={{
                                        min: watch("start_date") || minDateTime
                                    }}
                                    {...register("end_date", {
                                        required: "End date is required",
                                        validate: (value) => {
                                            const startDate = watch("start_date");

                                            if (startDate && new Date(value) <= new Date(startDate)) {
                                                return "End time must be after start time";
                                            }

                                            return true;
                                        }
                                    })}
                                    error={!!errors.end_date}
                                    helperText={errors.end_date?.message}
                                />
                            </Stack>
                        </Grid>

                        {/* Target Audience */}
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom>
                                This Module Is Targeted At<span style={{ color: "red" }}>*</span>
                            </Typography>
                            {targetOptionPairs.map((pair, idx) => (
                                <Grid container spacing={2} alignItems="center" mb={3} key={idx}>
                                    <Grid item size={{ xs: 12, md: 3 }}>
                                        <TextField
                                            select
                                            disabled={isEdit}
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
                                            disabled={isEdit}
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
                                                disabled={isEdit}
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
                                                disabled={isEdit ? isEdit : targetOptionPairs?.length >= MAX_PAIRS}
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
                            {errors.targetOption && (
                                <Typography
                                    color="var(--mui-palette-error-main)"
                                    variant="body2"
                                    sx={{ mt: 1 }}
                                >
                                    {errors.targetOption.message}
                                </Typography>
                            )}
                        </Grid>

                        {/* Event Badges Section */}
                        <Grid size={12}>
                            <Box
                                sx={{
                                    borderTop: "1px solid",
                                    borderColor: "divider",
                                    pt: 3,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Event Badges<span style={{ color: "red" }}>*</span>
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Select badges available for this contest.
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Badge Cards */}
                        {createData?.badges.map((badge, index) => (
                            <Grid
                                key={index}
                                size={{ xs: 12, lg: 6 }}
                            >
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        borderRadius: 3,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            boxShadow: 3,
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <FormControlLabel
                                                sx={{ m: 0 }}
                                                control={
                                                    <Checkbox
                                                        disabled={isEdit}
                                                        checked={selectedBadges.includes(badge._id)}
                                                        onChange={(e) => {
                                                            let updated = [...selectedBadges];

                                                            if (e.target.checked) {
                                                                updated.push(badge._id);
                                                            } else {
                                                                updated = updated.filter(
                                                                    id => id !== badge._id
                                                                );
                                                            }

                                                            setSelectedBadges(updated);

                                                            if (updated.length > 0) {
                                                                clearErrors("badges");
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {badge.title}
                                                    </Typography>
                                                }
                                            />

                                            <Grid
                                                container
                                                spacing={2}
                                                alignItems="center"
                                            >
                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        sm: 3,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 90,
                                                            height: 90,
                                                            borderRadius: "50%",
                                                            bgcolor: "grey.100",
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            mx: "auto",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={`${assert_url}/badges/${badge?.logo_url}`}
                                                            alt={badge?.title}
                                                            sx={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover", // use "contain" if you want the full logo visible
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>

                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        sm: 9,
                                                    }}
                                                >
                                                    <Stack spacing={1}>

                                                        <Typography variant="body2">
                                                            <strong>
                                                                Winners:
                                                            </strong>{" "}
                                                            {
                                                                badge.winner
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            <strong>
                                                                Criteria:
                                                            </strong>{" "}
                                                            {
                                                                badge.criteria
                                                            }
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        <Grid size={12}>

                            {errors.badges && (
                                <Typography
                                    color="var(--mui-palette-error-main)"
                                    variant="body2"
                                    sx={{ mt: 1 }}
                                >
                                    {errors.badges.message}
                                </Typography>
                            )}
                        </Grid>
                        {/* Footer */}
                        <Grid size={12}>
                            <Box
                                sx={{
                                    borderTop: "1px solid",
                                    borderColor: "divider",
                                    pt: 3,
                                    mt: 2,
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    justifyContent="center"
                                >
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        disabled={isEdit}
                                        onClick={() => setValue("status", "0")}
                                        type="submit"
                                    >
                                        Save Draft
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={currentStatus == "1"}
                                        size="large"
                                        onClick={() => setValue("status", "1")}
                                    >
                                        Publish Contest
                                    </Button>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
            <ImportUserModal
                open={isOpen}
                handleClose={handleClose}
                users={createData?.user}
                onImportComplete={handleImportedUsers}
            />
        </Box>
    );
};

export default ContestBadgeCreatePage;
