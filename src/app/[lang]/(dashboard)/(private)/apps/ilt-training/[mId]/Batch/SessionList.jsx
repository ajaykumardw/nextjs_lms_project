import {
    Box,
    Button,
    FormHelperText,
    Typography,
} from "@mui/material";

import SessionRow from "./SessionRow";

const MAX_SESSIONS = 20;

const emptySession = () => ({
    id: `${Date.now()}-${Math.random()}`,
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    trainers: [],
    errors: {},
});

const SessionList = ({
    sessions = [],
    setSessions,
    sessionsError,
    finalData = {},
}) => {
    const addSession = () => {
        if (sessions.length >= MAX_SESSIONS) {
            return;
        }

        setSessions((prev) => [
            ...prev,
            emptySession(),
        ]);
    };

    const removeSession = (id) => {
        setSessions((prev) => {
            if (prev.length <= 1) {
                return prev;
            }

            return prev.filter(
                (session) =>
                    session.id !== id
            );
        });
    };

    const updateSession = (
        id,
        field,
        value
    ) => {
        setSessions((prev) =>
            prev.map((session) =>
                session.id === id ?
                    {
                        ...session,
                        [field]: value,
                        errors: {
                            ...(session.errors || {}),
                            [field]: undefined,
                        },
                    }
                    : session
            )
        );
    };

    return (
        <Box mb={4}>
            <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
            >
                Sessions
            </Typography>

            {sessions.map(
                (session, index) => (
                    <SessionRow
                        key={session.id}
                        session={session}
                        index={index}
                        finalData={finalData}
                        onChange={updateSession}
                        onRemove={removeSession}
                        canRemove={sessions.length > 1}
                    />
                )
            )}

            {sessionsError && (
                <FormHelperText
                    error
                    sx={{ mb: 1 }}
                >
                    {sessionsError}
                </FormHelperText>
            )}

            <Button
                variant="outlined"
                size="small"
                onClick={addSession}
                disabled={
                    sessions.length >=
                    MAX_SESSIONS
                }
                startIcon={
                    <i className="tabler-plus" />
                }
            >
                Add session
            </Button>
        </Box>
    );
};

export default SessionList;
