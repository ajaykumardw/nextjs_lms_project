'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    CircularProgress,
    IconButton
} from '@mui/material'

// Hook Form + Validation
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
    object,
    string,
    array,
    pipe,
    minLength,
    maxLength
} from 'valibot'

// Components
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

// Schema (with zone_id validation added)
const regionSchema = object({
    name: pipe(string(), minLength(1, 'Region name is required'), maxLength(255))
})

const schema = object({
    zone_id: pipe(string(), minLength(1, 'Zone ID is required')),
    region: pipe(array(regionSchema), minLength(1, 'At least one region must be added'))
})

const BranchDialog = ({ open, setOpen, title = '', fetchRegionData, selectedRegion, typeForm }) => {
    const { data: session } = useSession()
    const token = session?.user?.token
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: valibotResolver(schema),
        defaultValues: {
            region: [{ name: '' }],
            zone_id: ''
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'region'
    })

    const [loading, setLoading] = useState(false)

    const handleClose = () => {
        reset()
        setOpen(false)
    }

    useEffect(() => {
        if (typeForm && selectedRegion) {
            reset({
                zone_id: selectedRegion._id || '',
                region: selectedRegion.region?.map(r => ({ name: r.name })) || [{ name: '' }]
            })
        }
    }, [typeForm, selectedRegion])

    const submitData = async (formData) => {
        setLoading(true)
        try {
            const isEdit = Boolean(selectedRegion?._id)
            const url = !isEdit
                ? `${API_URL}/admin/region/${selectedRegion._id}`
                : `${API_URL}/company/region`
            const method = !isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setTimeout(() => {
                    fetchRegionData();
                }, 500); // 500ms delay to wait for the DB to settle
                handleClose();
                toast.success(`Region ${!isEdit ? 'updated' : 'added'} successfully!`, {
                    autoClose: 700
                });
            } else {
                toast.error(data?.message || 'Something went wrong')
                console.error('Server error:', data)
            }
        } catch (err) {
            console.error('Submit error:', err)
            toast.error('Network or server error.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            scroll="body"
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <DialogCloseButton onClick={handleClose}>
                <i className="tabler-x" />
            </DialogCloseButton>

            <DialogTitle variant="h4" className="text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
                {selectedRegion ? 'Edit Branch' : 'Add Branch'}
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)} noValidate>
                <DialogContent className="overflow-visible flex flex-col gap-6 sm:pli-16">
                    {fields.map((field, index) => (
                        <Grid container spacing={2} key={field.id} alignItems="center">
                            <Grid item xs={12} md={11}>
                                <Controller
                                    name={`branch.${index}.name`}
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            label="Branch Name"
                                            placeholder="Enter branch name"
                                            fullWidth
                                            error={!!errors.region?.[index]?.name}
                                            helperText={errors.region?.[index]?.name?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={1} className="flex justify-end">
                                {fields.length > 1 && (
                                    <IconButton
                                        color="error"
                                        onClick={() => remove(index)}
                                        sx={{ mt: 1 }}
                                        aria-label="Remove branch"
                                    >
                                        <i className="tabler-x" />
                                    </IconButton>
                                )}
                            </Grid>
                        </Grid>
                    ))}

                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => append({ name: '' })}
                        startIcon={<i className="tabler-plus" />}
                        sx={{ mt: 2, alignSelf: 'flex-start' }}
                    >
                        Add more
                    </Button>
                </DialogContent>

                <DialogActions className="justify-center sm:pbe-16 sm:pli-16">
                    <Button variant="contained" type="submit" disabled={loading}>
                        {loading ? (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: 'white',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    mt: '-12px',
                                    ml: '-12px'
                                }}
                            />
                        ) : selectedRegion ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant="tonal" color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default BranchDialog
