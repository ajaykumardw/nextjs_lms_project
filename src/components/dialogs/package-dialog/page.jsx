// Imports
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
    object,
    string,
    minLength,
    maxLength,
    nonEmpty,
    boolean,
    number
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
import MenuItem from '@mui/material/MenuItem'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'
import { useSession } from 'next-auth/react'
import SkeletonFormComponent from '@/components/skeleton/form/page'

// Schema
const schema = object({
    name: string([
        nonEmpty('Package Type Name is required'),
        minLength(4, 'Too short'),
        maxLength(25, 'Too long')
    ]),
    description: string([
        maxLength(255, 'Description too long')
    ]),
    amount: string([nonEmpty('Please provide an amount')]), // ← FIXED
    packagetype: string([nonEmpty('Please select a package type')]),
    status: boolean()
});

const AddContent = ({ control, errors, createData }) => (
    <DialogContent className="overflow-visible pbs-0 sm:pli-16">
        {/* name */}
        <Controller
            name="name"
            control={control}
            render={({ field }) => (
                <CustomTextField
                    {...field}
                    fullWidth
                    label="Package Name"
                    variant="outlined"
                    placeholder="Enter Package Type Name"
                    className="mbe-2"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                />
            )}
        />

        {/* amount */}
        <Controller
            name="amount"
            control={control}
            render={({ field }) => (
                <CustomTextField
                    {...field}
                    fullWidth
                    value={field.value || ''}  // Fix: Use field.value instead of hardcoding 0
                    label="Amount"
                    variant="outlined"
                    placeholder="Enter Amount"
                    className="mbe-2"
                    error={!!errors.amount}
                    helperText={typeof errors?.amount?.message === 'string' ? errors.amount.message : ''}
                    onChange={(e) => field.onChange(e.target.value)}  // Make sure value updates correctly
                />
            )}
        />

        {/* description */}
        <Controller name="description" control={control} render={({ field }) => (
            <CustomTextField {...field} fullWidth label="Description" variant="outlined" placeholder="Enter Package Type Description" className="mbe-2" multiline rows={4} error={!!errors.description} helperText={errors?.description?.message} />
        )} />

        {/* packagetype */}
        <Controller name="packagetype" control={control} render={({ field }) => (
            <CustomTextField {...field} select fullWidth label="Package Type" variant="outlined" placeholder="Select Package Type" className="mbe-2" error={!!errors.packagetype} helperText={errors?.packagetype?.message}>
                {createData.map((data) => (
                    <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                ))}
            </CustomTextField>
        )} />

        {/* status */}
        <Typography variant="h6" className="mbe-2">Status</Typography>
        <FormControl component="fieldset" error={!!errors.status}>
            <Controller name="status" control={control} render={({ field }) => (
                <RadioGroup row value={field.value?.toString()} onChange={(e) => field.onChange(e.target.value === "true")}>
                    <FormControlLabel value="true" control={<Radio />} label="Active" />
                    <FormControlLabel value="false" control={<Radio />} label="Inactive" />
                </RadioGroup>
            )} />
            {errors?.status && <Alert severity="error">{errors?.status?.message}</Alert>}
        </FormControl>
    </DialogContent>
);

