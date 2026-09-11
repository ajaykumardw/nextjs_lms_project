import { Paper, Box, Typography, IconButton, TextField, MenuItem, Checkbox, ListItemText } from "@mui/material";

import Grid from "@mui/material/Grid2"

const fieldStyleSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1 },
};

const trainers = [
    {
        _id: "trainer1",
        name: "John Smith",
    },
    {
        _id: "trainer2",
        name: "David Kumar",
    },
    {
        _id: "trainer3",
        name: "Rahul Sharma",
    },
];

const SessionRow = ({ session, onChange, onRemove, canRemove, index }) => {

    const setField = (field) => (e) => onChange(session.id, field, e.target.value);

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={600}>
                    Session {index + 1}
                </Typography>
                <IconButton size="small" color="error" disabled={!canRemove} onClick={() => onRemove(session.id)}>
                    <i className="tabler-trash" />
                </IconButton>
            </Box>

            <Grid container spacing={2}>

                <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                        fullWidth
                        label="Date *"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={fieldStyleSx}
                        value={session.date}
                        onChange={setField("date")}
                        error={!!session.errors.date}
                        helperText={session.errors.date}
                    />
                </Grid>
                <Grid size={{ xs: 6, md: 2.5 }}>
                    <TextField
                        fullWidth
                        label="Start time *"
                        type="time"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={fieldStyleSx}
                        value={session.startTime}
                        onChange={setField("startTime")}
                        error={!!session.errors.startTime}
                        helperText={session.errors.startTime}
                    />
                </Grid>
                <Grid size={{ xs: 6, md: 2.5 }}>
                    <TextField
                        fullWidth
                        label="End time *"
                        type="time"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={fieldStyleSx}
                        value={session.endTime}
                        onChange={setField("endTime")}
                        error={!!session.errors.endTime}
                        helperText={session.errors.endTime}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        label="Venue / link"
                        placeholder="Optional"
                        size="small"
                        sx={fieldStyleSx}
                        value={session.venue}
                        onChange={setField("venue")}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        select
                        label="Trainer"
                        size="small"
                        sx={fieldStyleSx}
                        value={session.trainers || []}
                        onChange={(e) => onChange(session.id, "trainers", e.target.value)}
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected) =>
                                selected
                                    .map(
                                        (id) =>
                                            trainers.find((trainer) => trainer._id === id)?.name
                                    )
                                    .filter(Boolean)
                                    .join(", "),
                        }}
                    >
                        {trainers.map((trainer) => (
                            <MenuItem key={trainer._id} value={trainer._id}>
                                <Checkbox
                                    checked={(session.trainers || []).includes(trainer._id)}
                                    size="small"
                                />
                                <ListItemText primary={trainer.name} />
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default SessionRow;
