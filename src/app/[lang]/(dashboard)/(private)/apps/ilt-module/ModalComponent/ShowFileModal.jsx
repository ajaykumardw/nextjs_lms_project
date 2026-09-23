import { useEffect, useState } from "react"

import { useRouter, useParams } from "next/navigation"

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"

import DialogCloseButton from "@/components/dialogs/DialogCloseButton"

const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL

const ShowFileModal = ({ open, setOpen, docURL }) => {

    const fullURL = `${ASSET_URL}/activity/${docURL}`
    const ext = docURL?.split('.').pop()?.toLowerCase()

    const [isOnlineEnv, setIsOnlineEnv] = useState(false)

    useEffect(() => {
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
        <Dialog
            open={open}
            fullWidth
            maxWidth="lg"
            onClose={handleClose}
            scroll="body"
            closeAfterTransition={false}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >

            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className="tabler-x" />
            </DialogCloseButton>

            <DialogTitle>Document Preview</DialogTitle>

            <DialogContent dividers sx={{ minHeight: 600 }}>
                {isPDF ? (
                    <iframe
                        src={fullURL}
                        style={{ width: '100%', height: '100%', minHeight: '600px', border: 'none' }}
                        title="PDF Viewer"
                    />
                ) : isOfficeFile && isOnlineEnv ? (
                    <iframe
                        src={officeViewerURL}
                        style={{ width: '100%', height: '100%', minHeight: '600px', border: 'none' }}
                        title="Office Viewer"
                    />
                ) : isOfficeFile && !isOnlineEnv ? (
                    <iframe
                        src={googleViewerURL}
                        style={{ width: '100%', height: '100%', minHeight: '600px', border: 'none' }}
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

            <DialogActions sx={{ justifyContent: 'center', gap: 2, mt: "18px" }}>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                        handleClose()
                    }}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ShowFileModal;

