'use client'

import { useParams } from 'next/navigation';

// MUI Imports
import Grid from '@mui/material/Grid2'
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Avatar,
  Stack,
  Divider
} from '@mui/material'

import PermissionGuardClient from '@/hocs/PermissionClientGuard';

const StatCard = ({ title, value, subtitle, icon, color = 'primary.main' }) => {

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        height: '100%'
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={700} mt={0.5}>
              {value}
            </Typography>

            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {icon && (
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
                borderRadius: 2,
                '& i': {
                  fontSize: 22,
                  color: '#fff'
                }
              }}
            >
              {icon}
            </Avatar>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

const ProgressRow = ({ name, progress }) => (
  <Box mb={2}>
    <Stack direction="row" justifyContent="space-between" mb={0.5}>
      <Typography variant="body2">{name}</Typography>
      <Typography variant="body2" fontWeight={600}>
        {progress}%
      </Typography>
    </Stack>

    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 8,
        borderRadius: 5
      }}
    />
  </Box>
)

const ActivityItem = ({ text }) => (
  <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
    <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  </Stack>
)

export default function Dashboard() {

  const { lang: locale } = useParams();

  return (
    <PermissionGuardClient locale={locale} element={"isCompany"}>


      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>

        {/* ================= STATS ================= */}
        <Grid container spacing={3} mb={3}>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Total Courses" value="120" icon={<i className="tabler-book" />} />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Total Learners" value="1,250" icon={<i className="tabler-users" />} />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Active Learners"
              value="320"
              subtitle="Today"
              icon={<i className="tabler-activity" />}
              color="success.main"
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Completed Courses"
              value="860"
              icon={<i className="tabler-circle-check" />}
              color="info.main"
            />
          </Grid>
        </Grid>

        {/* ================= MODULES ================= */}
        <Grid container spacing={3} mb={3}>
          {/* Module Activity */}
          <Grid item size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Module Activity
                </Typography>

                <ProgressRow name="SCORM Completion" progress={75} />
                <ProgressRow name="Quiz Pass Rate" progress={68} />
                <ProgressRow name="Video Completion" progress={82} />
              </CardContent>
            </Card>
          </Grid>

          {/* Learner Progress */}
          <Grid item size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Learner Progress
                </Typography>

                <ProgressRow name="Course A" progress={90} />
                <ProgressRow name="Course B" progress={55} />
                <ProgressRow name="Course C" progress={30} />
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Tasks */}
          <Grid item size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Pending Tasks
                </Typography>

                <Stack spacing={1}>
                  <Typography variant="body2">📘 12 Incomplete Courses</Typography>
                  <Typography variant="body2">📝 8 Pending Quizzes</Typography>
                  <Typography variant="body2">📂 5 Assignments Due</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ================= CHARTS ================= */}
        <Grid container spacing={3} mb={3}>
          <Grid item size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Course Completion Rate
                </Typography>

                <Box height={220} display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    Chart Placeholder
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Quiz Performance
                </Typography>

                <Box height={220} display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    Chart Placeholder
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ================= ACTIVITY ================= */}
        <Grid container spacing={3}>
          {/* Activity Feed */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Recent Activity
                </Typography>

                <ActivityItem text="User started a course" />
                <ActivityItem text="User completed a quiz" />
                <ActivityItem text="User watched a video" />
              </CardContent>
            </Card>
          </Grid>

          {/* Leaderboard */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Leaderboard
                </Typography>

                <Stack spacing={1}>
                  <Typography variant="body2">🥇 John - 980 pts</Typography>
                  <Typography variant="body2">🥈 Sarah - 870 pts</Typography>
                  <Typography variant="body2">🥉 Alex - 820 pts</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PermissionGuardClient>
  )
}
