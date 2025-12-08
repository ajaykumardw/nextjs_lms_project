'use client'

import { useEffect, useState } from 'react'

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
  Chip,
  Button,
  Skeleton
} from '@mui/material'

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

  const fetchActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/user/activity/data/${moduleId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setData(result?.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (API_URL && token && moduleId) {
      fetchActivity()
    }
  }, [API_URL, token, moduleId])

  // Mapping module types
  const moduleTypeLabel = {
    '688723af5dd97f4ccae68834': 'Documents & Slides',
    '688723af5dd97f4ccae68835': 'Video',
    '688723af5dd97f4ccae68836': 'YouTube Video',
    '688723af5dd97f4ccae68837': 'Scrom Content',
    '688723af5dd97f4ccae68838': 'Web Link',
    '688723af5dd97f4ccae68839': 'Subjective Assessment',
    '688723af5dd97f4ccae6883a': 'Flash Card',
    "68886902954c4d9dc7a379bd": "Quiz"
  }

  const docType = {
    '688723af5dd97f4ccae68834': 'pdf',
    '688723af5dd97f4ccae68835': 'video',
    '688723af5dd97f4ccae68836': 'youtube-video',
    '688723af5dd97f4ccae68837': 'scrom-content',
    '688723af5dd97f4ccae68838': 'web-link',
    '688723af5dd97f4ccae68839': 'subjective-sssessment',
    '688723af5dd97f4ccae6883a': 'flash-card',
    '68886902954c4d9dc7a379bd': "quiz"
  }

  function formatEnrollDate(dateString) {
    const date = new Date(dateString)

    return `${String(date.getDate()).padStart(2, '0')} ${String(date.getMonth() + 1).padStart(2, '0')} ${date.getFullYear()}`
  }

  // -----------------------------------------------------
  // FULL PAGE SKELETON
  // -----------------------------------------------------
  if (loading) {
    return (
      <Box className="p-6 space-y-6">
        {/* Header Skeleton */}
        <Card>
          <Skeleton variant="rectangular" height={60} />

          <CardContent className="flex flex-col sm:flex-row gap-5 items-center">
            <Skeleton variant="rectangular" width={260} height={230} />

            <Box className="flex flex-col gap-3 flex-1">
              <Skeleton width="50%" />
              <Skeleton width="70%" />
            </Box>
          </CardContent>
        </Card>

        {/* Description Skeleton */}
        <Card>
          <CardContent>
            <Skeleton width="100%" />
            <Skeleton width="90%" />
          </CardContent>
        </Card>

        {/* Activities Skeleton */}
        <Typography variant="h6" mb={2}>Activities</Typography>

        {[...Array(3)].map((_, i) => (
          <Card key={i} className="mb-3">
            <CardContent>
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    )
  }

  // -----------------------------------------------------
  // REAL PAGE RENDER
  // -----------------------------------------------------
  return (
    <Box className="p-6 space-y-6">

      {/* HEADER */}
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
            moduleTypeLabel[activity?.module_type_id] ||
            'Objective Quiz'

          return (
            <Card key={index} className="mb-3 hover:shadow-sm transition-all">
              <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                {/* Left */}
                <Box>
                  <Typography fontWeight={600}>{label}</Typography>

                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                    {activity.required && (
                      <Chip
                        label="⭐ Required"
                        color="success"
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>

                {/* Right */}
                <Stack direction="row" spacing={2} alignItems="center">
                  {(activity?.logs[0]?.is_completed && Number(activity?.logs[0]?.completion_percentage) >= 100) && (
                    <Chip
                      label={`Completed On : ${(activity?.logs[0]?.is_completed && activity?.logs[0]?.completed_at_time && activity?.logs[0]?.completed_at_time != null && activity?.logs[0]?.completed_at_time != "null") ? formatEnrollDate(activity?.logs[0]?.completed_at_time) : ""}`}
                      variant="outlined"
                      color="success"
                      size="small"
                    />
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    href={`/${locale}/apps/content-data?type=${docType?.[activity?.module_type_id]}&activityId=${activity?._id}&moduleId=${moduleId}&contentFolderId=${content_folder_id}&moduleTypeId=${activity?.module_type_id}`}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                  >
                    {Number(activity?.logs[0]?.is_completed) ? "Completed" : 'In progress'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}
