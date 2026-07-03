'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import Grid from '@mui/material/Grid2'
import {
    Card,
    CardContent,
    Typography,
    Skeleton,
    Box,
    Stack,
    Avatar,
    Chip,
    Button,
    Divider
} from '@mui/material'

dayjs.extend(relativeTime)

const RecentActivities = ({ dashboardData, loading }) => {
    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
                <Card
                    sx={{
                        height: '100%',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 2,
                        overflow: 'hidden',
                        transition: '.3s',

                        '&:hover': {
                            boxShadow: 6
                        }
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={3}
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Recent Activities
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Your latest learning updates
                                </Typography>
                            </Box>

                            <Button
                                size="small"
                                variant="text"
                            >
                                View All
                            </Button>
                        </Stack>

                        <Box
                            sx={{
                                maxHeight: 380,
                                overflowY: 'auto',
                                pr: 1,

                                '&::-webkit-scrollbar': {
                                    width: 6
                                },

                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#cbd5e1',
                                    borderRadius: 20
                                },

                                '&::-webkit-scrollbar-thumb:hover': {
                                    backgroundColor: '#94a3b8'
                                }
                            }}
                        >
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rounded"
                                        height={80}
                                        sx={{
                                            mb: 2,
                                            borderRadius: 3
                                        }}
                                    />
                                ))
                            ) : dashboardData?.activityLog?.length ? (
                                dashboardData.activityLog.map((item, index) => (
                                    <Box key={index}>
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                            sx={{
                                                py: 2,
                                                px: 1,
                                                borderRadius: 2,
                                                transition: '.2s',

                                                '&:hover': {
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    inlineSize: 48,
                                                    blockSize: 48,
                                                }}
                                            >
                                                <i className="tabler-check" />
                                            </Avatar>

                                            <Box flex={1}>
                                                <Typography
                                                    fontWeight={600}
                                                    fontSize={15}
                                                >
                                                    {item.title}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={0.3}
                                                >
                                                    Started at{' '}
                                                    {
                                                        item.start_activity_time
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Attempt #{item.current_attempt}
                                                </Typography>
                                            </Box>

                                            <Chip
                                                label="Completed"
                                                size="small"
                                                color="success"
                                                variant="filled"
                                                sx={{
                                                    fontWeight: 600,
                                                    borderRadius: 1.5
                                                }}
                                            />
                                        </Stack>

                                        {index !==
                                            dashboardData.activityLog.length - 1 && (
                                                <Divider />
                                            )}
                                    </Box>
                                ))
                            ) : (
                                <Box
                                    sx={{
                                        py: 8,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                    >
                                        No recent activities
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.disabled"
                                    >
                                        Your completed activities will appear here.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default RecentActivities
