'use client'

import { act, useEffect, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

import {
  Box,
  Card,
  Breadcrumbs,
  Link,
  CardContent,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Chip,
  Button,
  Skeleton
} from '@mui/material'

import { toast } from 'react-toastify'


function formatEnrollDate(dateString) {
  const date = new Date(dateString)

  return `${String(date.getDate()).padStart(2, '0')} ${String(date.getMonth() + 1).padStart(2, '0')} ${date.getFullYear()}`
}

export default function ProgramPage() {
  const paramData = useSearchParams()

  const moduleId = paramData.get('id')
  const content_folder_id = paramData.get('content-folder-id')

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL

  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const token = session?.user?.token

  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [settingData, setSettingData] = useState()

  const fetchActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/user/activity/data/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await response.json()

      if (response.ok) setData(result?.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSurveyData = async () => {
    try {
      const response = await fetch(`${API_URL}/user/module/survey/data/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await response.json()

      if (response.ok) {

        const module_setting = result?.data?.moduleSetting || {}

        setSettingData({
          orderType: module_setting?.orderType || 'any'
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (API_URL && token && moduleId) {
      fetchActivity()
      fetchSurveyData()
    }
  }, [API_URL, token, moduleId])

  const moduleTypeLabel = {
    '688723af5dd97f4ccae68834': 'Documents & Slides',
    '688723af5dd97f4ccae68835': 'Video',
    '688723af5dd97f4ccae68836': 'YouTube Video',
    '688723af5dd97f4ccae68837': 'Scorm Content',
    '688723af5dd97f4ccae68838': 'Web Link',
    '688723af5dd97f4ccae68839': 'Subjective Assessment',
    '688723af5dd97f4ccae6883a': 'Flash Card',
    '68886902954c4d9dc7a379bd': 'Quiz'
  }

  const docType = {
    '688723af5dd97f4ccae68834': 'pdf',
    '688723af5dd97f4ccae68835': 'video',
    '688723af5dd97f4ccae68836': 'youtube-video',
    '688723af5dd97f4ccae68837': 'scrom-content',
    '688723af5dd97f4ccae68838': 'web-link',
    '688723af5dd97f4ccae68839': 'subjective-sssessment',
    '688723af5dd97f4ccae6883a': 'flash-card',
    '68886902954c4d9dc7a379bd': 'quiz'
  }

  const handleActivityClick = (canOpen, url) => {
    if (!canOpen) {
      toast.error('Please complete the previous activity first.', {
        autoClose: 1000
      })

      return
    }
    
    window.location.href = url
  }

  if (loading) return null

  return (
    <Box className="p-6 space-y-6">

      <Card>
        <Breadcrumbs
          px={5}
          aria-label="breadcrumb"
          separator="›"
          sx={{
            py: 2,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #ECECEC',
            '& a, & span': {
              fontSize: '0.875rem',
              fontWeight: 500
            },
            '& a': {
              color: '#1976d2',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }
          }}
        >
          <Link href={`/${locale}/apps/my-courses`}>
            <Typography component="span">Home</Typography>
          </Link>

          {content_folder_id && (
            <Link href={`/${locale}/apps/moduleProgram/detail/${content_folder_id}`}>
              <Typography component="span" color="text.primary">
                Program
              </Typography>
            </Link>
          )}
        </Breadcrumbs>

        <CardContent className="flex flex-col sm:flex-row gap-5 items-center">

          {/* Image */}
          <Box
            component="img"
            src={
              data?.moduleInfo?.image_url
                ? `${ASSET_URL}/program_module/${data?.moduleInfo?.image_url}`
                : '/placeholder.png'
            }
            sx={{
              width: 260,
              height: 230,
              borderRadius: 2,
              objectFit: 'cover'
            }}
          />

          {/* Header Info */}
          <Box className="flex flex-col gap-3">
            <Stack direction="row" spacing={2}>
              <Typography variant="body1" color="text.secondary">
                {data?.moduleInfo?.status}
              </Typography>
            </Stack>

            <Typography variant="h6" fontWeight={600}>
              {data?.moduleInfo?.title}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* DESCRIPTION */}
      <Card>
        <CardContent>
          <Typography variant="body1">
            {data?.moduleInfo?.description}
          </Typography>
        </CardContent>
      </Card>

      {/* ACTIVITIES */}
      <Box>
        <Typography variant="h6" mb={2}>Activities</Typography>

        {data?.activities?.map((activity, index) => {
          const label =
            activity?.name ||
            moduleTypeLabel[activity?.module_type_id]

          const log = activity?.logs?.[0]

          const isCompleted =
            (log?.is_completed && Number(log?.completion_percentage) >= 100) ||
            log?.scorm_data?.lessonStatus === 'passed'

          const prevActivity = data.activities[index - 1]
          const prevLog = prevActivity?.logs?.[0]

          const prevCompleted =
            (prevLog?.is_completed && Number(prevLog?.completion_percentage) >= 100) ||
            prevLog?.scorm_data?.lessonStatus === 'passed'

          const isOrdered = settingData?.orderType === 'ordered'
          const canOpen = !isOrdered || index === 0 || prevCompleted

          const url = `/${locale}/apps/content-data?type=${docType[activity?.module_type_id]}&activityId=${activity?._id}&moduleId=${moduleId}&contentFolderId=${content_folder_id}&moduleTypeId=${activity?.module_type_id}`

          return (
            <Card key={index} className="mb-3">
              <CardContent className="flex justify-between items-center">
                <Typography fontWeight={600}>{label}</Typography>

                <Button
                  variant="contained"
                  onClick={() => handleActivityClick(canOpen, url)}
                >
                  {isCompleted ? 'Completed' : 'In progress'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}


