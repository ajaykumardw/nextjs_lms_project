"use client";

import { useState, useMemo, useEffect } from "react";

import { useForm } from "react-hook-form";

import {
    Card,
    CardContent,
    Typography,
    TextField,
    Avatar,
    Button,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { useDropzone } from "react-dropzone";

import ExcelJS from "exceljs";

import {
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    flexRender
} from "@tanstack/react-table";

import { toast } from "react-toastify";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";


const ImportUserModal = ({
    open,
    handleClose,
    API_URL,
    mId,
    id,
    activityId,
    token,
    fetchActivities,
    users,
    setAllData
}) => {

    const { handleSubmit } = useForm();

    const [file, setFile] = useState(null);
    const [imageError, setImageError] = useState("");
    const [loading, setLoading] = useState(false);
    const [excelData, setExcelData] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [matchedUsers, setMatchedUsers] = useState([]);

    const normalizeHeader = (header) => {
        return String(header || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "");
    };

    const getExcelCellValue = (cell) => {
        const value = cell?.value;

        if (value === null || value === undefined) {
            return "";
        }

        if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        ) {
            return String(value);
        }

        // Date
        if (value instanceof Date) {
            return value.toLocaleDateString();
        }

        if (
            typeof value === "object" &&
            value?.text !== undefined
        ) {
            return String(value.text);
        }

        if (
            typeof value === "object" &&
            value?.result !== undefined
        ) {
            return String(value.result ?? "");
        }

        if (
            typeof value === "object" &&
            Array.isArray(value?.richText)
        ) {
            return value.richText
                .map(item => item?.text || "")
                .join("");
        }

        // Error cell
        if (
            typeof value === "object" &&
            value?.error !== undefined
        ) {
            return String(value.error);
        }

        // Fallback for any unknown Excel object
        if (typeof value === "object") {
            try {
                return JSON.stringify(value);
            } catch {
                return String(value);
            }
        }

        return String(value);
    };

    const validateExcelHeaders = (headers) => {

        const requiredHeaders = [
            "sno",
            "empid/email"
        ];

        for (const requiredHeader of requiredHeaders) {

            if (!headers.includes(requiredHeader)) {
                throw new Error(
                    `Missing required column: ${requiredHeader}`
                );
            }
        }
    };

    const findMatchingUser = (empVal) => {

        if (!empVal) {
            return null;
        }

        const cleanValue = String(empVal)
            .trim()
            .toLowerCase();

        /*
         * Email matching
         */
        if (cleanValue.includes("@")) {

            const normalizedEmail =
                typeof normalizeEmail === "function"
                    ? normalizeEmail(cleanValue)
                    : cleanValue;

            const hashedEmail =
                typeof hash === "function"
                    ? hash(normalizedEmail)
                    : normalizedEmail;

            return (users || []).find(user => {

                const userEmail =
                    user?.email
                        ? String(user.email).trim().toLowerCase()
                        : "";

                return (
                    user?.email_hash === hashedEmail ||
                    userEmail === normalizedEmail
                );
            }) || null;
        }


        /*
         * Employee ID matching
         */
        return (
            (users || []).find(user => {

                const codes = Array.isArray(user?.codes)
                    ? user.codes
                    : [];

                return codes.some(code => {

                    const userCode =
                        code?.code !== undefined
                            ? String(code.code)
                                .trim()
                                .toLowerCase()
                            : "";

                    return userCode === cleanValue;
                });
            }) || null
        );
    };


    /*
     * ---------------------------------------------------------
     * Process uploaded Excel file
     * ---------------------------------------------------------
     */
    const processExcelFile = async (selectedFile) => {

        try {

            setLoading(true);
            setImageError("");
            setRowErrors({});
            setMatchedUsers([]);
            setExcelData([]);


            /*
             * Read file
             */
            const arrayBuffer =
                await selectedFile.arrayBuffer();


            /*
             * Load workbook
             */
            const workbook =
                new ExcelJS.Workbook();

            await workbook.xlsx.load(arrayBuffer);


            /*
             * Get first worksheet
             */
            const worksheet =
                workbook.worksheets[0];


            if (!worksheet) {
                throw new Error(
                    "Excel file is empty."
                );
            }

            const headerRow = worksheet.getRow(1).values.slice(1).map(value => getExcelCellValue({ value }).trim());
            const cleanHeaders = headerRow.map((header, index) => header || `Column${index + 1}`);

            const normalizedHeaders =
                cleanHeaders.map(
                    normalizeHeader
                );


            /*
             * Validate required columns
             */
            validateExcelHeaders(
                normalizedHeaders
            );

            const snoKey = cleanHeaders.find(header => normalizeHeader(header) === "sno");

            const empIdEmailKey = cleanHeaders.find(header => normalizeHeader(header) === "empid/email");

            const rows = [];

            worksheet.eachRow(
                {
                    includeEmpty: false
                },
                (row, rowNumber) => {

                    /*
                     * Skip header
                     */
                    if (rowNumber === 1) {
                        return;
                    }


                    const rowData = {};


                    cleanHeaders.forEach(
                        (header, index) => {

                            const cell =
                                row.getCell(
                                    index + 1
                                );

                            rowData[header] =
                                getExcelCellValue(
                                    cell
                                );
                        }
                    );

                    const hasData =
                        Object.values(rowData).some(
                            value =>
                                String(value || "")
                                    .trim() !== ""
                        );


                    if (hasData) {
                        rows.push(rowData);
                    }
                }
            );

            const errors = {};
            const matchedUsersArray = [];

            rows.forEach(
                (row, index) => {

                    const snoVal =
                        String(
                            row[snoKey] || ""
                        ).trim();


                    const empVal =
                        String(
                            row[empIdEmailKey] || ""
                        ).trim();


                    const snoFilled =
                        snoVal !== "";


                    const empFilled =
                        empVal !== "";

                    if (
                        snoFilled !==
                        empFilled
                    ) {

                        errors[index] =
                            "Sno and EmpId/Email must both be filled or both be empty.";

                        return;
                    }


                    /*
                     * Empty row pair
                     */
                    if (!empFilled) {
                        return;
                    }


                    /*
                     * Find user
                     */
                    const matchedUser =
                        findMatchingUser(
                            empVal
                        );


                    if (matchedUser) {

                        /*
                         * Avoid duplicate users
                         */
                        if (
                            !matchedUsersArray.includes(
                                matchedUser._id
                            )
                        ) {
                            matchedUsersArray.push(
                                matchedUser._id
                            );
                        }

                    } else {

                        errors[index] =
                            `${empVal} does not exist`;
                    }
                }
            );

            setRowErrors(errors);
            setExcelData(rows);
            setFile(selectedFile);
            setMatchedUsers(
                matchedUsersArray
            );
            setImageError("");


            /*
             * Show success only if everything is valid
             */
            if (
                rows.length > 0 &&
                Object.keys(errors).length === 0
            ) {
                toast.success(
                    `${rows.length} user${rows.length > 1 ? "s" : ""} imported successfully.`
                );
            }

        } catch (error) {

            console.error(
                "Error processing Excel file:",
                error
            );


            setFile(null);
            setExcelData([]);
            setRowErrors({});
            setMatchedUsers([]);

            const errorMessage = error?.message || "Unable to process Excel file.";

            setImageError(errorMessage);
            toast.error(errorMessage);

        } finally {

            setLoading(false);
        }
    };

    const {
        getRootProps,
        getInputProps
    } = useDropzone({
        multiple: false,
        maxSize: 5 * 1024 * 1024,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"]
        },


        onDrop: async (acceptedFiles) => {

            if (!acceptedFiles?.length) {
                return;
            }


            const selectedFile = acceptedFiles[0];

            await processExcelFile(selectedFile);
        },


        onDropRejected: (rejectedFiles) => {
            rejectedFiles.forEach(rejectedFile => {
                rejectedFile.errors.forEach(error => {

                    let message = "";

                    switch (error.code) {

                        case "file-invalid-type":

                            message =
                                "Invalid file type. Only .xlsx files are allowed.";

                            break;


                        case "file-too-large":

                            message =
                                "File is too large. Max allowed size is 5MB.";

                            break;


                        case "too-many-files":

                            message =
                                "Only one file can be uploaded.";

                            break;


                        default:

                            message = "There was an issue with the uploaded file.";
                    }


                    toast.error(message);

                    setImageError(message);
                }
                );
            }
            );
        }
    });

    const handleDataSave = async () => {

        try {

            if (!file) {

                setImageError(
                    "Please upload a valid .xlsx file."
                );

                return;
            }


            /*
             * Do not submit if there are errors
             */
            if (
                Object.keys(rowErrors)
                    .length > 0
            ) {

                toast.error(
                    "Please fix the errors in the table before submitting."
                );

                return;
            }


            /*
             * Do not submit if no users matched
             */
            if (
                matchedUsers.length === 0
            ) {

                toast.error(
                    "No valid users found in the uploaded file."
                );

                return;
            }


            setLoading(true);

            setAllData(matchedUsers);

            toast.success(`${matchedUsers.length} user${matchedUsers.length > 1 ? "s" : ""} added successfully.`);


            setTimeout(() => {
                handleClose();
            }, 0);

        } catch (error) {

            console.error(
                "Error saving imported users:",
                error
            );

            toast.error(
                error?.message ||
                "Unable to save imported users."
            );

        } finally {

            setLoading(false);
        }
    };


    const DebouncedInput = ({
        value: initialValue,
        onChange,
        debounce = 500,
        ...props
    }) => {

        const [value, setValue] =
            useState(
                initialValue
            );


        useEffect(() => {

            setValue(
                initialValue
            );

        }, [initialValue]);


        useEffect(() => {

            const timeout = setTimeout(() => {
                onChange(value);
            }, debounce);

            return () => clearTimeout(timeout);

        }, [
            value,
            debounce,
            onChange
        ]);


        return (
            <TextField
                size="small"
                {...props}
                value={value}
                onChange={event =>
                    setValue(
                        event.target.value
                    )
                }
            />
        );
    };

    const columns = useMemo(() => {

        if (
            !excelData?.length
        ) {
            return [];
        }


        return Object.keys(
            excelData[0]
        ).map(key => ({

            header: key,

            accessorKey: key,


            cell: ({
                row,
                getValue
            }) => {

                const value =
                    getValue();


                const error =
                    rowErrors[
                    row.index
                    ];


                /*
                 * React-safe display value
                 */
                let displayValue = "";


                if (
                    value === null ||
                    value === undefined
                ) {

                    displayValue = "";

                } else if (
                    typeof value ===
                    "object"
                ) {

                    /*
                     * Extra protection.
                     */
                    if (
                        value?.text !==
                        undefined
                    ) {

                        displayValue =
                            String(
                                value.text
                            );

                    } else if (
                        value?.result !==
                        undefined
                    ) {

                        displayValue =
                            String(
                                value.result ??
                                ""
                            );

                    } else {

                        try {

                            displayValue =
                                JSON.stringify(
                                    value
                                );

                        } catch {

                            displayValue =
                                String(
                                    value
                                );
                        }
                    }

                } else {

                    displayValue =
                        String(
                            value
                        );
                }


                return (
                    <div>

                        {displayValue}


                        {key ===
                            excelData[0] &&
                            null}


                        {normalizeHeader(
                            key
                        ) ===
                            "empid/email" &&
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

    }, [
        excelData,
        rowErrors
    ]);


    /*
     * ---------------------------------------------------------
     * TanStack table
     * ---------------------------------------------------------
     */
    const table =
        useReactTable({

            data:
                excelData,

            columns,

            getCoreRowModel:
                getCoreRowModel(),

            getPaginationRowModel:
                getPaginationRowModel(),

            getFilteredRowModel:
                getFilteredRowModel(),

            getSortedRowModel:
                getSortedRowModel(),

            initialState: {
                pagination: {
                    pageSize: 10
                }
            }
        });


    /*
     * ---------------------------------------------------------
     * Reset when modal opens
     * ---------------------------------------------------------
     */
    useEffect(() => {

        if (open) {

            setFile(null);

            setImageError("");

            setExcelData([]);

            setRowErrors({});

            setMatchedUsers([]);

            setLoading(false);
        }

    }, [open]);


    /*
     * ---------------------------------------------------------
     * Import table
     * ---------------------------------------------------------
     */
    const TableImportComponent = () => (

        <Card
            className="mt-4"
            variant="outlined"
        >

            <CardContent
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                    alignItems:
                        "center"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        alignItems:
                            "center",
                        gap: 8
                    }}
                >

                    <Typography>
                        Show
                    </Typography>


                    <TextField
                        select
                        size="small"
                        value={
                            table.getState()
                                .pagination
                                .pageSize
                        }
                        onChange={event =>
                            table.setPageSize(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                        sx={{
                            width: 90
                        }}
                    >

                        <MenuItem value={10}>
                            10
                        </MenuItem>

                        <MenuItem value={25}>
                            25
                        </MenuItem>

                        <MenuItem value={50}>
                            50
                        </MenuItem>

                        <MenuItem value={200}>
                            200
                        </MenuItem>

                    </TextField>

                </div>


                <DebouncedInput
                    value={
                        table.getState()
                            .globalFilter ??
                        ""
                    }
                    onChange={value =>
                        table.setGlobalFilter(
                            String(value)
                        )
                    }
                    placeholder="Search"
                />

            </CardContent>


            <div
                style={{
                    overflowX:
                        "auto"
                }}
            >

                <table
                    style={{
                        width: "100%",
                        borderCollapse:
                            "collapse"
                    }}
                >

                    <thead>

                        {table
                            .getHeaderGroups()
                            .map(
                                headerGroup => (

                                    <tr
                                        key={
                                            headerGroup.id
                                        }
                                    >

                                        {headerGroup.headers.map(
                                            header => (

                                                <th
                                                    key={
                                                        header.id
                                                    }
                                                    style={{
                                                        textAlign:
                                                            "left",
                                                        padding:
                                                            8,
                                                        borderBottom:
                                                            "1px solid #e0e0e0"
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            cursor:
                                                                header.column.getCanSort()
                                                                    ? "pointer"
                                                                    : "default"
                                                        }}
                                                        onClick={
                                                            header.column.getToggleSortingHandler()
                                                        }
                                                    >

                                                        {flexRender(
                                                            header
                                                                .column
                                                                .columnDef
                                                                .header,
                                                            header.getContext()
                                                        )}


                                                        {header.column.getIsSorted() ===
                                                            "asc" && (
                                                                <i className="tabler-chevron-up" />
                                                            )}


                                                        {header.column.getIsSorted() ===
                                                            "desc" && (
                                                                <i className="tabler-chevron-down" />
                                                            )}

                                                    </div>

                                                </th>
                                            )
                                        )}

                                    </tr>
                                )
                            )}

                    </thead>


                    <tbody>

                        {table.getRowModel()
                            .rows?.length ===
                            0 ? (

                            <tr>

                                <td
                                    colSpan={
                                        columns.length ||
                                        1
                                    }
                                    style={{
                                        textAlign:
                                            "center",
                                        padding:
                                            16
                                    }}
                                >
                                    No data available
                                </td>

                            </tr>

                        ) : (

                            table
                                .getRowModel()
                                .rows
                                .map(row => (

                                    <tr
                                        key={
                                            row.id
                                        }
                                    >

                                        {row
                                            .getVisibleCells()
                                            .map(
                                                cell => (

                                                    <td
                                                        key={
                                                            cell.id
                                                        }
                                                        style={{
                                                            padding:
                                                                8,
                                                            borderBottom:
                                                                "1px solid #f0f0f0"
                                                        }}
                                                    >

                                                        {flexRender(
                                                            cell
                                                                .column
                                                                .columnDef
                                                                .cell,
                                                            cell.getContext()
                                                        )}

                                                    </td>
                                                )
                                            )}

                                    </tr>
                                )
                                )
                        )}

                    </tbody>

                </table>

            </div>


            {/* Pagination */}
            {excelData.length > 0 && (

                <CardContent
                    sx={{
                        display:
                            "flex",
                        justifyContent:
                            "flex-end",
                        gap: 1
                    }}
                >

                    <Button
                        size="small"
                        variant="outlined"
                        disabled={
                            !table.getCanPreviousPage()
                        }
                        onClick={() =>
                            table.previousPage()
                        }
                    >
                        Previous
                    </Button>


                    <Typography
                        sx={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            px: 2
                        }}
                    >
                        Page{" "}
                        {table.getState()
                            .pagination
                            .pageIndex + 1}{" "}
                        of{" "}
                        {table.getPageCount()}
                    </Typography>


                    <Button
                        size="small"
                        variant="outlined"
                        disabled={
                            !table.getCanNextPage()
                        }
                        onClick={() =>
                            table.nextPage()
                        }
                    >
                        Next
                    </Button>

                </CardContent>
            )}

        </Card>
    );


    /*
     * ---------------------------------------------------------
     * Render
     * ---------------------------------------------------------
     */
    return (

        <Dialog
            open={open}
            fullWidth
            maxWidth="lg"
            sx={{
                "& .MuiDialog-paper": {
                    overflow:
                        "visible"
                }
            }}
        >

            <DialogCloseButton
                onClick={handleClose}
                disableRipple
            >
                <i className="tabler-x" />
            </DialogCloseButton>


            <DialogTitle>
                Import User
            </DialogTitle>


            <form
                onSubmit={handleSubmit(
                    handleDataSave
                )}
                noValidate
            >

                <DialogContent
                    sx={{
                        maxHeight:
                            "80vh",
                        overflowY:
                            "auto"
                    }}
                >

                    <Grid
                        container
                        spacing={5}
                    >

                        <Grid
                            size={{
                                xs: 12
                            }}
                            item
                        >

                            <Typography
                                variant="body1"
                                fontWeight={500}
                                gutterBottom
                            >

                                XLSX{" "}

                                <span>
                                    *
                                </span>


                                <Button
                                    variant="contained"
                                    href="/sample/import_user_sample.xlsx"
                                    sx={{
                                        ml: 2
                                    }}
                                >
                                    Download sample file
                                </Button>

                            </Typography>


                            <div
                                {...getRootProps()}
                                style={{
                                    minHeight:
                                        "150px",
                                    border:
                                        "2px dashed #ccc",
                                    padding:
                                        "1rem",
                                    borderRadius:
                                        "8px",
                                    textAlign:
                                        "center",
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    gap:
                                        "1rem",
                                    cursor:
                                        "pointer"
                                }}
                            >

                                <input
                                    {...getInputProps()}
                                />


                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        bgcolor:
                                            "#f5f5f5",
                                        width:
                                            48,
                                        height:
                                            48
                                    }}
                                >
                                    <i className="tabler-upload" />
                                </Avatar>


                                <Typography
                                    variant="body2"
                                >
                                    Allowed: *.xlsx,
                                    Max 5MB
                                </Typography>


                                {file && (

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            gap:
                                                "0.5rem"
                                        }}
                                    >

                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                bgcolor:
                                                    "#f5f5f5",
                                                color:
                                                    "#0A2E73",
                                                width:
                                                    48,
                                                height:
                                                    48
                                            }}
                                        >
                                            <i className="tabler-file" />
                                        </Avatar>


                                        <Typography
                                            variant="body2"
                                            fontWeight={
                                                500
                                            }
                                        >
                                            {file.name}
                                        </Typography>


                                        <Typography
                                            variant="caption"
                                            color="textSecondary"
                                        >
                                            {(
                                                file.size /
                                                1024 /
                                                1024
                                            ).toFixed(
                                                2
                                            )}{" "}
                                            MB
                                        </Typography>

                                    </div>
                                )}


                                {imageError && (

                                    <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{
                                            mt: 1
                                        }}
                                    >
                                        {imageError}
                                    </Typography>

                                )}

                            </div>

                        </Grid>

                    </Grid>


                    {excelData?.length >
                        0 && (
                            <TableImportComponent />
                        )}


                    <DialogActions
                        sx={{
                            justifyContent:
                                "center",
                            gap: 2,
                            mt: 4
                        }}
                    >

                        {excelData.length > 0 && Object.keys(rowErrors).length === 0 && (
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ height: 40 }}
                                disabled={loading || matchedUsers.length === 0}
                            >
                                {loading ? "Uploading..." : "Submit"}
                            </Button>
                        )}


                        <Button
                            type="button"
                            variant="contained"
                            color="secondary"
                            disabled={loading}
                            onClick={() => {

                                setFile(null);

                                setExcelData([]);

                                setRowErrors({});

                                setMatchedUsers([]);

                                setImageError("");

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
