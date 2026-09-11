import { Box, Typography, Stack, Paper, Avatar, Chip } from "@mui/material";


const LearnerList = ({
    learners = [],
    status,
    onRemove,
    onMoveToConfirmed,
    canManage = true,
    emptyLabel,
}) => {
    const filtered = learners.filter(
        (learner) => learner.status === status
    );

    const getStatusLabel = (value) => {
        switch (value) {
            case LEARNER_STATUS.NOMINATED:
                return "Nominated";

            case LEARNER_STATUS.NOT_RESPONDED:
                return "Not Responded";

            case LEARNER_STATUS.CONFIRMED:
                return "Confirmed";

            case LEARNER_STATUS.DECLINED:
                return "Declined";

            default:
                return value;
        }
    };

    return (
        <Box>
            {filtered.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {emptyLabel}
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={1}>
                    {filtered.map((learner) => (
                        <Paper
                            key={learner.id}
                            variant="outlined"
                            sx={{
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                }}
                            >
                                {(
                                    learner.name ||
                                    learner.email ||
                                    "?"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </Avatar>

                            <Box
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    noWrap
                                >
                                    {learner.name || learner.email}
                                </Typography>

                                {learner.email && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        noWrap
                                    >
                                        {learner.email}
                                    </Typography>
                                )}
                            </Box>

                            <Chip
                                size="small"
                                label={getStatusLabel(learner.status)}
                            />

                            {status === LEARNER_STATUS.DECLINED && (
                                <Tooltip
                                    title={
                                        canManage
                                            ? "Move learner back to Confirmed"
                                            : "You do not have permission"
                                    }
                                >
                                    <span>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            disabled={!canManage}
                                            onClick={() =>
                                                onMoveToConfirmed(
                                                    learner.id
                                                )
                                            }
                                        >
                                            Move to Confirmed
                                        </Button>
                                    </span>
                                </Tooltip>
                            )}

                            {status === LEARNER_STATUS.NOMINATED && (
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={!canManage}
                                    onClick={() =>
                                        onRemove(learner.id)
                                    }
                                >
                                    <i className="tabler-x" />
                                </IconButton>
                            )}
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default LearnerList;

