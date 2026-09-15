import { useState } from "react";

import { Box, Button, Typography } from "@mui/material";

import Grid from "@mui/material/Grid2"

import ActivityCreateModal from "../ModalComponent/ActivityCreateModal";

const EngageColumn = ({ title, children, ctaLabel, slug, activityData, token, fetchActivities, mId }) => {

    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState()
    const [next, setNext] = useState(false)

    return (

        <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {title}
            </Typography>
            {children}
            <Box mt={3}>
                <Button fullWidth variant="outlined" onClick={() => {

                    setIsOpen(true)
                }}>
                    {ctaLabel}
                </Button>
            </Box>
            <ActivityCreateModal
                open={isOpen}
                setOpen={setIsOpen}
                data={activityData}
                token={token}
                slug={slug}
                fetchActivities={fetchActivities}
                setSelected={setSelected}
                selected={selected}
                setNext={setNext}
                mId={mId}
            />
        </Grid>
    )
};

export default EngageColumn;
