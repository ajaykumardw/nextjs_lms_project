'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Box,
  Card,
  CardHeader,
  Button,
  Divider,
  MenuItem,
  Typography,
  CardActions,
  FormControlLabel,
  Checkbox,
  Avatar,
  CardContent,
  CircularProgress
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { Controller, useForm } from 'react-hook-form'

import {
  object,
  string,
  pipe,
  maxLength,
  minLength,
  optional,
  regex
} from 'valibot'

import { useDropzone } from 'react-dropzone'

import { valibotResolver } from '@hookform/resolvers/valibot'

import { toast } from 'react-toastify'

import { getLocalizedUrl } from '@/utils/i18n'

import CustomTextField from '@/@core/components/mui/TextField'

import DirectionalIcon from '../DirectionalIcon'

import SkeletonFormComponent from '../skeleton/form/page'

import AppReactDropzone from '@/libs/styles/AppReactDropzone'

const FormComponent = ({
  stage,
  id,
  editData,
  loading,
  createData,
  addURL,
  editURL,
  token,
  backURL,
  backPageName
}) => {

  const [checkCertificate, setCheckCertificate] = useState(false)
  const [selectedCertificateId, setSelectedCertificateId] = useState(null)
  const [certificateData, setCertificateData] = useState([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''
  const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL

  const params = useParams()
  const locale = params.lang
  const router = useRouter()

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [imageError, setImageError] = useState('')

  // Fetch certificates
  const handleFetchCertificate = async () => {
    try {
      const response = await fetch(`${API_URL}/company/certificate/data`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setCertificateData(result.data || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCheckboxChange = event => {
    const checked = event.target.checked

    setCheckCertificate(checked)

    if (!checked) {
      setSelectedCertificateId(null)
    }
  }

  const schema = object({
    title: pipe(
      string(),
      minLength(1, 'Title is required'),
      maxLength(100, 'Title can be max of 100 length'),
      regex(/^[A-Za-z0-9\s]+$/, 'Only alphabet and number allowed')
    ),

    description: pipe(
      string(),
      minLength(1, 'Description is required'),
      maxLength(1000, 'Description can be of max 1000 length'),
      regex(
        /^[A-Za-z0-9\s]+$/,
        'Description can only contain alphabets, numbers, and spaces'
      )
    ),

    live_session_type:
      stage === 'Live Session'
        ? pipe(
          string(),
          minLength(1, 'Live session type is required')
        )
        : optional(string())
  })

  const {
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      live_session_type: '',
      checkCertificate: false,
      selectedCertificateId: ""

    }
  })

  useEffect(() => {
    if (token) {
      handleFetchCertificate()
    }
  }, [token])

  useEffect(() => {
    if (editData) {
      setValue('title', editData?.title || '')
      setValue('description', editData?.description || '')
      setValue('live_session_type', editData?.live_session_id || '')

      setCheckCertificate(editData?.checkCertificate || false)
      setSelectedCertificateId(editData?.certificateId || null)

    }
  }, [editData, setValue])

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    maxSize: 2097152,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tif', '.tiff'],
      'image/x-icon': ['.ico']
    },

    onDrop: acceptedFiles => {
      if (!acceptedFiles.length) return

      const selectedFile = acceptedFiles[0]

      setFile(selectedFile)
      setImageError('')

      const reader = new FileReader()

      reader.onload = e => {
        setPreview(e.target.result)
      }

      reader.readAsDataURL(selectedFile)
    },

    onDropRejected: rejectedFiles => {
      rejectedFiles.forEach(file => {
        file.errors.forEach(error => {
          let msg = ''

          switch (error.code) {
            case 'file-invalid-type':
              msg =
                'Invalid file type. Allowed types: JPG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO'
              break

            case 'file-too-large':
              msg = 'File is too large. Max allowed size is 2MB.'
              break

            case 'too-many-files':
              msg = 'Only one image can be uploaded.'
              break

            default:
              msg = 'There was an issue with the uploaded file.'
          }

          toast.error(msg, { hideProgressBar: false })
          setImageError(msg)
        })
      })
    }
  })

  const onSubmit = async value => {
    if (!file && !editData?.image_url) {
      setImageError('Image is required')

      return
    } else {
      setImageError('')
    }

    const formData = new FormData()

    if (file) {
      formData.append('image_url', file)
    }

    formData.append('title', value.title)
    formData.append('description', value.description)

    // Only for Live Session
    if (stage === 'Live Session') {

      formData.append('live_session_type', value.live_session_type)
    }

    // Only for Content Folder
    if (stage === 'Content Folder' && selectedCertificateId && checkCertificate) {

      formData.append('certificateId', selectedCertificateId)
    }

    if (stage === 'Content Folder' && !selectedCertificateId && checkCertificate) {

      toast.error('Please select a certificate or uncheck the certificate option', {
        autoClose: 1000
      })

      return;

    }

    if (stage === 'Content Folder') {

      formData.append('checkCertificate', checkCertificate)

    }


    try {
      const response = await fetch(
        id ? `${editURL}/${id}` : addURL,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      )

      const result = await response.json()

      if (response.ok) {
        toast.success(
          `${stage} ${id ? 'edit' : 'add'} successfully`,
          {
            autoClose: 1000
          }
        )

        router.push(backURL)
      } else {
        toast.error(result?.message || 'Something went wrong')
      }
    } catch (error) {
      console.error(error)
      toast.error('Submission failed due to an error')
    }
  }

  if (!loading) {
    return <SkeletonFormComponent />
  }

  return (
    <Card>
      <CardHeader
        title={id ? `Edit ${stage}` : `Add ${stage}`}
        action={
          <Button
            variant='outlined'
            startIcon={
              <DirectionalIcon
                ltrIconClass='tabler-arrow-left'
                rtlIconClass='tabler-arrow-right'
              />
            }
            onClick={() =>
              router.push(getLocalizedUrl(backURL, locale))
            }
          >
            Back to {backPageName}
          </Button>
        }
      />

      <Divider />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        encType='multipart/form-data'
      >
        <CardContent>
          <Grid container spacing={5}>

            {/* Title */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Title*'
                    placeholder='Title'
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            {/* Live Session Type */}
            {stage === 'Live Session' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='live_session_type'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      required
                      fullWidth
                      label='Select Live Session Type'
                      error={!!errors.live_session_type}
                      helperText={errors.live_session_type?.message}
                    >
                      <MenuItem disabled value=''>
                        Select
                      </MenuItem>

                      {createData?.live_session?.length > 0 &&
                        createData.live_session.map(item => (
                          <MenuItem
                            key={item._id}
                            value={item._id}
                          >
                            {item.title}
                          </MenuItem>
                        ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
            )}

            {/* Description */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Description*'
                    placeholder='Enter Description'
                    multiline
                    rows={6}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            {/* Image Upload */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body1' gutterBottom>
                Image <span>*</span>
              </Typography>

              <AppReactDropzone>
                <div
                  {...getRootProps({ className: 'dropzone' })}
                  style={{ minHeight: '150px' }}
                >
                  <input {...getInputProps()} />

                  <div className='flex items-center flex-col'>
                    <Avatar
                      variant='rounded'
                      className='bs-12 is-12 mbe-1'
                    >
                      <i className='tabler-upload' />
                    </Avatar>

                    <Typography>
                      Allowed *.jpg, *.jpeg, *.png, *.gif,
                      *.webp, *.svg, *.bmp, *.tif, *.tiff,
                      *.ico (Max 2MB)
                    </Typography>
                  </div>

                  {preview && (
                    <div className='mt-4'>
                      <img
                        src={preview}
                        alt='Preview'
                        style={{
                          inlineSize: '150px',
                          blockSize: '150px',
                          objectFit: 'cover',
                          borderRadius: '10%'
                        }}
                      />
                    </div>
                  )}

                  {editData?.image_url && !preview && (
                    <div className='mt-4'>
                      <img
                        src={`${ASSET_URL}/program_module/${editData.image_url}`}
                        alt='Preview'
                        style={{
                          inlineSize: '150px',
                          blockSize: '150px',
                          objectFit: 'cover',
                          borderRadius: '10%'
                        }}
                      />
                    </div>
                  )}
                </div>
              </AppReactDropzone>

              {imageError && (
                <Typography
                  variant='caption'
                  color='var(--mui-palette-error-main)'
                  sx={{ mt: 1 }}
                >
                  {imageError}
                </Typography>
              )}
            </Grid>

            {/* Certificate Section */}
            {stage === 'Content Folder' && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkCertificate}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label={<Typography>Certificate</Typography>}
                />

                {checkCertificate && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap'
                    }}
                  >
                    {certificateData.map((item, index) => {
                      const cardId = item._id ?? index

                      const isSelected =
                        selectedCertificateId === cardId

                      return (
                        <Card
                          key={cardId}
                          sx={{
                            width: 180,
                            height: 120,
                            borderRadius: 2,
                            border: isSelected
                              ? '2px solid #1976d2'
                              : '1px solid #e0e0e0',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() =>
                            setSelectedCertificateId(cardId)
                          }
                        >
                          {isSelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                backgroundColor: 'primary.main',
                                color: '#fff',
                                borderRadius: '50%',
                                width: 18,
                                height: 18,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12
                              }}
                            >
                              <i className='tabler-check' />
                            </Box>
                          )}

                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              backgroundImage: `url(${assert_url}/frames/${item.backgroundImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          >
                            <Box
                              sx={{
                                p: 1,
                                textAlign: 'center'
                              }}
                            >
                              {item?.logoURL && (
                                <img
                                  src={`${assert_url}/company_logo/${item.logoURL}`}
                                  alt='Logo'
                                  width={40}
                                  height={20}
                                  style={{
                                    objectFit: 'contain'
                                  }}
                                />
                              )}

                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 600
                                }}
                              >
                                {item.title}
                              </Typography>

                              <Typography sx={{ fontSize: 9 }}>
                                [UserName]
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 8,
                                  color: 'text.secondary'
                                }}
                              >
                                On [date]
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      )
                    })}
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </CardContent>

        <Divider />

        <CardActions>
          <Button
            type='submit'
            variant='contained'
            disabled={!loading}
            sx={{
              blockSize: 40,
              position: 'relative'
            }}
          >
            {!loading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: 'white',
                  position: 'absolute',
                  insetBlockStart: '50%',
                  insetInlineStart: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px'
                }}
              />
            ) : (
              'Submit'
            )}
          </Button>

          <Button
            variant='tonal'
            color='error'
            type='button'
            onClick={() => router.push(backURL)}
          >
            Cancel
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default FormComponent
