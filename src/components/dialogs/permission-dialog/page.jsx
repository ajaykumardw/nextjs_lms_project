// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'

// React Hook Form
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// Valibot schema
import { array, string, object, pipe, minLength, maxLength, boolean, nonEmpty, value } from 'valibot'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import SkeletonFormComponent from '@/components/skeleton/form/page'
import { MenuItem } from '@mui/material'

const schema = object({
    name: pipe(
        string(),
        minLength(1, 'Name is required'),
        maxLength(255, 'Name can be maximum of 255 characters')
    ),
    permissionmodule: pipe(
        array(string()),
        nonEmpty('Select at least one permission module')
    ),
    status: boolean()
})

const AddContent = ({ control, errors, createData }) => (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
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
                        label="Permission Name"
                        placeholder="Enter Permission Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                )}
            />
        </div>

        {/* <Controller name="permissionmodule" control={control} render={({ field }) => (
            <CustomTextField {...field} select fullWidth label="Permission module" variant="outlined" placeholder="Select Package Type" className="mbe-2" error={!!errors.permissionmodule} helperText={errors?.permissionmodule?.message}>
                {createData.map((data) => (
                    <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                ))}
            </CustomTextField>
        )} /> */}

        <Controller
            name="permissionmodule"
            control={control}
            render={({ field }) => (
                <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label="Permission module"
                    variant="outlined"
                    placeholder="Select Package Type"
                    className="mbe-2"
                    error={!!errors.permissionmodule}
                    helperText={errors?.permissionmodule?.message}
                    SelectProps={{
                        multiple: true,
                        value: field.value || [], // Ensure it's always an array
                        onChange: (event) => {
                            field.onChange(event.target.value); // Pass the selected array
                        },
                    }}
                >
                    {createData.map((data) => (
                        <MenuItem key={data._id} value={data._id}>
                            {data.name}
                        </MenuItem>
                    ))}
                </CustomTextField>
            )}
        />

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

const EditContent = ({ control, errors, createData }) => (
    <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
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
                        label="Permission Name"
                        placeholder="Enter Permission Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                )}
            />
        </div>

        {/* <Controller name="permissionmodule" control={control} render={({ field }) => (
            <CustomTextField {...field} select fullWidth label="Permission module" variant="outlined" placeholder="Select Package Type" className="mbe-2" error={!!errors.permissionmodule} helperText={errors?.permissionmodule?.message}>
                {createData.map((data) => (
                    <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                ))}
            </CustomTextField>
        )} /> */}

        <Controller
            name="permissionmodule"
            control={control}
            render={({ field }) => (
                <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label="Permission module"
                    variant="outlined"
                    placeholder="Select Package Type"
                    className="mbe-2"
                    error={!!errors.permissionmodule}
                    helperText={errors?.permissionmodule?.message}
                    SelectProps={{
                        multiple: true,
                        value: field.value || [], // Ensure it's always an array
                        onChange: (event) => {
                            field.onChange(event.target.value); // Pass the selected array
                        },
                    }}
                >
                    {createData.map((data) => (
                        <MenuItem key={data._id} value={data._id}>
                            {data.name}
                        </MenuItem>
                    ))}
                </CustomTextField>
            )}
        />

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

const PermissionDialog = ({ open, setOpen, data, fetchPermissionModule, nameData }) => {
    const handleClose = () => setOpen(false)

    const URL = process.env.NEXT_PUBLIC_API_URL
    const { data: session } = useSession() || {}
    const token = session?.user?.token
    const [editData, setEditData] = useState();
    const [createData, setCreateData] = useState();

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm({
        resolver: valibotResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: data?.name || '',
            status: data?.status ?? false,
            permissionmodule: Array.isArray(data?.permission_module_id)
                ? data.permission_module_id
                : data?.permission_module_id
                    ? [data.permission_module_id]
                    : []

        }
    })

    useEffect(() => {
        if (open && data && editData) {
            reset({
                name: data.name || '',
                status: data.status ?? false,
                permissionmodule: editData || []
            })
        }
    }, [open, data, reset, editData])

    const fetchFormData = async () => {
        try {
            const response = await fetch(`${URL}/admin/permission/create`, {
                method: "GET",
                headers: {
                    // "Content-Type": "application/json",
                    'authorization': `Bearer ${token}`
                }
            })

            const data = await response.json();

            if (response.ok) {
                setCreateData(data?.data);
            }

        } catch (error) {
            console.log("Error", error);

        }
    }

    const editFormData = async (value) => {
        const response = await fetch(`${URL}/admin/permission/edit/${value._id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            setEditData(data?.data?.permission_module_id);
        }

    }

    useEffect(() => {
        if (URL && token) {
            fetchFormData();
            if (data) {
                editFormData(data);
            }
        }

    }, [URL, token, data])

    const submitData = async (VALUE) => {
        try {
            const response = await fetch(data ? `${URL}/admin/permission/${editData}/${data?._id}` : `${URL}/admin/permission`,
                {
                    method: data ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(VALUE)
                }
            );

            const responseData = await response.json();

            if (response.ok) {
                fetchPermissionModule();
            }

        } catch (error) {
            console.log("Error", error);
        }

    }

    const onSubmit = (values) => {

        if (!data) {
            const exist = nameData.find(item => item.name === values.name);
            if (exist) {
                setError('name', {
                    type: 'manual',
                    message: 'This name already exists.'
                });
                return;
            }
        } else {
            const exist = nameData.find(item =>
                item._id.toString() !== data._id.toString() && item.name === values.name
            );
            if (exist) {
                setError('name', {
                    type: 'manual',
                    message: 'This name already exists.'
                });
                return;
            }
        }

        submitData(values);
        setOpen(false)
        // handle API or logic here
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            closeAfterTransition={false}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogCloseButton onClick={handleClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>

                <DialogTitle
                    variant='h4'
                    className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'
                >
                    {data ? 'Edit Permission' : 'Add New Permission'}
                    <Typography component='span'>
                        {data
                            ? 'Edit permission as per your requirements.'
                            : 'Permission you may use and assign to your users.'}
                    </Typography>
                </DialogTitle>

                {createData ? (

                    data ? (
                        <EditContent control={control} errors={errors} createData={createData} />
                    ) : (
                        <AddContent control={control} errors={errors} createData={createData} />
                    )
                )
                    : <SkeletonFormComponent />
                }

                <DialogActions className='flex max-sm:flex-col max-sm:items-center max-sm:gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16'>
                    <Button type='submit' variant='contained' >
                        {data ? 'Update' : 'Create Package Type'}
                    </Button>
                    <Button onClick={handleClose} variant='tonal' color='secondary'>
                        Discard
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default PermissionDialog
