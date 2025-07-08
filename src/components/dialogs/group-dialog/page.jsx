'use client'

import { useState, useEffect, useRef } from 'react'

import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, FormControl, FormControlLabel,
    FormGroup, RadioGroup, Radio, Checkbox, Button, CircularProgress
} from '@mui/material'

import { useForm, Controller } from 'react-hook-form'

import { valibotResolver } from '@hookform/resolvers/valibot'

import { object, string, array, pipe, minLength, maxLength, boolean, regex } from 'valibot'

import { useSession } from 'next-auth/react'

import { toast } from 'react-toastify'

import DialogCloseButton from '../DialogCloseButton'

import CustomTextField from '@core/components/mui/TextField'


import ImportComponent from '@/components/ImportComponent';

// Validation Schema
const schema = object({
    name: pipe(
        string(),
        minLength(1, 'Name is required'),
        maxLength(50, 'Name can be a maximum of 50 characters'),
        regex(/^[A-Za-z\s]+$/, 'Only alphabets and spaces are allowed')
    ),
    description: pipe(
        string(),
        minLength(1, 'Description is required'),
        maxLength(5000, 'Description can be a maximum of 5000 characters')
    ),
    status: boolean(),
    users: pipe(array(string()), minLength(1, 'At least one user must be selected'))
})

const GroupDialog = ({ open, setOpen, title = '', fetchRoleData, selectedRole, tableData }) => {
    const { data: session } = useSession()
    const token = session?.user?.token
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const [userList, setUserList] = useState([])
    const [loading, setLoading] = useState(false)
    const calledRef = useRef(false)

    const [matchUserId, setMatchUserId] = useState([])

    const [isImport, setIsImport] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        setError,
        watch,
        formState: { errors }
    } = useForm({
        resolver: valibotResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            status: true,
            users: []
        }
    })

    const selectedUsers = watch('users')

    const handleClose = () => {
        setOpen(false)
        reset()
    }

    const loadData = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/company`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            
            const data = await response.json()
            
            if (response.ok) {
                setUserList(data?.data?.company || [])
            }
        } catch (error) {
            console.error('Error loading company users:', error)
        }
    }

    useEffect(() => {
        if (token && !calledRef.current) {
            calledRef.current = true
            loadData()
        }
    }, [token])

    useEffect(() => {
        if (open && selectedRole) {
            reset({
                name: selectedRole?.name || '',
                description: selectedRole?.description || '',
                status: selectedRole?.status ?? true,
                users: selectedRole?.userId || []
            })
        }
    }, [open, selectedRole, reset])

    const toggleUser = (userId) => {
        const updated = selectedUsers.includes(userId)
            ? selectedUsers.filter(id => id !== userId)
            : [...selectedUsers, userId]

        setValue('users', updated, { shouldValidate: true })
    }

    const handleImportClose = () => {
        setIsImport(false);
    };


    const submitData = async (values) => {

        setLoading(true)

        try {
            const response = await fetch(
                selectedRole ? `${API_URL}/company/group/${selectedRole._id}` : `${API_URL}/company/group`,
                {
                    method: selectedRole ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(values)
                }
            )

            const data = await response.json()

            if (response.ok) {

                fetchRoleData?.()
                toast.success(`Group ${selectedRole ? 'updated' : 'added'} successfully!`, {
                    autoClose: 700
                })
            } else {
                console.error('Server error response:', data)
            }
        } catch (err) {
            console.error('Submit error:', err)
        } finally {
            setLoading(false)
            handleClose()
        }
    }

    useEffect(() => {
        if (matchUserId && matchUserId.length > 0 && userList.length > 0) {
            // Ensure only user IDs that exist in the userList are included
            const validMatchedIds = matchUserId.filter(id => userList.some(user => user._id === id))

            // Combine old + new selected users, ensuring no duplicates
            const updatedUsers = Array.from(new Set([...selectedUsers, ...validMatchedIds]))

            // Update form value
            setValue('users', updatedUsers, { shouldValidate: true })
        }
    }, [matchUserId, userList]) // re-run when either updates

    if (!userList) return null

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            scroll="body"
            open={open}
            closeAfterTransition={false}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <DialogCloseButton onClick={handleClose}>
                <i className="tabler-x" />
            </DialogCloseButton>

            <DialogTitle variant="h4" className="text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
                {selectedRole ? 'Edit Group' : 'Add Group'}
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)} noValidate>
                <DialogContent className="flex flex-col gap-6 pbs-0 sm:pli-16">
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                label="Group Name"
                                required
                                placeholder="Enter Group Name"
                                fullWidth
                                variant="outlined"
                                onKeyDown={(e) => {
                                    const key = e.key
                                    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' ']
                                    
                                    if (!/^[a-zA-Z ]$/.test(key) && !allowed.includes(key)) {
                                        e.preventDefault()
                                    }
                                }}
                                onPaste={(e) => {
                                    const paste = e.clipboardData.getData('text')
                                    
                                    if (!/^[a-zA-Z ]+$/.test(paste)) {
                                        e.preventDefault()
                                    }
                                }}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                label="Description"
                                placeholder="Enter Group Description"
                                variant="outlined"
                                fullWidth
                                required
                                multiline
                                rows={4}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                            />
                        )}
                    />

                    <FormControl>
                        <Typography variant="h6" className="mbe-2">
                            Status <span>*</span>
                        </Typography>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    value={String(field.value)}
                                    onChange={(e) => field.onChange(e.target.value === 'true')}
                                >
                                    <FormControlLabel value="true" control={<Radio />} label="Active" />
                                    <FormControlLabel value="false" control={<Radio />} label="Inactive" />
                                </RadioGroup>
                            )}
                        />
                    </FormControl>

                    <div className="flex items-center justify-between">
                        <Typography variant="h6" className="min-w-[225px]">
                            User List <span>*</span>
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                                setIsImport(true)
                            }}
                        >
                            <span><i className='tabler-upload' style={{ fontSize: '20px', marginRight: "5px" }}></i></span>  Import user
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {userList.map((user, index) => {
                            const activeCode = user.codes?.find(c => c.type === "active")?.code;

                            return (
                                <div key={user._id || index} className="border p-3 rounded-md">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => toggleUser(user._id)}
                                            />
                                        }
                                        label={`${user.first_name} ${user.last_name} ${user.email} ${activeCode || ''}`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {errors.users?.message && (
                        <Typography
                            color="error"
                            style={{ color: 'var(--mui-palette-error-main)' }}
                            variant="body2"
                            className="mt-2"
                        >
                            {errors.users.message}
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
                    <Button variant="contained" type="submit" disabled={loading}>
                        {loading ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : selectedRole ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant="tonal" type="button" color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>

            <ImportComponent open={isImport} onClose={handleImportClose} setMatchUserId={setMatchUserId} matchUserId={matchUserId} />

        </Dialog>
    )
}

export default GroupDialog
