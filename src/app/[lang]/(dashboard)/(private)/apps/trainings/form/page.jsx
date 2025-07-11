'use client'

import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import TrainingFormLayout from '@/views/apps/trainings/form/index';



import PermissionGuard from '@/hocs/PermissionClientGuard'

const CreateNewModuleLayouts = () => {

    const { lang: locale } = useParams()

    return (
        <PermissionGuard locale={locale} element={'isCompany'}>
            <Grid container spacing={6}>
                <Grid size={{ xs: 12 }}>
                    <TrainingFormLayout />
                </Grid>
            </Grid>
        </PermissionGuard>
    )
}

export default CreateNewModuleLayouts
