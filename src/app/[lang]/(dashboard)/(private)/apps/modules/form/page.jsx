// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CreateNewModuleLayout from '@/views/apps/modules/form/index';

const CreateNewModuleLayouts = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <CreateNewModuleLayout />
            </Grid>
        </Grid>
    )
}

export default CreateNewModuleLayouts
