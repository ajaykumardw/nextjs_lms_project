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
    useReactTable,
    flexRender
} from "@tanstack/react-table";

import { toast } from "react-toastify";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";

const REQUIRED_HEADERS = [
    "Batch Name",
    "Batch Type",
    "Batch Start Date",
    "Batch Start Time",
    "Batch End Date",
    "Batch End Time",
    "Venue / Conference Link",
    "Cost Per Learner",
    "Action To Take On Self Enrollment",
    "Last Date Of Registration",
    "Closing Time",
    "Session Name",
    "Session Start Date",
    "Session Start Time",
    "Session End Date",
    "Session End Time",
    "Trainer Email(s)",
    "Learner Email(s)",
    "Additional Comments"
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ImportBatchModal = ({
    open,
    handleClose,
    mId,
    token,
    handleFetchData,
    setValue,
    onImported,
    finalData
}) => {
    const { handleSubmit } = useForm();

    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [loading, setLoading] = useState(false);
    const [excelData, setExcelData] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [parsedBatches, setParsedBatches] = useState([]);
    const [pageSize, setPageSize] = useState(10);

    const [validLearnerEmails, setValidLearnerEmails] = useState(new Set());
    const [validTrainerEmails, setValidTrainerEmails] = useState(new Set());

    useEffect(() => {
        if (open) {
            setFile(null);
            setFileError("");
            setExcelData([]);
            setRowErrors({});
            setParsedBatches([]);
            setLoading(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !finalData) {
            return;
        }

        const learnerList = finalData?.learner || [];
        const trainerList = finalData?.trainer || [];

        const learnerSet = new Set(
            learnerList.map(u => String(u.email || "").trim().toLowerCase()).filter(Boolean)
        );

        const trainerSet = new Set(
            trainerList.map(u => String(u.email || "").trim().toLowerCase()).filter(Boolean)
        );

        setValidLearnerEmails(learnerSet);
        setValidTrainerEmails(trainerSet);
    }, [open, finalData]);

    const cleanValue = (value) => {
        if (value === null || value === undefined) {
            return "";
        }

        if (typeof value === "object" && value.richText) {
            return value.richText
                .map(item => item.text || "")
                .join("")
                .trim();
        }

        if (typeof value === "object" && value.result !== undefined) {
            return String(value.result).trim();
        }

        if (typeof value === "object" && value.text !== undefined) {
            return String(value.text).trim();
        }

        return String(value).trim();
    };

    const normalizeHeader = (value) => {
        return String(value || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    };

    const validateHeaders = (headers) => {
        const normalizedHeaders = headers.map(normalizeHeader);

        const normalizedRequiredHeaders = REQUIRED_HEADERS.map(normalizeHeader);

        const missingHeaders = normalizedRequiredHeaders.filter(requiredHeader =>
            !normalizedHeaders.includes(requiredHeader)
        );

        if (missingHeaders.length > 0) {
            const readableMissing = REQUIRED_HEADERS.filter(header =>
                missingHeaders.includes(normalizeHeader(header))
            );

            throw new Error(`Missing required column(s): ${readableMissing.join(", ")}`);
        }

        const unexpectedHeaders = normalizedHeaders.filter(header =>
            !normalizedRequiredHeaders.includes(header)
        );

        if (unexpectedHeaders.length > 0) {
            throw new Error("Invalid Excel template. Please download and use the latest sample_batch_import.xlsx file.");
        }
    };

    const getCellValue = (cell) => {
        const value = cell?.value;

        if (value === null || value === undefined) {
            return "";
        }

        if (typeof value === "object" && value.richText) {
            return value.richText.map(item => item.text || "").join("");
        }

        if (typeof value === "object" && value.result !== undefined) {
            return value.result;
        }

        if (typeof value === "object" && value.text !== undefined) {
            return value.text;
        }

        return value;
    };

    const formatExcelDate = (value) => {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
            return value.trim();
        }

        if (value instanceof Date) {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, "0");
            const day = String(value.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

        if (typeof value === "number" && value > 1) {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

        return String(value).trim();
    };

    const formatExcelTime = (value) => {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        if (typeof value === "string" && /^\d{1,2}:\d{2}$/.test(value.trim())) {
            const [hours, minutes] = value.trim().split(":");

            return `${String(hours).padStart(2, "0")}:${minutes}`;
        }

        if (typeof value === "string" && /^\d{1,2}:\d{2}:\d{2}$/.test(value.trim())) {
            const [hours, minutes] = value.trim().split(":");

            return `${String(hours).padStart(2, "0")}:${minutes}`;
        }

        if (value instanceof Date) {
            const hours = String(value.getHours()).padStart(2, "0");
            const minutes = String(value.getMinutes()).padStart(2, "0");

            return `${hours}:${minutes}`;
        }

        if (typeof value === "number" && value >= 0 && value < 1) {
            const totalMinutes = Math.round(value * 24 * 60);
            const hours = Math.floor(totalMinutes / 60) % 24;
            const minutes = totalMinutes % 60;

            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        }

        return String(value).trim();
    };

    const isValidDate = (value) => {
        if (!value) {
            return false;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] = value.split("-").map(Number);

        const date = new Date(year, month - 1, day);

        return (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day);
    };

    const isValidTime = (value) => {
        if (!value) {
            return false;
        }

        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
    };

    const compareDates = (date1, date2) => {
        return (
            new Date(`${date1}T00:00:00`).getTime() -
            new Date(`${date2}T00:00:00`).getTime()
        );
    };

    const compareTimes = (time1, time2) => {
        const [h1, m1] = time1.split(":").map(Number);
        const [h2, m2] = time2.split(":").map(Number);

        return (h1 * 60 + m1 - (h2 * 60 + m2));
    };

    const parseEmails = (value) => {
        if (!value) {
            return [];
        }

        return String(value).split(";").map(email => email.trim()).filter(Boolean);
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateRow = (row, rowIndex) => {
        const fieldErrors = [];

        const addFieldError = (field, message) => {
            fieldErrors.push({ field, message });
        };

        const batchName = cleanValue(row["Batch Name"]);
        const batchType = cleanValue(row["Batch Type"]).toLowerCase();
        const batchStartDate = cleanValue(row["Batch Start Date"]);
        const batchStartTime = cleanValue(row["Batch Start Time"]);
        const batchEndDate = cleanValue(row["Batch End Date"]);
        const batchEndTime = cleanValue(row["Batch End Time"]);
        const venue = cleanValue(row["Venue / Conference Link"]);
        const costValue = cleanValue(row["Cost Per Learner"]);
        const cost = costValue === "" ? 0 : Number(costValue);
        const selfEnrollmentAction = cleanValue(row["Action To Take On Self Enrollment"]).toLowerCase();
        const registrationDate = cleanValue(row["Last Date Of Registration"]);
        const closingTime = cleanValue(row["Closing Time"]);
        const sessionName = cleanValue(row["Session Name"]);
        const sessionStartDate = cleanValue(row["Session Start Date"]);
        const sessionStartTime = cleanValue(row["Session Start Time"]);
        const sessionEndDate = cleanValue(row["Session End Date"]);
        const sessionEndTime = cleanValue(row["Session End Time"]);
        const trainerEmails = parseEmails(row["Trainer Email(s)"]);
        const learnerEmails = parseEmails(row["Learner Email(s)"]);

        if (!batchName) {
            addFieldError("Batch Name", "Batch Name is required.");
        }

        if (!["defined", "nominated"].includes(batchType)) {
            addFieldError("Batch Type", "Must be either 'defined' or 'nominated'.");
        }

        if (costValue !== "" && (Number.isNaN(cost) || cost < 0)) {
            addFieldError("Cost Per Learner", "Must be a valid non-negative number.");
        }

        if (selfEnrollmentAction && !["allow", "deny"].includes(selfEnrollmentAction)) {
            addFieldError("Action To Take On Self Enrollment", "Must be 'allow' or 'deny'.");
        }

        if (batchType === "defined") {
            if (!batchStartDate) {
                addFieldError("Batch Start Date", "Required for defined batches.");
            } else if (!isValidDate(batchStartDate)) {
                addFieldError("Batch Start Date", "Must use YYYY-MM-DD format.");
            }

            if (!batchStartTime) {
                addFieldError("Batch Start Time", "Required for defined batches.");
            } else if (!isValidTime(batchStartTime)) {
                addFieldError("Batch Start Time", "Must use HH:mm format.");
            }

            if (!batchEndDate) {
                addFieldError("Batch End Date", "Required for defined batches.");
            } else if (!isValidDate(batchEndDate)) {
                addFieldError("Batch End Date", "Must use YYYY-MM-DD format.");
            }

            if (!batchEndTime) {
                addFieldError("Batch End Time", "Required for defined batches.");
            } else if (!isValidTime(batchEndTime)) {
                addFieldError("Batch End Time", "Must use HH:mm format.");
            }

            if (
                isValidDate(batchStartDate) &&
                isValidDate(batchEndDate) &&
                compareDates(batchEndDate, batchStartDate) < 0
            ) {
                addFieldError("Batch End Date", "Must be on or after Batch Start Date.");
            }

            if (!sessionName) {
                addFieldError("Session Name", "Required for defined batches.");
            }

            if (!sessionStartDate) {
                addFieldError("Session Start Date", "Required for defined batches.");
            } else if (!isValidDate(sessionStartDate)) {
                addFieldError("Session Start Date", "Must use YYYY-MM-DD format.");
            }

            if (!sessionStartTime) {
                addFieldError("Session Start Time", "Required for defined batches.");
            } else if (!isValidTime(sessionStartTime)) {
                addFieldError("Session Start Time", "Must use HH:mm format.");
            }

            if (!sessionEndDate) {
                addFieldError("Session End Date", "Required for defined batches.");
            } else if (!isValidDate(sessionEndDate)) {
                addFieldError("Session End Date", "Must use YYYY-MM-DD format.");
            }

            if (!sessionEndTime) {
                addFieldError("Session End Time", "Required for defined batches.");
            } else if (!isValidTime(sessionEndTime)) {
                addFieldError("Session End Time", "Must use HH:mm format.");
            }

            if (
                isValidDate(batchStartDate) &&
                isValidDate(batchEndDate) &&
                isValidDate(sessionStartDate) &&
                isValidDate(sessionEndDate)
            ) {
                if (compareDates(sessionStartDate, batchStartDate) < 0) {
                    addFieldError("Session Start Date", "Cannot be before Batch Start Date.");
                }

                if (compareDates(sessionEndDate, batchEndDate) > 0) {
                    addFieldError("Session End Date", "Cannot be after Batch End Date.");
                }

                if (compareDates(sessionEndDate, sessionStartDate) < 0) {
                    addFieldError("Session End Date", "Cannot be before Session Start Date.");
                }
            }

            if (
                sessionStartDate &&
                sessionEndDate &&
                sessionStartDate === sessionEndDate &&
                isValidTime(sessionStartTime) &&
                isValidTime(sessionEndTime)
            ) {
                if (compareTimes(sessionEndTime, sessionStartTime) <= 0) {
                    addFieldError("Session End Time", "Must be after Session Start Time.");
                }
            }
        }

        if (registrationDate && !isValidDate(registrationDate)) {
            addFieldError("Last Date Of Registration", "Must use YYYY-MM-DD format.");
        }

        if (
            registrationDate &&
            batchStartDate &&
            isValidDate(registrationDate) &&
            isValidDate(batchStartDate) &&
            compareDates(registrationDate, batchStartDate) > 0
        ) {
            addFieldError("Last Date Of Registration", "Cannot be after Batch Start Date.");
        }

        if (closingTime && !isValidTime(closingTime)) {
            addFieldError("Closing Time", "Must use HH:mm format.");
        }

        const invalidTrainerEmails = trainerEmails.filter(email => !isValidEmail(email));

        if (invalidTrainerEmails.length) {
            addFieldError("Trainer Email(s)", `Invalid format: ${invalidTrainerEmails.join(", ")}`);
        }

        const unknownTrainerEmails = trainerEmails.filter(
            email => isValidEmail(email) && !validTrainerEmails.has(email.toLowerCase())
        );

        if (unknownTrainerEmails.length) {
            addFieldError("Trainer Email(s)", `Trainer email not found: ${unknownTrainerEmails.join(", ")}`);
        }

        const invalidLearnerEmails = learnerEmails.filter(email => !isValidEmail(email));

        if (invalidLearnerEmails.length) {
            addFieldError("Learner Email(s)", `Invalid format: ${invalidLearnerEmails.join(", ")}`);
        }

        const unknownLearnerEmails = learnerEmails.filter(
            email => isValidEmail(email) && !validLearnerEmails.has(email.toLowerCase())
        );

        if (unknownLearnerEmails.length) {
            addFieldError("Learner Email(s)", `Learner email not found: ${unknownLearnerEmails.join(", ")}`);
        }

        return {
            fieldErrors,
            normalized: {
                batchName,
                batchType,
                startDate: batchStartDate || null,
                startTime: batchStartTime || null,
                endDate: batchEndDate || null,
                endTime: batchEndTime || null,
                venue,
                cost,
                actionToTakeOnSelfEnrollment: selfEnrollmentAction || "allow",
                lastDateOfRegistration: registrationDate || null,
                closingTime: closingTime || null,
                sessionName,
                sessionStartDate: sessionStartDate || null,
                sessionStartTime: sessionStartTime || null,
                sessionEndDate: sessionEndDate || null,
                sessionEndTime: sessionEndTime || null,
                trainerEmails,
                learnerEmails,
                additionalComments: cleanValue(row["Additional Comments"]),
                rowIndex
            }
        };
    };

    const mergeFieldErrorsIntoRow = (rowFieldErrorMap, field, message) => {
        if (!rowFieldErrorMap[field]) {
            rowFieldErrorMap[field] = [];
        }

        rowFieldErrorMap[field].push(message);
    };

    const processExcelFile = async selectedFile => {
        const arrayBuffer = await selectedFile.arrayBuffer();

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet("Batches") || workbook.worksheets[0];

        if (!worksheet) {
            throw new Error("Excel file does not contain a worksheet.");
        }

        const headerValues = worksheet.getRow(1).values.slice(1);

        const headers = headerValues.map(value => String(value || "").trim());

        validateHeaders(headers);

        const cleanHeaders = headers;

        const rows = [];

        const errors = {};

        const batchMap = new Map();

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) {
                return;
            }

            const values = row.values.slice(1);

            const hasData = values.some(
                value => value !== null && value !== undefined && String(value).trim() !== ""
            );

            if (!hasData) {
                return;
            }

            const rawRow = {};

            cleanHeaders.forEach((header, index) => {
                rawRow[header] = getCellValue(row.getCell(index + 1));
            });

            const normalizedRow = {
                ...rawRow,
                "Batch Name": cleanValue(rawRow["Batch Name"]),
                "Batch Type": cleanValue(rawRow["Batch Type"]),
                "Batch Start Date": formatExcelDate(rawRow["Batch Start Date"]),
                "Batch Start Time": formatExcelTime(rawRow["Batch Start Time"]),
                "Batch End Date": formatExcelDate(rawRow["Batch End Date"]),
                "Batch End Time": formatExcelTime(rawRow["Batch End Time"]),
                "Venue / Conference Link": cleanValue(rawRow["Venue / Conference Link"]),
                "Cost Per Learner": cleanValue(rawRow["Cost Per Learner"]),
                "Action To Take On Self Enrollment": cleanValue(rawRow["Action To Take On Self Enrollment"]),
                "Last Date Of Registration": formatExcelDate(rawRow["Last Date Of Registration"]),
                "Closing Time": formatExcelTime(rawRow["Closing Time"]),
                "Session Name": cleanValue(rawRow["Session Name"]),
                "Session Start Date": formatExcelDate(rawRow["Session Start Date"]),
                "Session Start Time": formatExcelTime(rawRow["Session Start Time"]),
                "Session End Date": formatExcelDate(rawRow["Session End Date"]),
                "Session End Time": formatExcelTime(rawRow["Session End Time"]),
                "Trainer Email(s)": cleanValue(rawRow["Trainer Email(s)"]),
                "Learner Email(s)": cleanValue(rawRow["Learner Email(s)"]),
                "Additional Comments": cleanValue(rawRow["Additional Comments"])
            };

            const validation = validateRow(normalizedRow, rows.length);

            rows.push(normalizedRow);

            const currentRowIndex = rows.length - 1;

            if (validation.fieldErrors.length > 0) {
                const rowFieldErrorMap = {};

                validation.fieldErrors.forEach(({ field, message }) => {
                    mergeFieldErrorsIntoRow(rowFieldErrorMap, field, message);
                });

                errors[currentRowIndex] = rowFieldErrorMap;
            }

            const data = validation.normalized;

            if (!data.batchName) {
                return;
            }

            if (!batchMap.has(data.batchName)) {
                batchMap.set(data.batchName, {
                    name: data.batchName,
                    batchType: data.batchType,
                    startDate: data.startDate,
                    startTime: data.startTime,
                    endDate: data.endDate,
                    endTime: data.endTime,
                    venue: data.venue,
                    cost: data.cost,
                    actionToTakeOnSelfEnrollment: data.actionToTakeOnSelfEnrollment,
                    lastDateOfRegistration: data.lastDateOfRegistration,
                    closingTime: data.closingTime,
                    trainerEmails: [],
                    learnerEmails: [],
                    learnerStatus: "nominated",
                    additionalComments: data.additionalComments,
                    sessions: []
                });
            }

            const batch = batchMap.get(data.batchName);

            const addRowError = (field, message) => {
                if (!errors[currentRowIndex]) {
                    errors[currentRowIndex] = {};
                }

                mergeFieldErrorsIntoRow(errors[currentRowIndex], field, message);
            };

            if (data.batchType && batch.batchType !== data.batchType) {
                addRowError("Batch Type", "Must remain the same for the same Batch Name.");
            }

            if (data.batchType === "defined") {
                if (batch.startDate && data.startDate && batch.startDate !== data.startDate) {
                    addRowError("Batch Start Date", "Must remain the same for the same Batch Name.");
                }

                if (batch.startTime && data.startTime && batch.startTime !== data.startTime) {
                    addRowError("Batch Start Time", "Must remain the same for the same Batch Name.");
                }

                if (batch.endDate && data.endDate && batch.endDate !== data.endDate) {
                    addRowError("Batch End Date", "Must remain the same for the same Batch Name.");
                }

                if (batch.endTime && data.endTime && batch.endTime !== data.endTime) {
                    addRowError("Batch End Time", "Must remain the same for the same Batch Name.");
                }
            }

            data.trainerEmails.forEach(email => {
                if (!batch.trainerEmails.includes(email)) {
                    batch.trainerEmails.push(email);
                }
            });

            data.learnerEmails.forEach(email => {
                if (!batch.learnerEmails.includes(email)) {
                    batch.learnerEmails.push(email);
                }
            });

            if (data.batchType === "defined" && data.sessionName) {
                const duplicateSession = batch.sessions.some(
                    session => session.name.trim().toLowerCase() === data.sessionName.trim().toLowerCase()
                );

                if (duplicateSession) {
                    addRowError("Session Name", `Duplicate Session Name "${data.sessionName}" in the same batch.`);
                } else {
                    batch.sessions.push({
                        id: `${Date.now()}-${rows.length}-${Math.random()}`,
                        name: data.sessionName,
                        startDate: data.sessionStartDate,
                        startTime: data.sessionStartTime,
                        endDate: data.sessionEndDate,
                        endTime: data.sessionEndTime,
                        venue: data.venue,
                        trainerEmails: [...data.trainerEmails],
                        learnerEmails: [...data.learnerEmails],
                        additionalComments: data.additionalComments
                    });
                }
            }
        });

        batchMap.forEach(batch => {
            if (batch.batchType === "defined" && batch.sessions.length === 0) {
                rows.forEach((row, index) => {
                    if (cleanValue(row["Batch Name"]) === batch.name) {
                        if (!errors[index]) {
                            errors[index] = {};
                        }

                        mergeFieldErrorsIntoRow(
                            errors[index],
                            "Session Name",
                            "Defined batch must contain at least one valid session."
                        );
                    }
                });
            }
        });

        return {
            rows,
            errors,
            batches: Array.from(batchMap.values())
        };
    };

    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,

        maxSize: 5 * 1024 * 1024,

        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
        },

        onDrop: async acceptedFiles => {
            if (!acceptedFiles?.length) {
                return;
            }

            const selectedFile = acceptedFiles[0];

            try {
                setFileError("");
                setRowErrors({});
                setExcelData([]);
                setParsedBatches([]);

                const result = await processExcelFile(selectedFile);

                setFile(selectedFile);
                setExcelData(result.rows);
                setRowErrors(result.errors);
                setParsedBatches(result.batches);

                const errorCount = Object.keys(result.errors).length;

                if (errorCount > 0) {
                    toast.error(
                        `Found ${errorCount} invalid row(s). Please fix the Excel file before importing.`
                    );
                } else {
                    toast.success(`${result.batches.length} batch(es) detected successfully.`);
                }
            } catch (error) {
                console.error("Error processing Excel:", error);

                const message = error?.message || "Unable to process the Excel file.";

                setFile(null);
                setFileError(message);
                setExcelData([]);
                setRowErrors({});
                setParsedBatches([]);

                toast.error(message);
            }
        },

        onDropRejected: rejectedFiles => {
            rejectedFiles.forEach(rejectedFile => {
                rejectedFile.errors.forEach(error => {
                    let message = "There was an issue with the uploaded file.";

                    switch (error.code) {
                        case "file-invalid-type":
                            message = "Invalid file type. Only .xlsx files are allowed.";
                            break;

                        case "file-too-large":
                            message = "File is too large. Maximum allowed size is 5MB.";
                            break;

                        case "too-many-files":
                            message = "Only one file can be uploaded.";
                            break;

                        default:
                            break;
                    }

                    setFileError(message);
                    toast.error(message);
                });
            });
        }
    });

    const uploadBatchesToServer = async batches => {
        const results = [];

        for (const batch of batches) {
            const payload = {
                type: batch.batchType,
                name: batch.name,
                startDate: batch.startDate,
                endDate: batch.endDate,
                venue: batch.venue,
                cost: batch.cost,
                learnerEmails: JSON.stringify(batch.learnerEmails),
                trainerEmails: JSON.stringify(batch.trainerEmails),
                sessions: JSON.stringify(
                    batch.sessions.map(session => ({
                        date: session.startDate,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        venue: session.venue,
                        trainers: session.trainerEmails
                    }))
                )
            };

            const response = await fetch(`${API_URL}/company/ILT/batch/data/upload/${mId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || `Failed to import batch "${batch.name}".`);
            }

            results.push(data);
            handleFetchData()
            setValue("invite")
        }

        return results;
    };

    const handleImportSubmit = async () => {
        const errorCount = Object.keys(rowErrors).length;

        if (errorCount > 0) {
            toast.error("Please fix all Excel validation errors before importing.");

            return;
        }

        if (!file) {
            setFileError("Please upload a valid .xlsx file.");

            return;
        }

        if (parsedBatches.length === 0) {
            setFileError("No valid batches were found in the Excel file.");

            return;
        }

        setLoading(true);

        try {
            await uploadBatchesToServer(parsedBatches);

            toast.success(`${parsedBatches.length} batch(es) imported successfully.`, {
                autoClose: 1500
            });

            if (typeof onImported === "function") {
                await onImported(parsedBatches);
            }

            handleClose();
        } catch (error) {
            console.error("Batch import failed:", error);

            toast.error(error?.message || "Could not import batches. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const previewColumns = useMemo(() => {
        if (!excelData?.length) {
            return [];
        }

        return Object.keys(excelData[0]).map(key => ({
            header: key,
            accessorKey: key,
            cell: ({ row, getValue }) => {
                const value = getValue();

                const fieldMessages = rowErrors[row.index]?.[key];

                return (
                    <div>
                        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                            {String(value ?? "")}
                        </Typography>

                        {fieldMessages && fieldMessages.length > 0 && (
                            <Typography
                                variant="caption"
                                color="var(--mui-palette-error-main)"
                                sx={{
                                    display: "block",
                                    mt: 0.5,
                                    maxWidth: 260,
                                    whiteSpace: "normal"
                                }}
                            >
                                {fieldMessages.join(" ")}
                            </Typography>
                        )}
                    </div>
                );
            }
        }));
    }, [excelData, rowErrors]);

    const table = useReactTable({
        data: excelData,
        columns: previewColumns,

        state: {
            pagination: {
                pageIndex: 0,
                pageSize
            }
        },

        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    const totalErrors = Object.keys(rowErrors).length;

    const resetAndClose = () => {
        setFile(null);
        setFileError("");
        setExcelData([]);
        setRowErrors({});
        setParsedBatches([]);
        setLoading(false);
        handleClose();
    };

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="xl"
            sx={{
                "& .MuiDialog-paper": {
                    overflow: "visible"
                }
            }}
        >
            <DialogCloseButton onClick={resetAndClose} disableRipple>
                <i className="tabler-x" />
            </DialogCloseButton>

            <DialogTitle>Import Batches &amp; Sessions</DialogTitle>

            <form onSubmit={handleSubmit(handleImportSubmit)} noValidate>
                <DialogContent sx={{ maxHeight: "80vh", overflowY: "auto" }}>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="body1" fontWeight={500} gutterBottom>
                                XLSX <span>*</span>
                                <Button
                                    variant="contained"
                                    href="/sample/sample_batch_import.xlsx"
                                    sx={{ ml: 2 }}
                                >
                                    Download sample file
                                </Button>
                            </Typography>

                            <div
                                {...getRootProps()}
                                style={{
                                    minHeight: "170px",
                                    border: "2px dashed #ccc",
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "1rem",
                                    cursor: "pointer"
                                }}
                            >
                                <input {...getInputProps()} />

                                <Avatar
                                    variant="rounded"
                                    sx={{ bgcolor: "#f5f5f5", width: 48, height: 48 }}
                                >
                                    <i className="tabler-upload" />
                                </Avatar>

                                <Typography variant="body2">Allowed: *.xlsx, Max 5MB</Typography>

                                <Typography variant="caption" color="text.secondary">
                                    Upload the sample batch import template without changing the column names.
                                </Typography>

                                {file && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "0.5rem"
                                        }}
                                    >
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                bgcolor: "#f5f5f5",
                                                color: "#0A2E73",
                                                width: 48,
                                                height: 48
                                            }}
                                        >
                                            <i className="tabler-file" />
                                        </Avatar>

                                        <Typography variant="body2" fontWeight={500}>
                                            {file.name}
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                    </div>
                                )}

                                {fileError && (
                                    <Typography variant="caption" color="var(--mui-palette-error-main)" sx={{ mt: 1 }}>
                                        {fileError}
                                    </Typography>
                                )}
                            </div>
                        </Grid>
                    </Grid>

                    {excelData?.length > 0 && (
                        <Card variant="outlined" sx={{ mt: 4 }}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle2">
                                            {parsedBatches.length} batch(es) detected from {excelData.length} row(s)
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        {totalErrors > 0 ? (
                                            <Typography
                                                variant="body2"
                                                color="error"
                                                sx={{ textAlign: { xs: "left", md: "right" } }}
                                            >
                                                {totalErrors} invalid row(s)
                                            </Typography>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                color="success.main"
                                                sx={{ textAlign: { xs: "left", md: "right" } }}
                                            >
                                                All rows are valid
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>

                            <div style={{ overflowX: "auto" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        minWidth: "1900px",
                                        borderCollapse: "collapse"
                                    }}
                                >
                                    <thead>
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <th
                                                        key={header.id}
                                                        style={{
                                                            textAlign: "left",
                                                            padding: "10px 8px",
                                                            borderBottom: "1px solid #e0e0e0",
                                                            whiteSpace: "nowrap",
                                                            background: "#fafafa",
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>

                                    <tbody>
                                        {table.getRowModel().rows.map(row => (
                                            <tr
                                                key={row.id}
                                                style={{
                                                    backgroundColor: rowErrors[row.index]
                                                        ? "rgba(211, 47, 47, 0.04)"
                                                        : "transparent"
                                                }}
                                            >
                                                {row.getVisibleCells().map(cell => (
                                                    <td
                                                        key={cell.id}
                                                        style={{
                                                            padding: "8px",
                                                            borderBottom: "1px solid #f0f0f0",
                                                            verticalAlign: "top"
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            select
                                            size="small"
                                            label="Rows per page"
                                            value={pageSize}
                                            onChange={e => setPageSize(Number(e.target.value))}
                                            SelectProps={{ native: true }}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </TextField>
                                    </Grid>

                                    <Grid
                                        size={{ xs: 12, md: 8 }}
                                        sx={{
                                            display: "flex",
                                            justifyContent: { xs: "flex-start", md: "flex-end" },
                                            alignItems: "center",
                                            gap: 1
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            disabled={!table.getCanPreviousPage()}
                                            onClick={() => table.previousPage()}
                                        >
                                            Previous
                                        </Button>

                                        <Typography variant="body2">
                                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                                            {Math.max(table.getPageCount(), 1)}
                                        </Typography>

                                        <Button
                                            size="small"
                                            variant="outlined"
                                            disabled={!table.getCanNextPage()}
                                            onClick={() => table.nextPage()}
                                        >
                                            Next
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}

                    <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 4 }}>
                        {excelData.length > 0 && (
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ height: 40 }}
                                disabled={loading || totalErrors > 0 || parsedBatches.length === 0}
                            >
                                {loading ? "Importing..." : `Import ${parsedBatches.length} Batch(es)`}
                            </Button>
                        )}

                        <Button type="button" variant="contained" color="secondary" onClick={resetAndClose}>
                            Close
                        </Button>
                    </DialogActions>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default ImportBatchModal;
