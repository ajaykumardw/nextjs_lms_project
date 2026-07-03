'use client'

import { useState, useMemo, useEffect } from 'react'

import { notFound, useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import {
    Box,
    Card,
    CardContent,
    Chip,
    Pagination,
    Typography
} from '@mui/material'

import Grid from "@mui/material/Grid2"

const VALID_SLUGS = ['in-progress', 'not-started', 'completed', 'enrolled-module']

const PAGE_SIZE = 12

const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''

const currentStatus = {
    'in-progress': 'In Progress',
    'not-started': 'Not Started',
    'completed': 'Completed'
}

const MyModulePage = () => {

    const [page, setPage] = useState(1)

    const [moduleData, setModuleData] = useState();

    const totalPages = Math.ceil(moduleData?.length / PAGE_SIZE)

    const { lang, slug } = useParams()

    const router = useRouter()

    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const { data: session } = useSession()
    const token = session?.user?.token

    const currentModules = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        
        return moduleData?.slice(start, start + PAGE_SIZE)
    }, [moduleData, page])

    if (!VALID_SLUGS.includes(slug)) {
        notFound()
    }

    const fetchModules = async () => {
        try {

            const response = await fetch(`${API_URL}/user/my-modules/fetch/data/${slug}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const value = await response.json();

            if (response.ok) {

                const result = value?.data;

                setModuleData(result)
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    useEffect(() => {

        if (token && URL && slug) {

            fetchModules();
        }

    }, [API_URL, token, slug])

    return (
        <Box sx={{ p: 4, bgcolor: '#f7f8fc', minHeight: '100vh' }}>
            <Typography variant="h5" fontWeight={700} mb={3}>
                My Modules
            </Typography>

            <Grid container spacing={3}>
                {currentModules?.map(module => (
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={module._id}>
                        <Card
                            sx={{
                                height: 360,
                                borderRadius: 3,
                                overflow: 'hidden',
                                position: 'relative',
                                transition: '.25s',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(0,0,0,.12)',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,.18)'
                                }
                            }}
                            onClick={() => {
                                router.push(
                                    `/${lang}/apps/content?id=${module?._id}&content-folder-id=${module?.contentFolderId}`
                                )
                            }}
                        >
                            <Box
                                component="img"
                                src={`${assert_url}/program_module/${module?.image_url}`}
                                sx={{
                                    width: '100%',
                                    height: 160,
                                    objectFit: 'cover'
                                }}
                            />

                            <CardContent
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 200
                                }}
                            >
                                <Typography
                                    fontWeight={600}
                                    fontSize={15}
                                    mb={2}
                                    sx={{
                                        minHeight: 42
                                    }}
                                >
                                    {module?.title}
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                        mb: 3
                                    }}
                                >
                                    <Chip
                                        label={module?.contentFolderName}
                                        size="small"
                                        variant="outlined"
                                    />

                                    <Chip
                                        label={module?.programName}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Box mt="auto">
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {currentStatus[slug] || "In progress"}
                                    </Typography>
                                </Box>
                            </CardContent>

                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: `${module?.completion_percentage}%`,
                                    height: 3,
                                    bgcolor:
                                        slug === 'completed'
                                            ? '#4caf50'
                                            : slug === 'in-progress'
                                                ? '#ffb300'
                                                : '#ccc'
                                }}
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {totalPages > 1 && (
                <Box
                    mt={5}
                    display="flex"
                    justifyContent="center"
                >
                    <Pagination
                        page={page}
                        count={totalPages}
                        color="primary"
                        shape="rounded"
                        size="large"
                        onChange={(_, value) => setPage(value)}
                    />
                </Box>
            )}
        </Box>
    )
}

export default MyModulePage
