import { Box, Typography, FormHelperText, Button } from "@mui/material";
import SessionRow from "./SessionRow";

const MAX_SESSIONS = 20;

// A single session row (date, start/end time, venue, trainer)
const emptySession = () => ({
    id: Date.now() + Math.random(),
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    trainers: [],
    errors: {},
});

const SessionList = ({ sessions, setSessions, sessionsError }) => {
    const addSession = () => {
        if (sessions.length >= MAX_SESSIONS) return;
        setSessions((prev) => [...prev, emptySession()]);
    };

    const removeSession = (id) => {
        setSessions((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
    };

    const updateSession = (id, field, value) => {
        setSessions((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, [field]: value, errors: { ...s.errors, [field]: undefined } } : s
            )
        );
    };

    return (
        <Box mb={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Sessions
            </Typography>
            {sessions.map((session, idx) => (
                <SessionRow
                    key={session.id}
                    session={session}
                    index={idx}
                    onChange={updateSession}
                    onRemove={removeSession}
                    canRemove={sessions.length > 1}
                />
            ))}
            {sessionsError && (
                <FormHelperText error sx={{ mb: 1 }}>
                    {sessionsError}
                </FormHelperText>
            )}
            <Button
                variant="outlined"
                size="small"
                onClick={addSession}
                disabled={sessions.length >= MAX_SESSIONS}
                startIcon={<i className="tabler-plus" />}
            >
                Add session
            </Button>
        </Box>
    );
};

export default SessionList;
