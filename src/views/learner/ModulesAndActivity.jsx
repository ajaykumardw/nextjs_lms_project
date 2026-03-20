'use client'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const CARD_HEIGHT = 420

const ModulesAndActivity = () => {
    const series = [40, 30, 20, 10]

    const options = {
        labels: ['Videos', 'Quizzes', 'Docs', 'Flashcards']
    }

    return (
        <Grid container spacing={6} alignItems="stretch">

            {/* Activity */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                <Card
                    sx={{
                        height: CARD_HEIGHT,
                        minHeight: CARD_HEIGHT,
                        maxHeight: CARD_HEIGHT,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <CardHeader title="Activity Summary" />

                    {/* Scrollable content */}
                    <CardContent
                        sx={{
                            overflowY: 'auto',
                        }}
                    >
                        <Chart type="donut" series={series} options={options} />
                    </CardContent>
                </Card>
            </Grid>

            {/* Modules */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
                <Card
                    sx={{
                        height: CARD_HEIGHT,
                        minHeight: CARD_HEIGHT,
                        maxHeight: CARD_HEIGHT,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <CardHeader title="Learning Modules" />

                    {/* Scrollable content */}
                    <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                        <p>Module List Here...</p>
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
    )
}

export default ModulesAndActivity
