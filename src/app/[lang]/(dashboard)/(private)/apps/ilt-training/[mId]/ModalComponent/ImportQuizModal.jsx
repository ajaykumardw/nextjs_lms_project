import { useEffect, useState, useMemo } from "react";

import { useParams, useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { Alert, Avatar, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, List, ListItem, MenuItem, Typography, IconButton } from "@mui/material";

import ExcelJS from "exceljs";

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'

import { toast } from "react-toastify";

import { useDropzone } from "react-dropzone";

import classnames from 'classnames'

import tableStyles from '@core/styles/table.module.css'

import CustomTextField from "@/@core/components/mui/TextField";

import AppReactDropzone from "@/libs/styles/AppReactDropzone";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";
import TablePaginationComponent from "@/components/TablePaginationComponent";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ImportQuizModal = ({ open, onClose, activityId, handleClose }) => {

    const { data: session } = useSession();
    const token = session?.user?.token;

    const router = useRouter();
    const { mId: mId, lang: lang } = useParams();

    const [missingHeaders, setMissingHeaders] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);

    const [fileInput, setFileInput] = useState();
    const [progress, setProgress] = useState(0);
    const [uploadData, setUploadData] = useState();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [srNoArr, setSRNOArr] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const columnHelper = createColumnHelper();

    const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
        const [value, setValue] = useState(initialValue);

        useEffect(() => { setValue(initialValue); }, [initialValue]);
        useEffect(() => {
            const timeout = setTimeout(() => { onChange(value); }, debounce);

            return () => clearTimeout(timeout);
        }, [value]);

        return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />;
    };

    const fuzzyFilter = (row, columnId, value, addMeta) => {
        const itemRank = rankItem(row.getValue(columnId), value);

        addMeta({ itemRank });

        return itemRank.passed;
    };

    const handleRemoveFile = () => {
        setData([]);
        setFileInput(null);
        setUploadData([]);
        setValidationErrors([]);
        setMissingHeaders([]);
        setLoading(false);
        setProgress(0);
    };

    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        maxSize: 2 * 1024 * 1024, // 2MB
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        },
        onDrop: async (acceptedFiles) => {
            // reset
            setFileInput(null);
            setMissingHeaders([]);
            setValidationErrors([]);
            setLoading(true);
            setProgress(0);
            setData([]);
            setUploadData([]);

            if (!acceptedFiles?.length) {
                setLoading(false);
                toast.error("No file selected.");

                return;
            }

            const selectedFile = acceptedFiles[0];

            if (!selectedFile) {
                setLoading(false);

                toast.error("File read failed.");

                return;
            }

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const workbook = new ExcelJS.Workbook();

                await workbook.xlsx.load(arrayBuffer);

                const worksheet = workbook.worksheets[0]; // first sheet

                // Read headers
                const headerRow = worksheet.getRow(1).values.slice(1);

                const requiredHeaders = [
                    "Sno",
                    "Question",
                    "Option 1",
                    "Option 2",
                    "Option 3",
                    "Option 4",
                    "Option 5",
                    "Option 6",
                    "Correct Answer",
                    "Difficulty Level",
                    "Section",
                    "Answer Explanation",
                    "Use Answer Explanation",
                    "Question Type",
                ];

                const missingHeaders = requiredHeaders.filter(
                    (h) => !headerRow.includes(h)
                );

                if (missingHeaders.length > 0) {
                    setMissingHeaders(missingHeaders);
                    setLoading(false);
                    setProgress(0);

                    return;
                }

                // Read data rows
                const jsonData = [];

                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber === 1) return;
                    const rowValues = row.values.slice(1);
                    const rowData = {};

                    headerRow.forEach((header, index) => {
                        rowData[header] = rowValues[index] ?? "";
                    });
                    jsonData.push(rowData);
                });

                // Validation
                const seenSno = new Set();
                const duplicateSno = [];
                const errors = [];

                function parseCorrectAnswer(raw) {
                    if (raw == null) return [];

                    const s = String(raw)
                        .replace(/[\[\]\(\)\{\}'"]/g, " ")
                        .trim();

                    return s
                        .split(/[^0-9]+/)
                        .map((p) => p.trim())
                        .filter(Boolean);
                }

                jsonData.forEach((row, index) => {
                    const rowNum = index + 2; // Excel row index
                    const sno = String(row["Sno"] || "").trim();
                    const question = String(row["Question"] || "").trim();
                    const difficulty = String(row["Difficulty Level"] || "").trim();
                    const questionType = String(row["Question Type"] || "").trim();
                    const section = String(row["Section"] || "").trim();
                    const answerExplanation = String(row["Answer Explanation"] || "").trim();
                    let useAnswerExplanation = String(row["Use Answer Explanation"] || "")
                        .trim()
                        .toLowerCase();

                    if (useAnswerExplanation === "") useAnswerExplanation = "false";

                    const options = [
                        String(row["Option 1"] || "").trim(),
                        String(row["Option 2"] || "").trim(),
                        String(row["Option 3"] || "").trim(),
                        String(row["Option 4"] || "").trim(),
                        String(row["Option 5"] || "").trim(),
                        String(row["Option 6"] || "").trim(),
                    ];

                    if (!sno) errors.push(`Row ${rowNum}: Sno is required.`);
                    else {
                        if (seenSno.has(sno)) duplicateSno.push(sno);
                        seenSno.add(sno);
                    }

                    if (!question) errors.push(`Row ${rowNum}: Question cannot be empty.`);
                    else if (question.length > 500)
                        errors.push(`Row ${rowNum}: Question must not exceed 500 characters.`);

                    if (options.every((o) => o === ""))
                        errors.push(`Row ${rowNum}: At least one option must have a value.`);

                    if (!["1", "2", "3"].includes(difficulty))
                        errors.push(`Row ${rowNum}: Difficulty Level must be 1, 2, or 3.`);

                    if (!section) errors.push(`Row ${rowNum}: Section cannot be empty.`);
                    else if (section.length > 10)
                        errors.push(`Row ${rowNum}: Section must not exceed 10 characters.`);

                    if (answerExplanation.length > 500)
                        errors.push(`Row ${rowNum}: Answer Explanation must not exceed 500 characters.`);

                    if (!["true", "false"].includes(useAnswerExplanation))
                        errors.push(`Row ${rowNum}: Use Answer Explanation must be TRUE or FALSE.`);

                    if (!["Single Correct", "Multiple Correct"].includes(questionType))
                        errors.push(
                            `Row ${rowNum}: Question Type must be 'Single Correct' or 'Multiple Correct'.`
                        );

                    const parsedAnswers = parseCorrectAnswer(row["Correct Answer"]);
                    const uniqueAnswers = [...new Set(parsedAnswers)];

                    if (uniqueAnswers.length === 0)
                        errors.push(
                            `Row ${rowNum}: Correct Answer must contain at least one option number (1–6).`
                        );
                    else {
                        uniqueAnswers.forEach((ans) => {
                            if (!/^[1-6]$/.test(ans))
                                errors.push(
                                    `Row ${rowNum}: Correct Answer contains invalid option number: ${ans}`
                                );
                            else if (!options[Number(ans) - 1])
                                errors.push(
                                    `Row ${rowNum}: Correct Answer references Option ${ans} but that option is empty.`
                                );
                        });
                    }

                    if (questionType === "Single Correct" && uniqueAnswers.length !== 1)
                        errors.push(
                            `Row ${rowNum}: For Single Correct, Correct Answer must contain exactly ONE option number.`
                        );

                    if (questionType === "Multiple Correct" && uniqueAnswers.length < 2)
                        errors.push(
                            `Row ${rowNum}: For Multiple Correct, Correct Answer must contain at least TWO option numbers.`
                        );

                    if (useAnswerExplanation === "true" && !answerExplanation)
                        errors.push(
                            `Row ${rowNum}: Answer Explanation cannot be empty when Use Answer Explanation is TRUE.`
                        );
                    if (useAnswerExplanation === "false" && answerExplanation)
                        errors.push(
                            `Row ${rowNum}: Answer Explanation must be empty when Use Answer Explanation is FALSE.`
                        );
                });

                if (duplicateSno.length > 0)
                    errors.unshift(`Duplicate Sno values found: ${[...new Set(duplicateSno)].join(", ")}`);

                if (errors.length > 0) {
                    setValidationErrors(errors);
                    setLoading(false);
                    setProgress(0);

                    return;
                }

                const normalized = jsonData.map((row) => {
                    const opts = [
                        String(row["Option 1"] || "").trim(),
                        String(row["Option 2"] || "").trim(),
                        String(row["Option 3"] || "").trim(),
                        String(row["Option 4"] || "").trim(),
                        String(row["Option 5"] || "").trim(),
                        String(row["Option 6"] || "").trim(),
                    ];

                    const parsed = parseCorrectAnswer(row["Correct Answer"]);
                    const unique = [...new Set(parsed)].filter((v) => /^[1-6]$/.test(String(v)));
                    const filtered = unique.filter((ans) => opts[Number(ans) - 1] !== "");

                    return {
                        Sno: row["Sno"],
                        Question: String(row["Question"] || "").trim(),
                        Option1: opts[0],
                        Option2: opts[1],
                        Option3: opts[2],
                        Option4: opts[3],
                        Option5: opts[4],
                        Option6: opts[5],
                        DifficultyLevel: String(row["Difficulty Level"] || "").trim(),
                        CorrectAnswer: filtered.map(Number),
                        Section: String(row["Section"] || "").trim(),
                        AnswerExplanation: String(row["Answer Explanation"] || "").trim(),
                        UseAnswerExplanation: String(row["Use Answer Explanation"] || "").trim().toLowerCase() === "true",
                        QuestionType: String(row["Question Type"] || "").trim(),
                    };
                });

                setUploadData(normalized);
                setFileInput(selectedFile);
                setLoading(false);
                setProgress(100);
            } catch (err) {
                console.error("Error processing Excel file:", err);
                toast.error("Error processing the Excel file. Check the file and headers.");
                setLoading(false);
                setProgress(0);
                setUploadData([]);
                setData([]);
            }
        },
        onDropRejected: (rejectedFiles) => {
            setLoading(false);
            setProgress(0);
            setUploadData([]);
            setData([]);
            rejectedFiles.forEach((file) => {
                file.errors.forEach((error) => {
                    switch (error.code) {
                        case "file-invalid-type":
                            toast.error(`Invalid file type for ${file.file.name}`);
                            break;
                        case "file-too-large":
                            toast.error(`File ${file.file.name} is too large.`);
                            break;
                        default:
                            toast.error(`Error with file ${file.file.name}`);
                    }
                });
            });
        },
    });

    const handleDialogClose = () => {
        onClose();
    };

    const submitAnswer = async (dataToSend) => {


        try {
            const response = await fetch(
                `${API_URL}/company/quiz/question/${mId}/${activityId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataToSend)
                }
            );

            let datas = null;
            const text = await response.text();

            if (text) {
                try {
                    datas = JSON.parse(text);
                } catch (err) {
                    console.error("Invalid JSON from server:", text);
                    throw err;
                }
            }

            if (response.ok) {
                router.replace(`/${lang}/apps/quiz/${mId}/${activityId}`);
                toast.success(`Quiz has been imported`, { autoClose: 900 });
                onClose();
                handleClose();
            } else {
                console.error("Error:", datas || response.statusText);
                toast.error('Import failed. Check console for details.');
            }
        } catch (error) {
            console.error("Submit answer error:", error);
            toast.error('Unexpected error when sending data.');
            throw error;
        }
    };

    const handleUploadData = () => {
        if (uploadData && uploadData?.length > 0) {
            // For API expectation: adjust shape if required by backend; currently sending array of normalized objects
            submitAnswer(uploadData).then(() => {
                // Clear everything after save
                setData([]);
                setFileInput(null);
                setUploadData([]);
                setValidationErrors([]);
                setMissingHeaders([]);
                setLoading(false);
                setProgress(0);
                setRowSelection({});
                setGlobalFilter('');
            }).catch(() => {
                // keep data so user can fix/resubmit
            });
        } else {
            toast.error('No data to upload.');
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor('Sno', { header: 'Sno', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('Question', { header: 'Question', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('Option1', { header: 'Option 1', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('Option2', { header: 'Option 2', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('Option3', { header: 'Option 3', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('Option4', { header: 'Option 4', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('Option5', { header: 'Option 5', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('Option6', { header: 'Option 6', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('DifficultyLevel', { header: 'Difficulty Level', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('CorrectAnswer', { header: 'Correct Answer', cell: info => <Typography>{Array.isArray(info.getValue()) ? info.getValue().join(',') : String(info.getValue())}</Typography> }),
        columnHelper.accessor('Section', { header: 'Section', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('AnswerExplanation', { header: 'Answer Explanation', cell: info => <Typography>{info.getValue()}</Typography> }),
        columnHelper.accessor('UseAnswerExplanation', { header: 'Use Answer Explanation', cell: info => <Typography>{info.getValue() ? 'true' : 'false'}</Typography> }),
        columnHelper.accessor('QuestionType', { header: 'Question Type', cell: info => <Typography>{info.getValue()}</Typography> }),

    ], [srNoArr]);

    const table = useReactTable({
        data: uploadData || [],
        columns,
        state: { rowSelection, globalFilter },
        filterFns: { fuzzy: fuzzyFilter },
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    const TableImportComponent = () => (
        <Card className='mt-4'>
            <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
                <div className='flex items-center gap-2'>
                    <Typography>Show</Typography>
                    <CustomTextField
                        select
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                        className='max-sm:is-full sm:is-[70px]'
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={200}>200</MenuItem>
                    </CustomTextField>
                </div>
                <DebouncedInput
                    value={globalFilter ?? ''}
                    className='max-sm:is-full min-is-[250px]'
                    onChange={value => setGlobalFilter(String(value))}
                    placeholder='Search Question'
                />
            </CardContent>
            <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        <div
                                            className={classnames({
                                                'flex items-center': true,
                                                'cursor-pointer': header.column.getCanSort()
                                            })}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() === 'asc' && <i className='tabler-chevron-up text-xl' />}
                                            {header.column.getIsSorted() === 'desc' && <i className='tabler-chevron-down text-xl' />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows?.length === 0 ? (
                            <tr>
                                <td colSpan={columns?.length} className='text-center'>No data available</td>
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
        <Dialog fullWidth maxWidth='lg' scroll='body' open={open} onClose={onClose} sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>
            <DialogCloseButton onClick={onClose}><i className="tabler-x" /></DialogCloseButton>
            <DialogTitle variant='h4' className='text-center'>Import Quiz Question</DialogTitle>

            <Card>
                <CardContent>
                    <Alert severity='info'>Note: Allowed only Excel files with *.xls or *.xlsx extension.</Alert>
                    {missingHeaders?.length > 0 && (
                        <Alert severity='error'>Missing Headers: {missingHeaders.join(', ')}</Alert>
                    )}
                    {validationErrors?.length > 0 && (
                        <Alert severity='error' className='mt-2'>
                            {validationErrors.map((err, idx) => <div key={idx}>{err}</div>)}
                        </Alert>
                    )}
                    <Typography className='mt-3'>
                        Use this format:
                        <span style={{ marginLeft: '0.5rem' }}>
                            <Button variant='outlined' href="/sample/QuizSection.xlsx" download>Download sample file</Button>
                        </span>
                    </Typography>
                </CardContent>

                <CardContent>
                    <AppReactDropzone>
                        <div {...getRootProps()} className='dropzone'>
                            <input {...getInputProps()} />
                            <div className='flex items-center flex-col'>
                                <Avatar variant='rounded' className='bs-12 is-12 mbe-9'><i className='tabler-upload' /></Avatar>
                                <Typography variant='h4'>Drop files here or click to upload</Typography>
                                <Typography>Allowed *.xls, *.xlsx – Max 2 MB</Typography>
                            </div>
                        </div>

                        {loading && <LinearProgress variant='determinate' color='success' value={progress} />}

                        {fileInput && (
                            <List className='mt-3'>
                                <ListItem>
                                    <div className='file-details'>
                                        <div className='file-preview'><i className='vscode-icons-file-type-excel w-6 h-6' /></div>
                                        <Typography>{fileInput.name}</Typography>
                                    </div>
                                    <IconButton onClick={handleRemoveFile}><i className='tabler-x text-xl' /></IconButton>
                                </ListItem>
                            </List>
                        )}

                        {uploadData && uploadData?.length > 0 && <TableImportComponent />}
                    </AppReactDropzone>
                </CardContent>
            </Card>

            <DialogActions className='justify-center'>
                {uploadData && uploadData?.length > 0 && missingHeaders?.length === 0 && validationErrors?.length === 0 && (
                    <Button variant='contained' onClick={handleUploadData}>Start Import</Button>
                )}
                <Button variant='tonal' type='button' color='secondary' onClick={handleDialogClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportQuizModal

