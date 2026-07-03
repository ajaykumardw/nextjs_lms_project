"use client";

import React, { useEffect, useState } from "react";

import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import {
    Box,
    Typography,
    Paper,
    Skeleton,
    Divider,
    Pagination,
    Stack,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import {
    IconFolder,
} from "@tabler/icons-react";

const assetsUrl = process.env.NEXT_PUBLIC_ASSETS_URL || ''

function ProgramSkeleton() {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                border: "1px solid #e5e7eb",
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
            >
                <Skeleton
                    variant="rounded"
                    width={190}
                    height={120}
                />

                <Box flex={1}>
                    <Skeleton width="45%" height={40} />
                    <Skeleton width="85%" />
                    <Skeleton width="70%" />
                </Box>
            </Stack>

            <Divider sx={{ my: 4 }} />

            <Grid container spacing={2}>
                {[1, 2, 3, 4, 5].map((item) => (
                    <Grid
                        key={item}
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4,
                            lg: 2.4,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <Skeleton
                                variant="rectangular"
                                height={145}
                            />

                            <Box p={2}>
                                <Skeleton height={28} />
                                <Skeleton width="60%" />
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
}

function FolderCard({ folder }) {

    const router = useRouter()

    const { lang } = useParams()

    return (
        <Paper
            elevation={0}
            sx={{
                blockSize: 250,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                transition: ".25s",
                cursor: "pointer",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 14px 35px rgba(15,23,42,.12)",
                    borderColor: "#cbd5e1",
                },
            }}
            onClick={() => router.push(
                `/${lang}/apps/moduleProgram/detail/${folder?._id}`
            )}
        >
            <Box
                component="img"
                src={`${assetsUrl}/program_module/${folder?.image_url}`}
                alt={folder.title}
                sx={{
                    inlineSize: "100%",
                    blockSize: 145,
                    objectFit: "cover",
                }}
            />

            <Box p={2}>
                <Typography
                    fontWeight={700}
                    sx={{
                        fontSize: 15,
                        lineHeight: 1.4,
                        mb: 1,
                        minHeight: 42,
                    }}
                >
                    {folder.title}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                    <IconFolder size={16} color="#64748b" />
                    <Typography variant="body2" color="text.secondary">
                        {folder.modules.length} Modules
                    </Typography>
                </Stack>
            </Box>
        </Paper>
    );
}

export default function ProgramsDashboard() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const { data: session } = useSession()
    const token = session?.user?.token

    const [expandedPrograms, setExpandedPrograms] = useState({});
    const [programData, setProgramData] = useState();

    const [loading, setLoading] = useState(true);

    const fetchProgramData = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/user/my-program/fetch/data`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (response.ok) {
                setProgramData(result?.data || []);
            } else {
                console.error(result);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const PROGRAMS_PER_PAGE = 3;

    const [page, setPage] = useState(1);

    const totalPages = Math.ceil((programData?.length || 0) / PROGRAMS_PER_PAGE);

    const paginatedPrograms =
        programData?.slice(
            (page - 1) * PROGRAMS_PER_PAGE,
            page * PROGRAMS_PER_PAGE
        ) || [];

    useEffect(() => {
        if (token) {
            fetchProgramData();
        }
    }, [token])

    const togglecontent_folders = (programId) => {
        setExpandedPrograms((prev) => ({
            ...prev,
            [programId]: !prev[programId],
        }));
    };

    if (loading) {
        return (
            <>
                {[1, 2, 3].map((item) => (
                    <ProgramSkeleton key={item} />
                ))}
            </>
        )
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
            }}
        >
            <Typography
                variant="h4"
                fontWeight={800}
            >
                Programs Dashboard
            </Typography>

            <Typography color="text.secondary" mb={5}>
                Complete your learning, one step at a time.
            </Typography>

            {paginatedPrograms?.map((program) => (
                <Paper
                    key={program._id}
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 24px rgba(15,23,42,.04)",
                    }}
                >
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                    >
                        <Box
                            component="img"
                            src={`${assetsUrl}/program_module/${program?.image_url}`}
                            sx={{
                                width: { xs: "100%", md: 190 },
                                height: 120,
                                borderRadius: 2,
                                objectFit: "cover",
                                flexShrink: 0,
                            }}
                        />

                        <Box flex={1}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                            >
                                <Box>
                                    <Typography
                                        fontWeight={800}
                                        fontSize={22}
                                        color="#0f172a"
                                    >
                                        {program.title}
                                    </Typography>


                                </Box>
                            </Stack>

                            <Typography
                                color="text.secondary"
                                mt={2}
                                sx={{ maxWidth: 750 }}
                            >
                                {program.description}
                            </Typography>

                        </Box>
                    </Stack>

                    <Divider sx={{ my: 4 }} />

                    <Grid container spacing={2}>
                        {(expandedPrograms[program._id]
                            ? program?.content_folders
                            : program?.content_folders?.slice(0, 5)
                        )?.map((folder) => (
                            <Grid
                                key={folder._id}
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 4,
                                    lg: 2.4,
                                }}
                            >
                                <FolderCard folder={folder} />
                            </Grid>
                        ))}
                    </Grid>

                    {program?.content_folders?.length > 5 && (
                        <Box
                            mt={2}
                            display="flex"
                            justifyContent="center"
                        >
                            <Typography
                                onClick={() => togglecontent_folders(program._id)}
                                sx={{
                                    cursor: "pointer",
                                    color: "primary.main",
                                    fontWeight: 700,
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                {expandedPrograms[program._id]
                                    ? "View Less"
                                    : `View More (${program?.content_folders?.length - 5})`}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            ))}

            <Box display="flex" justifyContent="center" mt={5}>
                {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <Pagination
                            page={page}
                            count={totalPages}
                            color="primary"
                            shape="rounded"
                            size="large"
                            onChange={(event, value) => {
                                setPage(value);
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                });
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
