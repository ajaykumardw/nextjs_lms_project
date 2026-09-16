import { useEffect, useState } from "react"

import { useParams, useRouter } from "next/navigation"

import { Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"

import Grid from "@mui/material/Grid2"

import { Controller, useForm } from "react-hook-form"

import { toast } from "react-toastify"

import { maxLength, minLength, object, pipe, regex, string } from "valibot"

import { useDropzone } from "react-dropzone"
import { valibotResolver } from "@hookform/resolvers/valibot"

import ReactPlayer from 'react-player'

import axios from "axios";

import CustomTextField from "@/@core/components/mui/TextField"

import ImportQuizModal from "./ImportQuizModal"
import QuizCard from "../Engage/QuizCard"
import DialogCloseButton from "@/components/dialogs/DialogCloseButton"

const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''

const ActivityModal = ({
    open,
    id,
    setISOpen,
    editData,
    API_URL,
    token,
    mId,
    activityId,
    fetchActivities
}) => {

    const { lang } = useParams()

    const router = useRouter()

    const [preview, setPreview] = useState()
    const [imageError, setImageError] = useState('')
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState()
    const [validatingScorm, setValidatingScorm] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const [isModalOpen, setIsModalOpen] = useState(false)

    const isYoutube = id == '688723af5dd97f4ccae68836'
    const isVideo = id == '688723af5dd97f4ccae68835'
    const isScrom = id == '688723af5dd97f4ccae68837'
    const isQuiz = id == '68886902954c4d9dc7a379bd'

    const schema = object({
        title: pipe(
            string(),
            minLength(1, 'Title is required'),
            maxLength(100, 'Title can be max of 100 characters'),
            regex(/^[A-Za-z0-9\s]+$/, 'Only letters and numbers allowed')
        ),
        live_session_type: pipe(),
        video_url: (isYoutube || isVideo)
            ? pipe(
                minLength(1, 'Video URL is required'),
                maxLength(200, 'Video URL too long'),
                regex(
                    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/,
                    'Enter a valid YouTube URL'
                )
            )
            : pipe()
    })

    const {
        reset,
        control,
        watch,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: valibotResolver(schema),
        defaultValues: {
            title: '',
            video_url: '',
            live_session_type: ''
        }
    })

    useEffect(() => {

        if (editData && open) {

            if (isYoutube || isVideo) {

                reset({
                    title: editData?.video_data?.title || '',
                    video_url: editData?.video_data?.video_url || '',
                    live_session_type: ''
                })

            } else if (isScrom) {

                reset({
                    title: editData?.scorm_data?.title || '',
                    video_url: '',
                    live_session_type: ''
                })

            } else {

                reset({
                    title: editData?.title || '',
                    video_url: '',
                    live_session_type: ''
                })

                setPreview(editData?.file_url)
            }
        }

    }, [editData, open])

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
                accept: {
                    'video/mp4': ['.mp4']
                },
                maxSize: 500 * 1024 * 1024,
                type: 'Video'
            }
        }

        if (id === '688723af5dd97f4ccae68837') {

            return {
                accept: {
                    'application/zip': ['.zip']
                },
                maxSize: 500 * 1024 * 1024,
                type: 'SCORM Content'
            }
        }

        if (id === '688723af5dd97f4ccae68836') {
            return {
                type: 'Youtube videos'
            }
        }

        if (isQuiz) {

            return {
                accept: {
                    'application/zip': ['.zip']
                },
                maxSize: 500 * 1024 * 1024,
                type: 'Objective Quiz'
            }
        }

        return {
            accept: {},
            maxSize: 0,
            type: ''
        }
    }

    const fileConfig = getFileConfig()

    const {
        getRootProps,
        getInputProps
    } = useDropzone({

        multiple: false,
        maxSize: fileConfig.maxSize,
        accept: fileConfig.accept,

        onDrop: async (acceptedFiles) => {

            if (!acceptedFiles?.length) return

            const selectedFile = acceptedFiles[0]

            setFile(null)
            setImageError('')
            setPreview(null)

            const fileName = selectedFile.name.toLowerCase()

            if (
                fileConfig.type === 'SCORM Content' &&
                !fileName.endsWith('.zip')
            ) {

                const msg = 'Only ZIP files are allowed.'

                toast.error(msg)

                setImageError(msg)

                return
            }

            setFile(selectedFile)

            if (fileConfig.type === 'Video') {

                setPreview(
                    URL.createObjectURL(selectedFile)
                )
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
                            msg = 'There was an issue with the uploaded file.'
                    }

                    toast.error(msg)

                    setImageError(msg)
                })
            })
        }
    })

    const handleDataSave = async (data) => {

        const isEdit = !!editData

        const requiresFile =
            !isYoutube &&
            !isVideo &&
            !isScrom &&
            (!file && (!isEdit || !editData?.file_url))

        if (requiresFile) {

            setImageError(
                `Please upload a ${fileConfig.type.toLowerCase()}.`
            )

            return
        }

        setLoading(true)

        try {

            const formData = new FormData()

            formData.append('title', data.title)

            formData.append(
                'file_type',
                fileConfig.type
            )

            if (file) {
                formData.append('file', file)
            }

            if (isYoutube) {
                formData.append(
                    'video_url',
                    data.video_url
                )
            }

            await axios.post(
                `${API_URL}/company/activity/data/${mId}/${id}/${activityId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },

                    timeout: 0,

                    maxBodyLength: Infinity,

                    maxContentLength: Infinity,

                    onUploadProgress: (progressEvent) => {

                        if (!progressEvent.total) return

                        const percent = Math.round(
                            (progressEvent.loaded * 100) /
                            progressEvent.total
                        )

                        setUploadProgress(percent)

                        console.log(
                            `Upload Progress: ${percent}%`
                        )
                    }
                }
            )

            toast.success(
                `${fileConfig.type} uploaded successfully`,
                {
                    autoClose: 1000
                }
            )

            fetchActivities()

            handleClose()

            setISOpen(false)

        } catch (error) {

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                'Upload failed'
            )

        } finally {

            setLoading(false)
            setUploadProgress(0)
        }
    }

    const handleClose = () => {

        setFile()
        setPreview()
        setImageError('')
        setUploadProgress(0)

        reset({
            title: '',
            video_url: '',
            live_session_type: ''
        })

        setISOpen(false)
    }

    const onClose = () => {
        setIsModalOpen(false)
    }

    return (
        <Dialog
            open={open}
            fullWidth
            onClose={handleClose}
            maxWidth="lg"
            sx={{
                "& .MuiDialog-paper": {
                    overflow: "visible"
                }
            }}
        >
            <DialogTitle>
                Upload {fileConfig.type}
            </DialogTitle>

            <DialogCloseButton onClick={handleClose}><i className="tabler-x" /></DialogCloseButton>

            <form
                onSubmit={handleSubmit(handleDataSave)}
                noValidate
            >
                <DialogContent>

                    <Grid container spacing={5}>

                        {isQuiz && (
                            <Box
                                py={4}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Grid
                                    container
                                    spacing={4}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <QuizCard
                                        title="Import from Spreadsheet"
                                        onClick={() => {
                                            setIsModalOpen(true)
                                        }}
                                    />

                                    <QuizCard
                                        title="Create Manually"
                                        onClick={() => {
                                            router.replace(
                                                `/${lang}/apps/ilt-training/${mId}/ilt-quiz/${activityId}`
                                            )
                                        }}
                                    />
                                </Grid>
                            </Box>
                        )}

                        {!isQuiz && (
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
                        )}

                        {!isYoutube && !isQuiz && (
                            <Grid item size={{ xs: 12 }}>
                                <Typography
                                    variant="body1"
                                    fontWeight={500}
                                    gutterBottom
                                >
                                    {fileConfig.type} *
                                </Typography>

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
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}
                                >
                                    <input {...getInputProps()} />

                                    <Avatar variant="rounded">
                                        <i className="tabler-upload" />
                                    </Avatar>

                                    <Typography variant="body2">
                                        {fileConfig.type === 'Document' &&
                                            'Allowed *.pdf, *.pptx, *.docx, *.doc. Max 5MB'}

                                        {fileConfig.type === 'Video' &&
                                            'Allowed *.mp4. Max 500MB'}

                                        {fileConfig.type === 'SCORM Content' &&
                                            'Allowed *.zip with imsmanifest.xml. Max 500MB'}
                                    </Typography>

                                    {validatingScorm && (
                                        <Typography variant="body2">
                                            Validating SCORM package...
                                        </Typography>
                                    )}

                                    {(file || editData?.file_url) && (
                                        <Box>
                                            <Typography variant="body2">
                                                {file?.name || editData?.file_url}
                                            </Typography>

                                            {file && (
                                                <Typography variant="caption">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    {imageError && (
                                        <Typography
                                            variant="caption"
                                            color="error"
                                        >
                                            {imageError}
                                        </Typography>
                                    )}
                                </div>
                            </Grid>
                        )}

                        {(isYoutube || isVideo) && (
                            <>
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
                                                    placeholder="Enter YouTube video URL"
                                                    error={!!errors.video_url}
                                                    helperText={errors.video_url?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}

                                {ReactPlayer.canPlay(
                                    preview
                                        ? preview
                                        : (
                                            isVideo
                                                ? `${assert_url}/activity/${watch('video_url')}`
                                                : watch('video_url')
                                        )
                                ) && (
                                        <Grid item size={{ xs: 12 }}>
                                            <Typography
                                                variant="subtitle1"
                                                gutterBottom
                                            >
                                                Video Preview
                                            </Typography>

                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '300px',
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    boxShadow: 1
                                                }}
                                            >
                                                <ReactPlayer
                                                    url={
                                                        preview
                                                            ? preview
                                                            : (
                                                                isVideo
                                                                    ? `${assert_url}/activity/${watch('video_url')}`
                                                                    : watch('video_url')
                                                            )
                                                    }
                                                    controls
                                                    width="100%"
                                                    height="100%"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    )}
                            </>
                        )}

                        {loading && (
                            <Grid item size={{ xs: 12 }}>
                                <Typography variant="body2">
                                    Upload Progress: {uploadProgress}%
                                </Typography>
                            </Grid>
                        )}
                    </Grid>

                    <DialogActions
                        sx={{
                            justifyContent: 'center',
                            gap: 2,
                            mt: 4
                        }}
                    >
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                loading || validatingScorm
                            }
                        >
                            {loading
                                ? <CircularProgress size={22} />
                                : 'Submit'}
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </DialogContent>
            </form>
            <ImportQuizModal open={isModalOpen} onClose={onClose} activityId={activityId} handleClose={handleClose} />
        </Dialog>
    )
}

export default ActivityModal;
