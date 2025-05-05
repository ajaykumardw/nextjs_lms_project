// Imports
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
    object,
    string,
    minLength,
    pipe,
    maxLength,
    boolean
} from 'valibot'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'
import { useSession } from 'next-auth/react'

// Schema
const schema = object({
    name: pipe(
        string(),
        minLength(1, 'This field is required'),
        maxLength(255, "Name can be maximum of 255 length")
    ),
    status: boolean()
})

// Add Content Component
const AddContent = ({ control, errors }) => (
    <DialogContent className="overflow-visible pbs-0 sm:pli-16">
        <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
                <CustomTextField
                    {...field}
                    autoFocus
                    fullWidth
                    label="Package Type Name"
                    variant="outlined"
                    placeholder="Enter Package Type Name"
                    className="mbe-2"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                />
            )}
        />

        <Typography variant="h6" className="mbe-2">Status</Typography>
        <FormControl component="fieldset" error={!!errors.status}>
            <FormLabel component="legend">Select Status</FormLabel>
            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <RadioGroup
                        row
                        value={field.value.toString()}
                        onChange={(e) => field.onChange(e.target.value === "true")}
                    >
                        <FormControlLabel value="true" control={<Radio />} label="Active" />
                        <FormControlLabel value="false" control={<Radio />} label="Inactive" />
                    </RadioGroup>
                )}
            />
            {errors?.status && <Alert severity="error">{errors?.status?.message}</Alert>}
        </FormControl>
    </DialogContent>
)

// Edit Content Component
const EditContent = ({ control, errors }) => (
    <DialogContent className="overflow-visible pbs-0 sm:pli-16">
        <div className="flex items-end gap-4 mbe-2">
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <CustomTextField
                        {...field}
                        fullWidth
                        size="small"
                        variant="outlined"
                        label="Package Type Name"
                        placeholder="Enter Package Type Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                )}
            />
        </div>

        <Typography variant="h6" className="mbe-2">Status</Typography>
        <FormControl component="fieldset" error={!!errors.status}>
            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <RadioGroup
                        row
                        value={field.value?.toString()}
                        onChange={(e) => field.onChange(e.target.value === "true")}
                    >
                        <FormControlLabel value="true" control={<Radio />} label="Active" />
                        <FormControlLabel value="false" control={<Radio />} label="Inactive" />
                    </RadioGroup>
                )}
            />
            {errors?.status && <Alert severity="error">{errors?.status?.message}</Alert>}
        </FormControl>
    </DialogContent>
)

// Main Dialog Component
const PackageTypeDialog = ({ open, setOpen, data, fetchPackage }) => {
    const handleClose = () => {
        setOpen(false)
        fetchPackage();
    }
    const URL = process.env.NEXT_PUBLIC_API_URL
    const { data: session } = useSession() || {}
    const token = session?.user?.token

    // Form setup
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: valibotResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: data?.name || '',
            status: data?.status ?? false
        },
    })

    // Reset form when dialog opens with new data
    useEffect(() => {
        if (open) {
            reset({
                name: data?.name || '',
                status: data?.status ?? false
            })
        }
    }, [open, data, reset])

    // Form submit
    const submitPackageType = async (formData) => {
        try {
            const response = await fetch(
                data ? `${URL}/admin/package-type/${data?._id}` : `${URL}/admin/package-type`,
                {
                    method: data ? "PUT" : "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            )

            const result = await response.json()

            if (response.ok) {
                handleClose();
                if (typeof fetchPackage === 'function') {
                    fetchPackage();
                }
            } else {
                console.error("Failed to save data:", result?.message || result)
            }
        } catch (error) {
            console.error("Error submitting package type:", error)
        }
    }

    const onSubmit = (formData) => {

        submitPackageType(formData)

    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            closeAfterTransition={false}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                action={() => { }}
            >
                <DialogCloseButton onClick={handleClose}
                    disableRipple>
                    <i className="tabler-x" />
                </DialogCloseButton>
                <DialogTitle
                    variant="h4"
                    className="flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16"
                >
                    {data ? 'Edit Package Type' : 'Add New Package Type'}
                    <Typography component="span" className="flex flex-col text-center">
                        {data
                            ? 'Edit Package Type as per your requirements.'
                            : 'Package Type you may use and assign to your users.'}
                    </Typography>
                </DialogTitle>

                {data
                    ? <EditContent control={control} errors={errors} />
                    : <AddContent control={control} errors={errors} />
                }

                <DialogActions className="flex max-sm:flex-col max-sm:items-center max-sm:gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16">
                    <Button
                        type="submit"
                        variant="contained"
                    // disabled={!isValid || isSubmitting}
                    >
                        {data ? 'Update' : 'Create Package Type'}
                    </Button>
                    <Button
                        onClick={handleClose}
                        variant="tonal"
                        color="secondary"
                        className="max-sm:mis-0"
                    >
                        Discard
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default PackageTypeDialog
