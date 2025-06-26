// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ModuleTypes from '@/views/apps/modules/form/module-type';

const ModuleTypesLayouts = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <ModuleTypes />
            </Grid>
        </Grid>
    )
}

export default ModuleTypesLayouts
