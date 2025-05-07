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
import AlertTitle from '@mui/material/AlertTitle'

// React Hook Form
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// Valibot schema
import { object, string, minLength, pipe, maxLength, boolean } from 'valibot'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

const schema = object({
  name: pipe(
    string(),
    minLength(1, 'Name is required'),
    maxLength(255, 'Name can be maximum of 255 characters')
  ),
  status: boolean()
})

const AddContent = ({ control, errors }) => (
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

const EditContent = ({ control, errors }) => (
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

const PermissionDialog = ({ open, setOpen, data, fetchPermissionModule }) => {
  const handleClose = () => setOpen(false)

  const URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession() || {}
  const token = session?.user?.token

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: valibotResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: data?.name || '',
      status: data?.status ?? false
    }
  })

  useEffect(() => {
    if (data) {
      reset({
        name: data.name || '',
        status: data.status ?? false
      })
    }
  }, [data, reset])

  const submitData = async (VALUE) => {
    try {
      const response = await fetch(data ? `${URL}/admin/permission-module/${data?._id}` : `${URL}/admin/permission-module`,
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

        {data ? (
          <EditContent control={control} errors={errors} />
        ) : (
          <AddContent control={control} errors={errors} />
        )}

        <DialogActions className='flex max-sm:flex-col max-sm:items-center max-sm:gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button type='submit' variant='contained' >
            {data ? 'Update' : 'Create Permission'}
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
