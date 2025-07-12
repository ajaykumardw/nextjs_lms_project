'use client'

import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CreateNewModuleLayout from '@/views/apps/modules/form/index';



import PermissionGuard from '@/hocs/PermissionClientGuard'

const CreateNewModuleLayouts = () => {

    const { lang: locale } = useParams()

    return (
        <PermissionGuard locale={locale} element={'isCompany'}>
            <Grid container spacing={6}>
                <Grid size={{ xs: 12 }}>
                    <CreateNewModuleLayout />
                </Grid>
            </Grid>
        </PermissionGuard>
    )
}

export default CreateNewModuleLayouts
