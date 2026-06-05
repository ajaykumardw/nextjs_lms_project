'use client';

import React, { useState, useEffect } from "react";

import { useParams } from 'next/navigation'

import { useSession } from "next-auth/react";

import {
    Box,
    Card,
    Typography,
    TextField,
    Divider,
    Button,
    Skeleton,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { toast } from 'react-toastify'

import PermissionGuardClient from "@/hocs/PermissionClientGuard";

export default function GamificationPointsPage() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const { lang: locale } = useParams()

    const { data: session } = useSession();
    const token = session?.user?.token;

    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [initialFormData, setInitialFormData] = useState({});

    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const fetchLeaderboardData = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/company/leaderboard/data`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {

                const result = data?.data || [];

                const initialValues = {};

                result.forEach((section) => {
                    section.label_data?.forEach((item) => {
                        initialValues[item._id] = item.value ?? "";
                    });
                });

                setFormData(initialValues);
                setInitialFormData(initialValues);

                setLeaderboardData(result);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (API_URL && token) {
            fetchLeaderboardData();
        }
    }, [API_URL, token]);

    const handleChange = (labelId, value) => {

        // Allow only numbers and negative sign
        if (!/^-?\d*$/.test(value)) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [labelId]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [labelId]: "",
        }));
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setErrors({});
    };

    const dataSave = async () => {

        const newErrors = {};
        const payload = [];

        Object.entries(formData).forEach(([label_id, value]) => {

            if (value === "" || value === null || value === undefined) {
                newErrors[label_id] = "This field is required.";

                return;
            }

            payload.push({
                label_id,
                value: Number(value),
            });
        });

        if (Object.keys(newErrors).length > 0) {

            setErrors(newErrors);

            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/company/leaderboard/config`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        leaderboard_data: payload,
                    }),
                }
            );

            if (response.ok) {

                toast.success("Leaderboard data saved successfully", {
                    autoClose: 3000,
                });

                await fetchLeaderboardData();

            }

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <PermissionGuardClient locale={locale} element={"isCompany"}>
            <Card
                sx={{
                    p: 3,
                    height: "85vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Gamification Points
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Configure points awarded for learner activities.
                        </Typography>
                    </Box>

                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>

                        <Button variant="contained" onClick={dataSave}>
                            Save Changes
                        </Button>
                    </Box>
                </Box>

                <Divider />

                {/* Content */}
                <Box
                    sx={{
                        mt: 2,
                        overflowY: "auto",
                        flex: 1,
                        pr: 1,
                    }}
                >
                    {loading ? (
                        [...Array(4)].map((_, sectionIndex) => (
                            <Box key={sectionIndex} mb={4}>
                                {/* Section Title */}
                                <Skeleton
                                    variant="text"
                                    width={220}
                                    height={40}
                                    sx={{ mb: 2 }}
                                />

                                <Grid container spacing={2}>
                                    {[...Array(6)].map((_, itemIndex) => (
                                        <React.Fragment key={itemIndex}>
                                            <Grid item size={{ xs: 9 }} >
                                                <Skeleton
                                                    variant="text"
                                                    height={28}
                                                />
                                            </Grid>

                                            <Grid item size={{ xs: 3 }}>
                                                <Skeleton
                                                    variant="rounded"
                                                    height={40}
                                                />
                                            </Grid>
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            </Box>
                        ))
                    ) : (
                        leaderboardData?.map((section) => (
                            <Box key={section._id} mb={4}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 600,
                                        color: "primary.main",
                                        pb: 1,
                                    }}
                                >
                                    {section.title}
                                </Typography>

                                <Grid container spacing={2}>
                                    {section?.label_data?.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <Grid item size={{ xs: 9 }}>
                                                <Typography variant="body2">
                                                    {item.label}
                                                </Typography>
                                            </Grid>

                                            <Grid item size={{ xs: 3 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={formData[item._id] ?? ""}
                                                    onChange={(e) =>
                                                        handleChange(item._id, e.target.value)
                                                    }
                                                    error={Boolean(errors[item._id])}
                                                    helperText={errors[item._id]}
                                                    inputProps={{
                                                        inputMode: "numeric",
                                                    }}
                                                />
                                            </Grid>
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            </Box>
                        ))
                    )}
                </Box>
            </Card>
        </PermissionGuardClient>
    );
}
