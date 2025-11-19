'use client'

import { useEffect, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

import {
  Box,
  Card,
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

  return (
    <Box className="p-6 space-y-6">

      {/* HEADER */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-5 items-center">

          {/* Image */}
          {loading ? (
            <Skeleton variant="rectangular" width={260} height={230} />
          ) : (
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
          )}

          {/* Header Info */}
          <Box className="flex flex-col gap-3">
            {loading ? (
              <>
                <Skeleton width={120} />
                <Skeleton width={200} />
              </>
            ) : (
              <>
                <Stack direction="row" spacing={2}>
                  <Typography variant="body1" color="text.secondary">
                    In Progress
                  </Typography>
                  <Typography variant="body1" color="error">
                    {data?.moduleInfo?.status}
                  </Typography>
                </Stack>

                <Typography variant="h6" fontWeight={600}>
                  {data?.moduleInfo?.title}
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* DESCRIPTION */}
      <Card>
        <CardContent>
          {loading ? (
            <>
              <Skeleton width="100%" />
              <Skeleton width="80%" />
            </>
          ) : (
            <Typography variant="body1">
              {data?.moduleInfo?.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* ACTIVITIES */}
      <Box>
        <Typography variant="h6" mb={2}>Activities</Typography>

        {/* Skeleton List */}
        {loading &&
          [...Array(3)].map((_, i) => (
            <Card key={i} className="mb-3">
              <CardContent>
                <Skeleton width="60%" />
                <Skeleton width="30%" />
              </CardContent>
            </Card>
          ))}

        {/* Actual Activity List */}
        {!loading &&
          data?.activities?.map((activity, index) => {
            const label =
              activity?.name ||
              moduleTypeLabel[activity?.module_type_id] ||
              'Objective Quiz'

            return (
              <Card key={index} className="mb-3 hover:shadow-sm transition-all">
                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                  {/* Left Side */}
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

                  {/* Right Side */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    {activity?.status === 'Completed' && (
                      <Chip
                        label={`Completed On : ${activity.completedOn}`}
                        variant="outlined"
                        color="success"
                        size="small"
                      />
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      href={`/${locale}/apps/content-data?type=${docType?.[activity?.module_type_id]}&activityId=${activity?._id}`}
                      sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                      {activity?.buttonLabel || 'Open'}
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
