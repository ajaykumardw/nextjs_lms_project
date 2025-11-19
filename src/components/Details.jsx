'use client'

import { useParams, useRouter } from 'next/navigation'

// MUI
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'


// import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

// ⭐ Mock Data
const programData = {
  image: '/images/apps/academy/1.png',
  title: 'Employee Training Program',
  modulesEnrolled: 5,
  learners: 291,
  progress: 20,
}

const modules = [
  {
    thumbnail: '/images/apps/academy/2.png',
    title: 'Objective Assessment',
    subtitle: 'Objective Assessment',
    type: 'Quiz',
    moduleType: 'Micro-learning module',
    completedCount: 56,
    enrolledDate: '11th Jul, 2024',
    status: 'In Progress',
    progress: 40
  },
  {
    thumbnail: '/images/apps/academy/4.png',
    title: 'Subjective Assessment',
    subtitle: 'Subjective Assessment',
    type: 'Assignment',
    moduleType: 'Micro-learning module',
    completedCount: 27,
    enrolledDate: '11th Jul, 2024',
    status: 'Not Started'
  }
]

// ⭐ Status Color Helper
const getChipColor = status => {
  switch (status) {
    case 'In Progress': return 'warning'
    case 'Completed': return 'success'
    default: return 'default'
  }
}

export default function ProgramPage({ data }) {

  const { lang } = useParams()

  const router = useRouter()

  const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL;

  function formatEnrollDate(dateString) {
    const date = new Date(dateString);

    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }


  return (
    <Box className="p-6 space-y-5">

      {/* Program Header */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-5">

          {/* Thumbnail */}
          <Box
            component="img"
            src={`${assert_url}/program_module/${data?.courseDetails?.image_url}`}
            sx={{ width: 260, height: 230, borderRadius: 2, objectFit: 'cover' }}
          />

          {/* Program Info */}
          <Box className='flex flex-col justify-between'>
            <div>
              <Typography variant='h6'>Program:</Typography>
              <Typography fontWeight={600} variant='h5'>
                {data?.courseDetails?.title}
              </Typography>
            </div>

            <Box className='flex gap-10 mt-3'>
              <div>
                <Typography variant='body2' color='text.secondary'>Modules Enrolled</Typography>
                <Typography fontWeight={600}>{data?.courses?.length}</Typography>
              </div>
              <div>
                <Typography variant='body2' color='text.secondary'>Learners Enrolled</Typography>
                <Typography fontWeight={600}>{programData.learners}</Typography>
              </div>
            </Box>

            <Box mt={2}>
              <Typography variant='body2'>{programData.progress}% Completed</Typography>
              <LinearProgress variant='determinate' value={programData.progress} sx={{ mt: 1, height: 8, borderRadius: 2 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" className="mt-2">Enr(status)lled Modules</Typography>

      {/* Modules List */}
      {data?.courses?.map((item, index) => (
        <Card key={index} className="rounded-lg hover:shadow-sm transition-all" onClick={() => {
          router.push(`/${lang}/apps/content?id=${item._id}&content-folder-id=${data?.courseDetails?._id}`);
        }}>
          <CardContent className="flex items-start justify-between gap-4">
            <Stack direction="row" spacing={2}>
              <Box
                component="img"
                src={`${assert_url}/program_module/${item.image_url}`}
                sx={{ width: 75, height: 75, borderRadius: 1, objectFit: 'cover' }}
              />

              <Box>
                <Typography fontWeight={600}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.description}</Typography>

                {/* Icons Row */}
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <i className="tabler-file-description text-sm" />
                  <Typography variant="caption">{"type"}</Typography>
                  <Typography variant="caption">•</Typography>

                  <i className="tabler-device-laptop text-sm" />
                  <i className="tabler-device-mobile text-sm" />
                  <Typography variant="caption">•</Typography>

                  <Typography variant="caption">{data?.courseDetails?.title}</Typography>
                  {/* <Typography variant="caption">•</Typography> */}

                  {/* <i className="tabler-users text-sm" />
                  <Typography variant="caption">{item.completedCount} people completed</Typography> */}
                </Stack>
              </Box>
            </Stack>

            {/* Right */}
            <Box textAlign="right">
              <Typography variant="body2" color="text.secondary">
                Enrolled on {formatEnrollDate(item?.created_at)}
              </Typography>

              <Chip
                label={item.status}
                size="small"
                color={getChipColor("In Progress")}
                sx={{ mt: 1 }}
              />

              <IconButton size="small">
                {">"}
              </IconButton>
            </Box>
          </CardContent>

          {/* Bottom Progress */}
          {item.status === "In Progress" && (
            <LinearProgress
              variant="determinate"
              value={item.progress}
              sx={{
                height: 3,
                borderRadius: 0,
                '& .MuiLinearProgress-bar': { backgroundColor: '#fbbc04' }
              }}
            />
          )}
        </Card>
      ))}
    </Box>
  )
}
