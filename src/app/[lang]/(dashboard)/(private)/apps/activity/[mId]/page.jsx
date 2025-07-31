'use client'

import { useEffect, useState, useMemo } from "react"

import { useRouter } from "next/navigation"

import { useParams } from "next/navigation"

import { useSession } from "next-auth/react"

import {
    Box,
    Button,
    Card,
    InputBase,
    Dialog,
    DialogActions,
    CardContent,
    Avatar,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
    Typography,
    IconButton,
    TextField,
    DialogTitle,
    MenuItem,
    Switch,
    InputAdornment,
    Tab,
    DialogContent,
    CircularProgress,
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { useDropzone } from 'react-dropzone'

import { valibotResolver } from '@hookform/resolvers/valibot'

import {
    object,
    string,
    pipe,
    maxLength,
    minLength,
    regex
} from 'valibot'

import { useForm, Controller } from 'react-hook-form'

import { TabContext, TabList, TabPanel } from "@mui/lab"

import { toast } from "react-toastify"

import { Document, Page, pdfjs } from 'react-pdf'

import PermissionGuard from "@/hocs/PermissionClientGuard"

import AppReactDropzone from '@/libs/styles/AppReactDropzone'

import DialogCloseButton from "@/components/dialogs/DialogCloseButton"

import CustomTextField from "@/@core/components/mui/TextField"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const ShowFileModal = ({ open, setOpen, docURL }) => {
    const router = useRouter()
    const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL
    const fullURL = `${ASSET_URL}/activity/${docURL}`
    const ext = docURL?.split('.').pop()?.toLowerCase()
    const backURL = '/activities'

    const [numPages, setNumPages] = useState(null)
    const [isOnlineEnv, setIsOnlineEnv] = useState(false)

    useEffect(() => {
        // Setup PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

        if (typeof window !== 'undefined') {
            setIsOnlineEnv(!window.location.origin.includes('localhost'))
        }
    }, [])

    const handleClose = () => setOpen(false)

    const isPDF = ext === 'pdf'
    const isOfficeFile = ['doc', 'docx', 'ppt', 'pptx'].includes(ext)

    const officeViewerURL = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullURL)}`
    const googleViewerURL = `https://docs.google.com/gview?url=${encodeURIComponent(fullURL)}&embedded=true`

    return (
        <Dialog open={open} fullWidth maxWidth="md" onClose={handleClose}>
            <DialogTitle>Document Preview</DialogTitle>

            <DialogContent dividers sx={{ minHeight: 600 }}>
                {isPDF ? (
                    <Document
                        file={fullURL}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        onLoadError={(err) => console.error('PDF Load Error:', err)}
                    >
                        <Grid container spacing={2}>
                            {Array.from({ length: numPages }, (_, i) => (
                                <Grid item xs={12} sm={6} md={4} key={i}>
                                    <Box
                                        p={2}
                                        border="1px solid #ccc"
                                        borderRadius={2}
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                        boxShadow={2}
                                        height="100%"
                                        bgcolor="#f9f9f9"
                                    >
                                        <Page
                                            pageNumber={i + 1}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={false}
                                            width={250}
                                        />
                                        <Typography variant="caption" fontWeight="bold" mt={2}>
                                            Page {i + 1}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Document>
                ) : isOfficeFile && isOnlineEnv ? (
                    <iframe
                        src={officeViewerURL}
                        style={{ width: '100%', height: '600px', border: 'none' }}
                        title="Office Viewer"
                    />
                ) : isOfficeFile && !isOnlineEnv ? (
                    <iframe
                        src={googleViewerURL}
                        style={{ width: '100%', height: '600px', border: 'none' }}
                        title="Google Viewer"
                    />
                ) : (
                    <Typography variant="body2">
                        File preview not supported.{' '}
                        <a href={fullURL} target="_blank" rel="noopener noreferrer">
                            Click here to download
                        </a>
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
                <Button variant="contained">Submit</Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                        handleClose()
                        router.push(backURL)
                    }}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const ActivityModal = ({ open, id, setISOpen, editData, API_URL, token, mId, activityId }) => {
    const router = useRouter()
    const backURL = '/activities'

    const [preview, setPreview] = useState()
    const [imageError, setImageError] = useState()
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState()

    const isYoutube = id === '688723af5dd97f4ccae68836'

    const schema = object({
        title: pipe(
            string(),
            minLength(1, 'Title is required'),
            maxLength(100, 'Title can be max of 100 length'),
            regex(/^[A-Za-z0-9\s]+$/, 'Only alphabet and number allowed')
        ),
        live_session_type: string(),
        video_url: isYoutube
            ? pipe(
                string(),
                minLength(1, 'Video URL is required'),
                maxLength(200, 'Video URL too long'),
                regex(
                    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/,
                    'Enter a valid YouTube URL'
                )
            )
            : pipe(string())
    })

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: valibotResolver(schema),
        defaultValues: {
            title: editData?.title || '',
            video_url: editData?.video_url || '',
            live_session_type: ''
        }
    })

    useEffect(() => {
        if (editData?.file_url) {
            setPreview(editData.file_url)
        }
    }, [editData])

    const getFileConfig = () => {
        if (id === '688723af5dd97f4ccae68834') {
            return {
                accept: {
                    'application/pdf': ['.pdf'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                    'application/msword': ['.doc']
                },
                maxSize: 5 * 1024 * 1024,
                type: 'Document'
            }
        }

        if (id === '688723af5dd97f4ccae68835') {
            return {
                accept: { 'video/mp4': ['.mp4'] },
                maxSize: 500 * 1024 * 1024,
                type: 'Video'
            }
        }

        if (id === '688723af5dd97f4ccae68837') {
            return {
                accept: { 'application/zip': ['.zip'] },
                maxSize: 500 * 1024 * 1024,
                type: 'SCORM Content'
            }
        }

        if (id === '688723af5dd97f4ccae68836') {
            return { type: 'Youtube videos' }
        }

        return { accept: {}, maxSize: 0, type: '' }
    }

    const fileConfig = getFileConfig()

    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        maxSize: fileConfig.maxSize,
        accept: fileConfig.accept,
        onDrop: (acceptedFiles) => {
            if (!acceptedFiles.length) return
            const selectedFile = acceptedFiles[0]

            setFile(selectedFile)
            setImageError('')

            if (fileConfig.type === 'Video') {
                setPreview(URL.createObjectURL(selectedFile))
            } else {
                setPreview(null)
            }
        },
        onDropRejected: (rejectedFiles) => {
            rejectedFiles.forEach(file => {
                file.errors.forEach(error => {
                    let msg = ''

                    switch (error.code) {
                        case 'file-invalid-type':
                            msg = `Invalid file type for ${fileConfig.type}.`
                            break
                        case 'file-too-large':
                            msg = `File is too large. Max allowed size is ${fileConfig.maxSize / (1024 * 1024)}MB.`
                            break
                        case 'too-many-files':
                            msg = `Only one ${fileConfig.type} can be uploaded.`
                            break
                        default:
                            msg = `There was an issue with the uploaded file.`
                    }

                    toast.error(msg)
                    setImageError(msg)
                })
            })
        }
    })

    const handleDataSave = async (data) => {

        if (!isYoutube && !file && !editData?.file_url) {
            setImageError(`Please upload a ${fileConfig.type.toLowerCase()}.`)

            return
        }

        setLoading(true)

        try {

            const formData = new FormData()

            formData.append('title', data.title)

            formData.append('file_type', fileConfig.type)

            if (file) formData.append('file', file)
            if (isYoutube) formData.append('video_url', data.video_url)

            const response = await fetch(`${API_URL}/company/activity/data/${mId}/${id}/${activityId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            })

            const result = await response.json()

            if (response.ok) {

                toast.success(`${fileConfig.type} uploaded successfully`)
                handleClose()
                setISOpen(false)
            }

        } catch (error) {
            toast.error('Upload failed')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFile()
        setPreview()
        setImageError()
        reset({ title: '', video_url: '', live_session_type: '' })
        setISOpen(false)
    }

    return (
        <Dialog open={open} fullWidth maxWidth="md" sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>
            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className="tabler-x"></i>
            </DialogCloseButton>

            <DialogTitle>Upload {fileConfig.type}</DialogTitle>

            <form
                onSubmit={(e) => {
                    handleSubmit(handleDataSave)(e)
                }}
                noValidate
            >
                <DialogContent>
                    <Grid container spacing={5}>
                        <Grid item size={{ xs: 12 }}>
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        label="Title*"
                                        placeholder="Enter title"
                                        error={!!errors.title}
                                        helperText={errors.title?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {!isYoutube && (
                            <Grid item size={{ xs: 12 }}>
                                <Typography variant="body1" fontWeight={500} gutterBottom>
                                    {fileConfig.type} <span>*</span>
                                </Typography>

                                <AppReactDropzone>
                                    <div
                                        {...getRootProps()}
                                        style={{
                                            minHeight: '150px',
                                            border: '2px dashed #ccc',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1rem'
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        <Avatar variant="rounded" className="bs-12 is-12 mbe-1">
                                            <i className="tabler-upload" />
                                        </Avatar>

                                        <Typography variant="body2">
                                            {fileConfig.type === 'Document' &&
                                                'Allowed *.pdf, *.pptx, *.docx, *.doc. Max 1 file, max 5MB'}
                                            {fileConfig.type === 'Video' &&
                                                'Allowed *.mp4. Max 1 file, max 500MB'}
                                            {fileConfig.type === 'SCORM Content' &&
                                                'Allowed *.zip. Max 1 file, max 500MB'}
                                        </Typography>

                                        {(file || editData?.file_url) && (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <Avatar variant="rounded" sx={{ bgcolor: '#f5f5f5', color: '#0A2E73', width: 48, height: 48 }}>
                                                    {(file?.name || editData?.file_url || '').endsWith('.pdf') ||
                                                        (file?.name || editData?.file_url || '').endsWith('.doc') ||
                                                        (file?.name || editData?.file_url || '').endsWith('.docx') ||
                                                        (file?.name || editData?.file_url || '').endsWith('.pptx') ? (
                                                        <i className="tabler-file-description" />
                                                    ) : (file?.name || editData?.file_url || '').endsWith('.mp4') ? (
                                                        <i className="tabler-video" />
                                                    ) : (file?.name || editData?.file_url || '').endsWith('.zip') ? (
                                                        <i className="tabler-archive" />
                                                    ) : (
                                                        <i className="tabler-file" />
                                                    )}
                                                </Avatar>

                                                <Typography variant="body2" fontWeight={500}>
                                                    {file?.name || editData?.file_url}
                                                </Typography>

                                                <Typography variant="caption" color="textSecondary">
                                                    {file && `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                                </Typography>
                                            </div>
                                        )}

                                        {imageError && (
                                            <Typography variant="caption" color="var(--mui-palette-error-main)" sx={{ mt: 1 }}>
                                                {imageError}
                                            </Typography>
                                        )}
                                    </div>
                                </AppReactDropzone>
                            </Grid>
                        )}

                        {isYoutube && (
                            <Grid item size={{ xs: 12 }}>
                                <Controller
                                    name="video_url"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label="Video URL*"
                                            placeholder="Enter Video URL"
                                            error={!!errors.video_url}
                                            helperText={errors.video_url?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ blockSize: 40, position: 'relative' }}
                    >
                        {loading ? (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: 'white',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px'
                                }}
                            />
                        ) : (
                            'Submit'
                        )}
                    </Button>
                    <Button variant="tonal" color="error" onClick={() => router.push(backURL)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

const ContentFlowComponent = ({ setOpen, activities, API_URL, token, fetchActivities, mId }) => {
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingError, setEditingError] = useState("");
    const [selectedId, setSelectedId] = useState()
    const [isOpen, setISOpen] = useState(false);
    const [activityId, setActivityId] = useState();
    const [docURL, setDocURL] = useState()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleChangeName = async (id) => {

        const data = { title: editingTitle };

        try {
            const response = await fetch(`${API_URL}/company/activity/set-name/${mId}/${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success("Activity name saved successfully", { autoClose: 1000 });
                fetchActivities();
            } else {
                const result = await response.json();

                toast.error(result.message || "Failed to update name");
            }
        } catch (error) {
            toast.error("Error updating activity name");
        }

    };

    const handleSave = async (id) => {

        if (!editingTitle.trim()) {
            setEditingError("Title is required");

            return;
        }

        if (editingTitle.length > 150) {
            setEditingError("Title cannot exceed 150 characters");

            return;
        }

        setEditingError("");
        await handleChangeName(id);
        setEditingId(null);
        setEditingTitle("");
    };

    const handleEditClick = (activity) => {
        setEditingId(activity._id);
        setEditingTitle(activity?.name || activity?.activity_type?.activity_data?.title || "");
        setEditingError("");
    };

    const handleActivity = () => setOpen(true);

    const handleDeleteContent = async (id) => {
        try {
            const response = await fetch(`${API_URL}/company/activity/delete/${mId}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
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

    return (
        <Box p={3}>
            <Grid container spacing={3}>
                <Grid item size={{ xs: 12, md: 8 }}>
                    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
                        {activities && activities.length > 0 ? (
                            activities.map((activity, index) => (
                                <Card
                                    key={index}
                                    variant="outlined"
                                    sx={{
                                        borderColor: '#0A2E73',
                                        borderRadius: 2,
                                        p: 2,
                                        mb: 4,
                                        mt: 1,
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        '&:hover': {
                                            boxShadow: 3,
                                            transform: 'translateY(-2px)',
                                            borderColor: '#0845b3',
                                        },
                                    }}
                                >
                                    <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                                        <Grid item xs>
                                            <Box display="flex" alignItems="flex-start" gap={2}>
                                                <Box
                                                    sx={{
                                                        inlineSize: 40,
                                                        blockSize: 40,
                                                        cursor: 'pointer', // Makes it clear it's clickable
                                                        '& svg': {
                                                            transform: 'scale(0.6)',
                                                            transformOrigin: 'center',
                                                            display: 'block',
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        console.log(activity?.module_type_id);

                                                        if (activity.module_type_id == '688723af5dd97f4ccae68834') {
                                                            if (activity.document_data.image_url) {
                                                                setIsModalOpen(true)
                                                                setDocURL(activity.document_data.image_url)
                                                            } else {
                                                                setISOpen(true)
                                                                setActivityId(activity._id)
                                                                setSelectedId(activity.module_type_id)
                                                            }
                                                        } else {
                                                            console.log("Hu");

                                                            setISOpen(true)
                                                            setActivityId(activity._id)
                                                            setSelectedId(activity.module_type_id)
                                                        }
                                                    }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: activity?.activity_type?.activity_data?.svg_content,
                                                    }}
                                                />
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography component="div" fontWeight={600}>
                                                            <Box ml={1} display="flex" alignItems="center" color="#0A2E73">
                                                                {editingId === activity._id ? (
                                                                    <>
                                                                        <Box>
                                                                            <InputBase
                                                                                value={editingTitle}
                                                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                                                sx={{
                                                                                    fontWeight: 600,
                                                                                    fontSize: 16,
                                                                                    borderBottom: editingError
                                                                                        ? '1px solid red'
                                                                                        : '1px solid #ccc',
                                                                                    mr: 1,
                                                                                    width: '100%',
                                                                                }}
                                                                                autoFocus
                                                                                placeholder="Enter title"
                                                                            />
                                                                            {editingError && (
                                                                                <Typography variant="caption" color="var(--mui-palette-error-main)" ml={0.5}>
                                                                                    {editingError}
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                        <IconButton
                                                                            onClick={() => handleSave(activity._id)}
                                                                            size="small"
                                                                            sx={{ color: "#0A2E73", ml: 1 }}
                                                                        >
                                                                            <i className="tabler-check" />
                                                                        </IconButton>
                                                                    </>
                                                                ) : (
                                                                    <Typography
                                                                        component="div"
                                                                        fontWeight={600}
                                                                        display="flex"
                                                                        alignItems="center"
                                                                    >
                                                                        {activity?.name || activity?.activity_type?.activity_data?.title}
                                                                        <IconButton
                                                                            onClick={() => handleEditClick(activity)}
                                                                            size="small"
                                                                            sx={{ ml: 1, color: "#0A2E73" }}
                                                                        >
                                                                            <i className="tabler-edit" style={{ fontSize: 18 }} />
                                                                        </IconButton>
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Typography>
                                                    </Box>

                                                    <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
                                                        {activity.description}
                                                    </Typography>

                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        sx={{
                                                            mt: 1,
                                                            fontSize: '0.75rem',
                                                            textTransform: 'none',
                                                            backgroundColor: '#00b66c',
                                                            '&:hover': { backgroundColor: '#009956' },
                                                            borderRadius: 10,
                                                            px: 2,
                                                            minWidth: 'unset',
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
                                                sx={{ color: '#0A2E73' }}
                                                onClick={() => handleDeleteContent(activity._id)}
                                            >
                                                <i className="tabler-trash" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                    <ShowFileModal
                                        open={isModalOpen}
                                        setOpen={setIsModalOpen}
                                        docURL={docURL}
                                    />
                                    <ActivityModal
                                        open={isOpen}
                                        id={selectedId}
                                        setISOpen={setISOpen}
                                        editData={activity}
                                        API_URL={API_URL}
                                        token={token}
                                        mId={mId}
                                        activityId={activityId}
                                    />
                                </Card>
                            ))
                        ) : (
                            <Typography textAlign="center">No activity found</Typography>
                        )}
                    </Box>
                </Grid>

                {/* Right Side: Settings */}
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Box display="flex" justifyContent="flex-start" gap={2} mb={2}>
                        <Button variant="contained" color="primary" onClick={handleActivity}>
                            Add Activity
                        </Button>
                    </Box>

                    <RadioGroup defaultValue="any" sx={{ mb: 3 }}>
                        <FormControlLabel
                            value="ordered"
                            control={<Radio />}
                            label="Learner needs to follow the order"
                        />
                        <FormControlLabel
                            value="any"
                            control={<Radio />}
                            label="Learner can attempt any order"
                        />
                    </RadioGroup>

                    <Typography variant="subtitle1" gutterBottom>
                        On completion of Module launch the following
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={2}>
                        <FormControlLabel
                            control={<Checkbox />}
                            label={
                                <Box display="flex" alignItems="center">
                                    Certificate
                                    <Button size="small" sx={{ ml: 2 }} variant="outlined">
                                        Quick Preview
                                    </Button>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            control={<Checkbox />}
                            label={
                                <Box display="flex" alignItems="center">
                                    Feedback survey
                                    <Button size="small" sx={{ ml: 2 }} variant="text">
                                        Add A Survey
                                    </Button>
                                </Box>
                            }
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

const SettingComponent = () => {
    return (
        <Grid container spacing={4}>
            <Grid item size={{ xs: 12, md: 9 }}>
                <Typography variant="h6" gutterBottom>Push Enrollment Settings</Typography>
                <RadioGroup defaultValue="select_learners" sx={{ mb: 3 }}>
                    <FormControlLabel
                        value="all_existing_new"
                        control={<Radio />}
                        label="To all existing & new Learners on this Content Folder"
                    />
                    <FormControlLabel
                        value="all_with_criteria"
                        control={<Radio />}
                        label="To all existing & new Learners under this Content Folder who meet Target audience criteria"
                    />
                    <FormControlLabel
                        value="select_learners"
                        control={<Radio />}
                        label="Let me select Learners while publishing"
                    />
                </RadioGroup>

                <Typography variant="h6" gutterBottom>Self-Enrollment Settings</Typography>
                <RadioGroup defaultValue="no_self_enroll" sx={{ mb: 3 }}>
                    <FormControlLabel
                        value="no_self_enroll"
                        control={<Radio />}
                        label="Do not allow self enrollment"
                    />
                    <FormControlLabel
                        value="anyone"
                        control={<Radio />}
                        label="Allow any Learner to self-enrol"
                    />
                    <FormControlLabel
                        value="target_criteria"
                        control={<Radio />}
                        label='Allow Learners who meet the "target audience" criteria below to self-enrol'
                    />
                </RadioGroup>

                <Typography variant="h6" gutterBottom>This Module Is Targeted At</Typography>
                <Grid container spacing={2} alignItems="center" mb={3}>
                    <Grid item size={{ xs: 8 }}>
                        <TextField select label="Designation" fullWidth size="small" defaultValue="">
                            <MenuItem value="" disabled>Select Designation</MenuItem>
                            <MenuItem value="Manager">Manager</MenuItem>
                            <MenuItem value="Trainer">Trainer</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item size={{ xs: 4 }}>
                        <Button variant="contained" fullWidth>+ Add</Button>
                    </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom>Due Date Settings</Typography>
                <FormControlLabel
                    control={<Checkbox />}
                    label="Lock Module Post Due Date"
                />
                <RadioGroup defaultValue="relative" sx={{ mt: 1, mb: 2 }}>
                    <FormControlLabel value="fixed" control={<Radio />} label="Fixed due date" />
                    <FormControlLabel
                        value="relative"
                        control={<Radio />}
                        label={
                            <Box display="flex" alignItems="center">
                                Learners need to complete the Module within&nbsp;
                                <TextField
                                    size="small"
                                    type="number"
                                    defaultValue={5}
                                    sx={{ width: 80 }}
                                />
                                &nbsp;days post enrollment
                            </Box>
                        }
                    />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: 'block' }}>
                    Changing the due date updates it for all Learners, including those who were added earlier.
                </Typography>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Communication Settings</Typography>
                    <Switch defaultChecked />
                </Box>
                <Button variant="outlined" sx={{ mt: 1 }}>
                    Set completion reminder emails
                </Button>
            </Grid>

            <Grid item size={{ xs: 12, md: 3 }}>
                <Box
                    sx={{
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        p: 2,
                        height: 'fit-content',
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={600}>
                        Leaderboard Points
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Completing this Module
                    </Typography>
                    <TextField
                        type="number"
                        defaultValue={5}
                        size="small"
                        fullWidth
                        sx={{ mt: 1 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">🏆</InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Grid>
        </Grid>
    )
}

const ContentFlowModal = ({ open, data, setOpen, setSelected, selected, setNext, API_URL, token, mId, fetchActivities }) => {

    const handleChange = (selectedItem) => {
        setSelected(selectedItem?._id);
    }

    const submitActivity = async () => {
        try {
            const response = await fetch(`${API_URL}/company/activity/form/${mId}/${selected}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await response.json();

            if (response.ok) {
                const value = result?.data;

                toast.success("Activity added successfully", {
                    autoClose: 1000
                })
                fetchActivities()
                setSelected()
                setOpen(false)
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    const handleNext = () => {
        submitActivity();
        setNext(true)
    }

    return (
        <>
            <Dialog
                fullWidth
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                scroll="body"
                closeAfterTransition={false}
                sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
            >
                <DialogCloseButton onClick={() => {
                    setOpen(false)
                    setSelected()
                }} disableRipple>
                    <i className="tabler-x" />
                </DialogCloseButton>

                <DialogTitle
                    variant="h4"
                    className="flex flex-col gap-2 text-center sm:pbs-5 sm:pbe-5 sm:pli-5"
                >
                    <Typography component="span" className="flex flex-col items-center">
                        Select any Activity to create
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ px: 2 }}>
                        <RadioGroup
                            name="custom-radios-icons"
                            value={selected || ''}
                            onChange={(e) => {
                                console.log(e.target.value);

                                const selectedItem = data?.appConfig?.activity_data?.find(
                                    (item) => item.title === e.target.value
                                )

                                handleChange(selectedItem)
                            }}
                        >
                            <Grid container spacing={4}>
                                {data?.appConfig?.activity_data?.map((item, index) => {
                                    const isSelected = selected === item._id

                                    return (
                                        <Grid item size={{ xs: 12, sm: 3 }} key={index}>
                                            <Card
                                                variant="outlined"
                                                onClick={() => item.status && handleChange(item)}
                                                sx={{
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    opacity: item.status ? 0.5 : 1,
                                                    borderColor: isSelected ? 'primary.main' : 'grey.300',
                                                    '&:hover': {
                                                        borderColor: item.status ? 'primary.main' : 'grey.300', // ✅ Prevent color change if disabled
                                                    },
                                                }}
                                            >
                                                <CardContent
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        gap: 1.5,
                                                        px: 2,
                                                        py: 3,
                                                    }}
                                                >
                                                    <Box
                                                        component="div"
                                                        sx={{ inlineSize: 40, blockSize: 40 }}
                                                        color={"black"}
                                                        dangerouslySetInnerHTML={{ __html: item.svg_content }}
                                                    />

                                                    <Radio
                                                        color="primary"
                                                        checked={isSelected}
                                                        value={item.title}
                                                    />

                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={1000} color="black">
                                                            {item.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="black">
                                                            {item.description}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>

                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </RadioGroup>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button variant="outlined" disabled={!selected} onClick={handleNext}>
                        Next
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

const AcitivityCard = () => {
    const [value, setValue] = useState('content_flow')
    const handleTabChange = (e, value) => setValue(value)
    const [data, setData] = useState();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const { data: session } = useSession();
    const token = session?.user?.token;
    const { lang: locale, mId: mId } = useParams()
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState();
    const [next, setNext] = useState(false);
    const [activity, setActivity] = useState()

    const fetchActivities = async () => {
        try {
            const response = await fetch(`${API_URL}/company/activity/${mId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await response?.json();

            if (response.ok) {

                const value = result?.data;

                setActivity(value)
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    const fetchFormData = async () => {
        try {
            const response = await fetch(`${API_URL}/company/activity/create/data`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await response?.json();

            if (response.ok) {

                const value = result?.data;

                setData(value)
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    useEffect(() => {
        if (API_URL && token) {
            fetchFormData();
            fetchActivities()
        }
    }, [API_URL, token])

    return (
        <PermissionGuard locale={locale} element={'isCompany'}>
            <Card>
                <CardContent>

                    <TabContext value={value}>
                        <TabList
                            variant='scrollable'
                            onChange={handleTabChange}
                            className='border-b px-0 pt-0'
                        >
                            <Tab key={1} label='Content Flow' value='content_flow' />
                            <Tab key={2} label='Setting' value='setting' />
                        </TabList>

                        <Box mt={3}>
                            <TabPanel value='content_flow' className='p-0'>
                                <ContentFlowComponent setOpen={setOpen} activities={activity} API_URL={API_URL} token={token} fetchActivities={fetchActivities} mId={mId} />
                            </TabPanel>
                            <TabPanel value='setting' className='p-0'>
                                <SettingComponent />
                            </TabPanel>
                        </Box>
                    </TabContext>
                </CardContent>
            </Card>
            <ContentFlowModal open={open} setOpen={setOpen} data={data} setSelected={setSelected} selected={selected} setNext={setNext} API_URL={API_URL} token={token} mId={mId} fetchActivities={fetchActivities} />
        </PermissionGuard>
    )
}

export default AcitivityCard;
