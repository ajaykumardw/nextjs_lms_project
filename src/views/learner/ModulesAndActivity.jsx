'use client'

import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'
import {
    Card,
    Skeleton,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Stack,
    Button
} from '@mui/material'

const Chart = dynamic(() => import('react-apexcharts'), {
    ssr: false
})

const cardStyle = {
    height: '100%',
    borderRadius: 4,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 1,
    transition: 'all .25s ease',

    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
    }
}

const ModulesAndActivity = ({ dashboardData, loading }) => {
    const series =
        dashboardData?.activitySummary?.map(item =>
            +item.percentage.toFixed(2)
        ) || [];

    const options = {
        chart: {
            toolbar: {
                show: false
            }
        },

        labels:
            dashboardData?.activitySummary?.map(item => item.title) || [],

        legend: {
            position: 'bottom',
            fontSize: '14px'
        },

        dataLabels: {
            enabled: false
        },

        stroke: {
            width: 0
        },

        plotOptions: {
            pie: {
                donut: {
                    size: '78%',

                    labels: {
                        show: true,

                        total: {
                            show: true,
                            label: 'Activity'
                        }
                    }
                }
            }
        }
    }

    return (
        <Grid container spacing={4} alignItems="stretch">

            {/* Activity Summary */}

            <Grid size={{ xs: 12, md: 5 }}>

                <Card sx={cardStyle}>

                    <CardContent>

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
                                    Activity Summary
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Overall learning activity
                                </Typography>

                            </Box>
                        </Stack>

                        {loading ? (

                            <Box textAlign="center">

                                <Skeleton
                                    variant="circular"
                                    width={220}
                                    height={220}
                                    sx={{ mx: 'auto' }}
                                />

                                <Skeleton
                                    width={180}
                                    sx={{ mt: 3, mx: 'auto' }}
                                />

                            </Box>

                        ) : series.length ? (

                            <Chart
                                options={options}
                                series={series}
                                type="donut"
                                height={340}
                            />

                        ) : (

                            <Typography
                                color="text.secondary"
                                align="center"
                            >
                                No activity data available
                            </Typography>

                        )}

                    </CardContent>

                </Card>

            </Grid>

            {/* Learning Modules */}

            <Grid size={{ xs: 12, md: 7 }}>

                <Card sx={cardStyle}>

                    <CardContent>

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
                                    Learning Modules
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Your enrolled modules
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
                                maxHeight: 360,
                                overflowY: 'auto',
                                pr: 1
                            }}
                        >

                            {loading ? (

                                [...Array(5)].map((_, index) => (

                                    <Skeleton
                                        key={index}
                                        variant="rounded"
                                        height={90}
                                        sx={{
                                            mb: 2,
                                            borderRadius: 3
                                        }}
                                    />

                                ))

                            ) : dashboardData?.enrolledData?.length ? (

                                dashboardData.enrolledData.map((item, index) => (

                                    <Card
                                        key={item._id || index}
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            mb: 2,
                                            borderRadius: 3,
                                            transition: '.25s',

                                            '&:hover': {
                                                boxShadow: 3,
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                    >

                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="flex-start"
                                        >

                                            <Avatar

                                            >
                                                <i className="tabler-book" />
                                            </Avatar>

                                            <Box flex={1}>

                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {item.title}
                                                    </Typography>

                                                    <Chip
                                                        label="Active"
                                                        color="success"
                                                        size="small"
                                                    />

                                                </Stack>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mt: .5 }}
                                                >
                                                    {item.description}
                                                </Typography>

                                            </Box>

                                        </Stack>

                                    </Card>

                                ))

                            ) : (

                                <Typography
                                    color="text.secondary"
                                    align="center"
                                >
                                    No learning modules found.
                                </Typography>

                            )}

                        </Box>

                    </CardContent>

                </Card>

            </Grid>

        </Grid>
    )
}

export default ModulesAndActivity
