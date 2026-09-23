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

import QuizCard from "../component/QuizCard"

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
        watch,
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
                type: 'Document'
            }
        }

        if (id === '688723af5dd97f4ccae68835') {

            return {
                type: 'Video'
            }
        }

        if (id === '688723af5dd97f4ccae68837') {

            return {
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
                type: 'Objective Quiz'
            }
        }

        return {
            type: ''
        }
    }

    const fileConfig = getFileConfig()

    const handleClose = () => {

        setPreview()

        reset({
            title: '',
            video_url: '',
            live_session_type: ''
        })

        setISOpen(false)
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

                    {(isYoutube || isVideo) && (
                        <>

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

                </Grid>

                <DialogActions
                    sx={{
                        justifyContent: 'center',
                        gap: 2,
                        mt: 4
                    }}
                >

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </DialogContent>

        </Dialog>
    )
}

export default ActivityModal;
