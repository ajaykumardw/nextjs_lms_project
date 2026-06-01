'use client'

import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'
import {
    Card,
    Skeleton,
    CardHeader,
    CardContent,
    Typography,
    Box
} from '@mui/material'

const Chart = dynamic(() => import('react-apexcharts'), {
    ssr: false
})

const CARD_HEIGHT = 420

const ModulesAndActivity = ({ dashboardData, loading }) => {
    const series =
        dashboardData?.activitySummary?.map(item => Number(item.percentage)) || []

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
            fontSize: '13px'
        },
        dataLabels: {
            enabled: true
        },
        plotOptions: {
            pie: {
                expandOnClick: true,
                donut: {
                    size: '70%'
                }
            }
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        ]
    }

    return (
        <Grid container spacing={6} alignItems="stretch">
            {/* Activity Summary */}
            <Grid size={{ xs: 12, md: 5 }}>
                <Card
                    sx={{
                        height: CARD_HEIGHT,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <CardHeader title="Activity Summary" />

                    <CardContent
                        sx={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        {loading ? (
                            <Skeleton
                                variant="rounded"
                                width="100%"
                                height={300}
                            />
                        ) : series.length ? (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Chart
                                    options={options}
                                    series={series}
                                    type="donut"
                                    width="100%"
                                    height={320}
                                />
                            </Box>
                        ) : (
                            <Typography>No activity data</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Learning Modules */}
            <Grid size={{ xs: 12, md: 7 }}>
                <Card
                    sx={{
                        height: CARD_HEIGHT,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <CardHeader title="Learning Modules" />

                    <CardContent
                        sx={{
                            flex: 1,
                            overflowY: 'auto'
                        }}
                    >
                        {loading ? (
                            [...Array(5)].map((_, index) => (
                                <Skeleton
                                    key={index}
                                    height={60}
                                    sx={{ mb: 2 }}
                                />
                            ))
                        ) : dashboardData?.enrolledData?.length ? (
                            dashboardData.enrolledData.map((item, index) => (
                                <Box
                                    key={item._id || index}
                                    sx={{
                                        mb: 2,
                                        pb: 1,
                                        borderBottom: theme =>
                                            `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={600}
                                    >
                                        {item?.title}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {item?.description}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography>No modules found</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default ModulesAndActivity
