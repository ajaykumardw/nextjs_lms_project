"use client";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    Typography,
} from "@mui/material";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";
import ScormViewer from "../component/ScormViewer";

const ScromModalComponent = ({
    open,
    setOpen,
    selectedScorm,
    scormLogData,
    setScormLogData
}) => {
    const handleClose = () => {
        setOpen(false);
    };

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
            {/* Close Button */}
            <DialogCloseButton
                onClick={handleClose}
                disableRipple
            >
                <i className="tabler-x" />
            </DialogCloseButton>

            {/* Header */}
            <DialogTitle
                sx={{
                    px: {
                        xs: 2,
                        sm: 3,
                    },
                    py: 2,
                    pr: 7,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor:
                        "background.paper",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                                "primary.50",
                            color: "primary.main",
                            flexShrink: 0,
                        }}
                    >
                        <i
                            className="tabler-player-play"
                            style={{
                                fontSize: 21,
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                lineHeight: 1.3,
                            }}
                        >
                            SCORM Preview
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: "block",
                                mt: 0.25,
                            }}
                        >
                            Interactive learning content
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            {/* SCORM Content */}
            <DialogContent
                sx={{
                    p: {
                        xs: 1,
                        sm: 1.5,
                        md: 2,
                    },
                    overflow: "hidden",
                    backgroundColor: "#f5f6f8",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: {
                            xs: 1,
                            sm: 1.5,
                        },
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor:
                            "background.paper",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <ScormViewer
                        data={selectedScorm}
                        scromLogData={scormLogData}
                        setScormData={
                            setScormLogData
                        }
                    />
                </Box>
            </DialogContent>

            {/* Footer */}
            <DialogActions
                sx={{
                    marginTop: "12px",
                    justifyContent: "center",
                    gap: 1,
                }}
            >
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScromModalComponent;
