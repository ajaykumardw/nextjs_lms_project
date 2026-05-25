'use client'

import { useState } from 'react'

import { useForm } from 'react-hook-form'

// Valibot
import { valibotResolver } from '@hookform/resolvers/valibot'

import {
  object,
  string,
  pipe,
  minLength,
  maxLength,
  regex,
  forward,
  partialCheck
} from 'valibot'

import { useSession } from 'next-auth/react'

import { toast } from 'react-toastify'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Custom Component
import CustomTextField from '@/@core/components/mui/TextField'

// Password Regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W])(?!.*\s).{8,}$/

// Schema
const ChangePasswordSchema = forward(
  object({
    current_password: pipe(
      string(),
      minLength(1, 'Current password is required'),
      maxLength(
        100,
        'Current password can be a maximum of 100 characters'
      )
    ),

    new_password: pipe(
      string(),
      minLength(8, 'Password must be at least 8 characters'),
      maxLength(
        100,
        'Password can be a maximum of 100 characters'
      ),
      regex(
        passwordRegex,
        'Password must contain uppercase, lowercase, and number/symbol'
      )
    ),

    confirm_password: pipe(
      string(),
      minLength(1, 'Confirm password is required'),
      maxLength(
        100,
        'Confirm password can be a maximum of 100 characters'
      )
    )
  }),

  ['confirm_password'],

  partialCheck(
    [['new_password'], ['confirm_password']],
    input => input.new_password === input.confirm_password,
    'Passwords do not match'
  )
)

const ChangePassword = () => {
  const { data: session } = useSession()

  const token = session?.user?.token

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [isCurrentPasswordShown, setIsCurrentPasswordShown] =
    useState(false)

  const [isNewPasswordShown, setIsNewPasswordShown] =
    useState(false)

  const [isConfirmPasswordShown, setIsConfirmPasswordShown] =
    useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: valibotResolver(ChangePasswordSchema),

    mode: 'onSubmit',

    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  })

  const onSubmit = async data => {
    try {
      console.log('FORM DATA =>', data)

      const response = await fetch(
        `${API_URL}/company/user/profile/change/password`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(data)
        }
      )

      const result = await response.json()

      console.log('API RESPONSE =>', result)

      if (response.ok) {
        toast.success('Password changed successfully', {
          autoClose: 1000
        })

        reset()
      } else {
        toast.error(
          result?.message || 'Failed to change password',
          {
            autoClose: 1000
          }
        )
      }
    } catch (error) {
      console.log('ERROR =>', error)

      toast.error(
        'An error occurred while changing the password',
        {
          autoClose: 1000
        }
      )
    }
  }

  return (
    <Card>
      <CardHeader
        title='Change Password'
        avatar={
          <i className='tabler-lock text-textSecondary' />
        }
        titleTypographyProps={{ variant: 'h5' }}
      />

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            {/* Current Password */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                {...register('current_password')}
                fullWidth
                label='Current Password'
                type={
                  isCurrentPasswordShown
                    ? 'text'
                    : 'password'
                }
                placeholder='············'
                error={!!errors.current_password}
                helperText={
                  errors.current_password?.message
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() =>
                            setIsCurrentPasswordShown(
                              !isCurrentPasswordShown
                            )
                          }
                          onMouseDown={e =>
                            e.preventDefault()
                          }
                        >
                          <i
                            className={
                              isCurrentPasswordShown
                                ? 'tabler-eye-off'
                                : 'tabler-eye'
                            }
                          />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>

            {/* New Password */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                {...register('new_password')}
                fullWidth
                label='New Password'
                type={
                  isNewPasswordShown
                    ? 'text'
                    : 'password'
                }
                placeholder='············'
                error={!!errors.new_password}
                helperText={
                  errors.new_password?.message
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() =>
                            setIsNewPasswordShown(
                              !isNewPasswordShown
                            )
                          }
                          onMouseDown={e =>
                            e.preventDefault()
                          }
                        >
                          <i
                            className={
                              isNewPasswordShown
                                ? 'tabler-eye-off'
                                : 'tabler-eye'
                            }
                          />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>

            {/* Confirm Password */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                {...register('confirm_password')}
                fullWidth
                label='Confirm New Password'
                type={
                  isConfirmPasswordShown
                    ? 'text'
                    : 'password'
                }
                placeholder='············'
                error={!!errors.confirm_password}
                helperText={
                  errors.confirm_password?.message
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() =>
                            setIsConfirmPasswordShown(
                              !isConfirmPasswordShown
                            )
                          }
                          onMouseDown={e =>
                            e.preventDefault()
                          }
                        >
                          <i
                            className={
                              isConfirmPasswordShown
                                ? 'tabler-eye-off'
                                : 'tabler-eye'
                            }
                          />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>

            {/* Password Requirements */}
            <Grid
              size={{ xs: 12 }}
              className='flex flex-col gap-4'
            >
              <Typography variant='h6'>
                Password Requirements:
              </Typography>

              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  Minimum 8 characters long
                </div>

                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  At least one uppercase and one lowercase
                  letter
                </div>

                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  At least one number or special character
                </div>

                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  Spaces are not allowed
                </div>
              </div>
            </Grid>

            {/* Buttons */}
            <Grid
              size={{ xs: 12 }}
              className='flex gap-4'
            >
              <Button
                variant='contained'
                type='submit'
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : 'Save Changes'}
              </Button>

              <Button
                variant='tonal'
                color='secondary'
                type='button'
                onClick={() => reset()}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePassword
