// MUI Imports
"use client"

import { useState, useEffect } from "react"

import { useSession } from 'next-auth/react'

import Grid from '@mui/material/Grid2'

// Components
import TopStats from '@/views/learner/TopStats'
import ProgressSection from '@/views/learner/ProgressSection'
import ModulesAndActivity from '@/views/learner/ModulesAndActivity'
import RecentActivities from '@/views/learner/RecentActivities'

const LearnerDashboard = () => {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const { data: session } = useSession();
    const token = session?.user?.token;

    const [dashboardData, setDashboardData] = useState();

    const fetchDashboardData = async () => {
        try {

            const response = await fetch(`${API_URL}/user/dashboard/user/data`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const value = await response.json();

            if (response.ok) {

                const data = value?.data;

                console.log("Data", data);

                setDashboardData(data);

            }

        } catch (error) {
            throw new Error(error)
        }
    }

    useEffect(() => {

        if (API_URL && token) {

            fetchDashboardData();
        }

    }, [API_URL, token])

    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <TopStats />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <ProgressSection />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <ModulesAndActivity />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <RecentActivities />
            </Grid>
        </Grid>
    )
}

export default LearnerDashboard
