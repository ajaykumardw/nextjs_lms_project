'use client'

import { useParams } from 'next/navigation'

import { Box, Card, CardContent, Typography, Stack, Chip, Button, LinearProgress } from '@mui/material'

// Mock Data
const moduleInfo = {
  title: "Nik Baker's HR Guidelines",
  description: "Dear Candidate, You will learn about Nik Baker's HR guidelines in this module.",
  note: "⭐ Required means required for completion of the Module.",
  image: '/images/apps/academy/6.png',
  status: 'Overdue',
  progress: 60,
}

export default function ProgramPage() {

  const params = useParams()

  const locale = params.lang;

  const activities = [
    {
      title: 'Documents and Slides',
      details: '2 Pages | 4 Minutes',
      required: true,
      url: `/${locale}/apps/content-data?type=pdf`,
      completedOn: "04 Jul'2024",
      buttonLabel: 'View',
      buttonColor: 'primary',
      status: 'Completed'
    },
    {
      title: 'Objective-Type Quizzes',
      details: '5 Questions | 10 Minutes',
      required: true,
      url: `/${locale}/apps/content-data?type=quiz`,
      completedOn: null,
      buttonLabel: 'Continue',
      buttonColor: 'primary',
      status: 'In Progress'
    },
    {
      title: 'Youtube videos',
      details: '22 Minutes | 4 Minutes',
      required: true,
      url: `/${locale}/apps/content-data?type=youtube-video`,
      completedOn: "04 Jul'2024",
      buttonLabel: 'View',
      buttonColor: 'primary',
      status: 'Completed'
    },
    {
      title: 'Videos',
      details: '5 Minutes | 4 Minutes',
      required: true,
      url: `/${locale}/apps/content-data?type=video`,
      completedOn: "04 Jul'2024",
      buttonLabel: 'View',
      buttonColor: 'primary',
      status: 'Completed'
    },
    {
      title: 'Scrom content',
      details: '5 Minutes | 4 Minutes',
      required: true,
      url: `/${locale}/apps/content-data?type=scrom-content`,
      completedOn: "14 Jul'2024",
      buttonLabel: 'View',
      buttonColor: 'primary',
      status: 'Completed'
    },
  ]

  return (
    <Box className="p-6 space-y-6">

      {/* Header Image and Status */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-5 items-center">
          <Box
            component="img"
            src={moduleInfo.image}
            sx={{ width: 260, height: 230, borderRadius: 2, objectFit: 'cover' }}
          />

          <Box className="flex flex-col gap-3">
            <Stack direction="row" spacing={2}>
              <Typography variant="body1" color="text.secondary">In Progress</Typography>
              <Typography variant="body1" color="error">{moduleInfo.status}</Typography>
            </Stack>
            <Typography variant="h6" fontWeight={600}>{moduleInfo.title}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardContent>
          <Typography variant="body1" mb={1}>{moduleInfo.description}</Typography>
          <Typography variant="body2" color="text.secondary">{moduleInfo.note}</Typography>
        </CardContent>
      </Card>

      {/* Activities Section */}
      <Box>
        <Typography variant="h6" mb={2}>Activities</Typography>

        {activities.map((activity, index) => (
          <Card key={index} className="mb-3 hover:shadow-sm transition-all">
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

              <Box>
                <Typography fontWeight={600}>{activity.title}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  {activity.required && (
                    <Chip label="⭐ Required" color="success" size="small" />
                  )}
                  <Typography variant="caption" color="text.secondary">{activity.details}</Typography>
                </Stack>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center">
                {activity.status === 'Completed' && (
                  <Chip
                    label={`Completed On : ${activity.completedOn}`}
                    variant="outlined"
                    color="success"
                    size="small"
                  />
                )}
                <Button
                  variant="contained"
                  color={activity.buttonColor}
                  href={activity.url}
                  sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                  {activity.buttonLabel}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