// Edit Content Component
const EditContent = ({ control, errors, createData }) => (
    <DialogContent className="overflow-visible pbs-0 sm:pli-16">
        <Controller
            name="name"
            control={control}
            render={({ field }) => (
                <CustomTextField
                    {...field}
                    fullWidth
                    label="Package Name"
                    variant="outlined"
                    placeholder="Enter Package Type Name"
                    className="mbe-2"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                />
            )}
        />
        <Controller
            name="amount"
            control={control}
            render={({ field }) => (
                <CustomTextField
                    {...field}
                    fullWidth
                    label="Amount"
                    variant="outlined"
                    placeholder="Enter Amount"
                    className="mbe-2"
                    error={!!errors.amount}
                    helperText={typeof errors?.amount?.message === 'string' ? errors.amount.message : ''}
                />
            )}
        />
        <Controller
            name="description"
            control={control}
            render={({ field }) => (
                <CustomTextField
                    {...field}
                    fullWidth
                    label="Description"
                    variant="outlined"
                    placeholder="Enter Package Type Description"
                    className="mbe-2"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors?.description?.message}
                />
            )}
        />

        <Controller name="packagetype" control={control} render={({ field }) => (
            <CustomTextField {...field} select fullWidth label="Package Type" variant="outlined" placeholder="Select Package Type" className="mbe-2" error={!!errors.packagetype} helperText={errors?.packagetype?.message}>
                {createData.map((data) => (
                    <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                ))}
            </CustomTextField>
        )} />

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
const PackageDialog = ({ open, setOpen, data, fetchPackage }) => {

    const handleClose = () => setOpen(false)
    const URL = process.env.NEXT_PUBLIC_API_URL
    const { data: session } = useSession() || {}
    const token = session?.user?.token
    const [createData, setCreateData] = useState();

    const {
        handleSubmit,
        control,
        setError,
        reset,
        formState: { errors, isValid, isSubmitting }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            _id: data?._id || '',
            name: data?.name || '',
            description: data?.description || '',
            packagetype: data?.package_type_id || '',
            amount: `${data?.amount || '0'}`, // Make sure it's always a string
            status: data?.status ?? false
        },
        resolver: valibotResolver(schema)
    });

    useEffect(() => {

        if (open) {
            reset({
                _id: data?._id || '',
                name: data?.name || '',
                description: data?.description || '',
                packagetype: data?.package_type_id || '',
                amount: `${data?.amount || ''}` || '',
                status: data?.status ?? false
            })
        }
    }, [open, data, reset])

    const createForm = async () => {
        try {
            const response = await fetch(`${URL}/admin/package/create`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setCreateData(data.data);
            } else {
                console.error("Error:", data);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    useEffect(() => {
        if (URL && token) {
            createForm();
        }
    }, [URL, token]);

    const submitPackage = async (formData) => {
        try {
            const response = await fetch(
                data ? `${URL}/admin/package/${data?.package_type_id}/${data?._id}` : `${URL}/admin/package`,
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

                console.log("Result", result);

                handleClose()
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

        let errorState = false;
        if (!formData.name) {
            setError('name', {
                type: 'manual',
                message: 'This name is required.'
            })
            errorState = true;
        }
        if (formData.name.length > 25 || formData.name.length < 4) {
            setError('name', {
                type: 'manual',
                message: 'Name length should be within 4 and 25'
            })
            errorState = true;
        }
        if (!formData.description) {
            setError('description', {
                type: 'manual',
                message: "Description is required"
            });
            errorState = true;
        }
        if (formData.description.length > 2000 || formData.description.length < 1) {
            setError('description', {
                type: 'manual',
                message: 'Name length should be within 1 and 2000'
            })
            errorState = true;
        }


        if (!formData.amount) {
            setError('amount', {
                type: 'manual',
                message: "Amount is required"
            });
            errorState = true;
        }

        if (formData.amount.length > 10 && formData.amount.length < 1 || formData.amount == 'undefined') {
            setError('amount', {
                type: 'manual',
                message: "Name length should be within 1 and 10"
            });
            errorState = true;
        }

        console.log("form data", formData);


        if (formData.amount > 100000000 || formData.amount < 1) {
            setError('amount', {
                type: 'manual',
                message: "Amount range should be between 1 to 100 million"
            });
            errorState = true;
        }

        if (!formData.packagetype) {
            setError('packagetype', {
                type: 'manual',
                message: "Package Type is required"
            });
            errorState = true;
        }

        if (errorState) return;

        submitPackage(formData)

    }

    console.log("Data", data);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            closeAfterTransition={false}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogCloseButton onClick={handleClose} disableRipple>
                    <i className="tabler-x" />
                </DialogCloseButton>
                <DialogTitle
                    variant="h4"
                    className="flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16"
                >
                    {data ? 'Edit Package' : 'Add New Package'}
                    <Typography component="span" className="flex flex-col text-center">
                        {data
                            ? 'Edit Package as per your requirements.'
                            : 'Package you may use and assign to your users.'}
                    </Typography>
                </DialogTitle>

                {
                    createData ? (
                        data ? (
                            <EditContent control={control} errors={errors} createData={createData} />
                        ) : (
                            <AddContent control={control} errors={errors} createData={createData} />
                        )
                    ) : (
                        <SkeletonFormComponent />
                    )
                }

                <DialogActions className="flex max-sm:flex-col max-sm:items-center max-sm:gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16">
                    <Button
                        type="submit"
                        variant="contained"
                    >
                        {data ? 'Update' : 'Create Package'}
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
        </Dialog >
    )
}

export default PackageDialog
