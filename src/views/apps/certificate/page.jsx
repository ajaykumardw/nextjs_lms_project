'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { useSession } from 'next-auth/react'

import {
  Box, Button, Card, CardHeader, Divider, CardContent,
  TextField, Typography, CardMedia, Skeleton
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { useForm, Controller } from 'react-hook-form'

import { valibotResolver } from '@hookform/resolvers/valibot'

import {
  object, string, minLength, transform,
  maxLength, pipe, regex, optional
} from 'valibot'

const alphaSpaceRegex = /^[A-Za-z ]+$/

const optionalAlphaField = optional(
  pipe(
    transform((val) => val === '' ? undefined : val),
    maxLength(20, 'Maximum 20 characters'),
    regex(alphaSpaceRegex, 'Only alphabets and spaces are allowed')
  )
)

const schema = object({
  templateName: pipe(
    string(),
    minLength(1, 'Template Name is required'),
    maxLength(255, 'Template Name can be maximum of 255 characters'),
    regex(alphaSpaceRegex, 'Only alphabets and spaces are allowed')
  ),
  title: pipe(
    string(),
    minLength(1, "Title is required"),
    maxLength(50, 'Title can be maximum of 50 characters'),
    regex(alphaSpaceRegex, 'Only alphabets and spaces are allowed')
  ),
  content: pipe(
    string(),
    minLength(1, "Content is required"),
    maxLength(100, 'Content can be maximum of 100 characters'),
    regex(alphaSpaceRegex, 'Only alphabets and spaces are allowed')
  ),
  content2: pipe(
    string(),
    minLength(1, "Content 2 is required"),
    maxLength(100, 'Content 2 can be maximum of 100 characters'),
    regex(alphaSpaceRegex, 'Only alphabets and spaces are allowed')
  ),
  signatureName: optionalAlphaField,
  signatureContent: optionalAlphaField,
  signature2Name: optionalAlphaField,
  signature2Content: optionalAlphaField,
  logoURL: optional(string()),
  backgroundImage: optional(string()),
  signature1URL: optional(string()),
  signature2URL: optional(string())
})

const CertificateForm = () => {
  const { data: session } = useSession()
  const token = session?.user?.token
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''

  const [customBg, setCustomBg] = useState(null)
  const [defaultBackground, setDefaultBackground] = useState([])
  const [logoPreview, setLogoPreview] = useState('')
  const [signature1Preview, setSignature1Preview] = useState('')
  const [signature2Preview, setSignature2Preview] = useState('')
  const [selectedBg, setSelectedBg] = useState('')

  const [uploadedFiles, setUploadedFiles] = useState({
    logoURL: null,
    backgroundImage: null,
    signature1URL: null,
    signature2URL: null
  })

  const [loading, setLoading] = useState(false)

  const {
    control, handleSubmit, setValue, getValues, formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    mode: 'onChange',
    defaultValues: {
      templateName: '',
      title: '',
      content: '',
      content2: '',
      signatureName: '',
      signatureContent: '',
      signature2Name: '',
      signature2Content: '',
      logoURL: '',
      backgroundImage: '',
      signature1URL: '',
      signature2URL: ''
    }
  })

  const fetchCreateData = async () => {
    try {
      const res = await fetch(`${API_URL}/company/certificate/create`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (res.ok) {
        setLoading(true)
        const val = data.data

        const logo = `${assert_url}/company_logo/${val.logoURL}`
        const sig = `${assert_url}/signature/${val.signatureURL}`
        const bg = `${assert_url}/frames/${val.frameImage?.[0]}`

        setLogoPreview(logo)
        setSignature1Preview(sig)
        setSignature2Preview(sig)

        setValue('logoURL', logo)
        setValue('signature1URL', sig)
        setValue('signature2URL', sig)
        setValue('backgroundImage', bg)
        setValue('title', val.title)
        setValue('content', val.content)
        setValue('content2', val.content2)

        setSelectedBg(bg)

        setDefaultBackground(val.frameImage.map((f) => `${assert_url}/frames/${f}`))
      }
    } catch (err) {
      console.error('Fetch failed:', err)
    }
  }

  useEffect(() => {
    if (token && API_URL) fetchCreateData()
  }, [token, API_URL])

  const handleImageUpload = (file, previewSetter, fieldKey) => {
    if (!file) return
    const objectUrl = URL.createObjectURL(file)

    previewSetter(objectUrl)
    setUploadedFiles((prev) => ({ ...prev, [fieldKey]: file }))
    setValue(fieldKey, objectUrl)

    if (fieldKey === 'backgroundImage') {
      setSelectedBg(objectUrl)
    }
  }

  const handleFormSubmit = async (values) => {
    const formDatas = new FormData()

    Object.entries(values).forEach(([k, v]) => {
      if (
        !['logoURL', 'backgroundImage', 'signature1URL', 'signature2URL'].includes(k) &&
        v !== undefined &&
        v !== null
      ) {
        formDatas.append(k, v)
      }
    })

    Object.entries(uploadedFiles).forEach(([key, file]) => {
      if (file instanceof File) {
        formDatas.append(key, file)
      } else if (values[key]) {
        formDatas.append(key, values[key])
      }
    })

    try {

      const res = await fetch(`${API_URL}/company/certificate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDatas
      })

      const result = await res.json()


    } catch (err) {
      console.error('Submission Error:', err)
    }
  }

  const CertificateTemplateSkeleton = () => (
    <Card>
      <CardHeader title={<Skeleton width="40%" />} />
      <Divider />
      <CardContent>
        <Grid container spacing={4}>
          <Grid item size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box p={2} textAlign="center">
                  <Skeleton variant="rectangular" width={80} height={40} sx={{ margin: '0 auto' }} />
                  <Skeleton variant="text" width="60%" sx={{ mt: 2, mx: 'auto' }} />
                  <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="40%" sx={{ mt: 1, mx: 'auto' }} />
                  <Skeleton variant="text" width="70%" sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="50%" sx={{ mt: 2, mx: 'auto' }} />
                  <Box mt={6} display="flex" justifyContent="space-between" gap={4}>
                    {[1, 2].map((i) => (
                      <Box key={i} textAlign="center">
                        <Skeleton variant="rectangular" width={50} height={20} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={80} />
                        <Skeleton variant="text" width={100} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" width="100%" height={600} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  if (!loading) return <CertificateTemplateSkeleton />

  return (
    <Card>
      <CardHeader title='Create Certificate Template' />
      <Divider />
      <CardContent>
        <Grid container spacing={4}>
          {/* Preview Panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              variant="outlined"
              sx={{
                backgroundImage: `url(${selectedBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 2
              }}
            >
              <CardContent>
                <Box textAlign="center" p={2}>
                  {logoPreview && (
                    <Image src={logoPreview} alt="Logo" width={80} height={40} style={{ objectFit: 'contain' }} />
                  )}
                  <Typography variant="h6" fontWeight="bold" mt={2}>{getValues('title')}</Typography>
                  <Typography>{getValues('content')}</Typography>
                  <Typography variant="h6" fontWeight="bold">[UserName]</Typography>
                  <Typography>{getValues('content2')}</Typography>
                  <Typography variant="h6" fontWeight="bold">[QuizName]</Typography>
                  <Typography variant="body2" color="text.secondary">On [date]</Typography>

                  <Box mt={6} display="flex" justifyContent="space-between" gap={4}>
                    {getValues('signatureName') && (
                      <Box textAlign="center">
                        <img src={getValues('signature1URL')} alt="Signature 1" width={50} height={20} />
                        <Typography fontWeight="bold">{getValues('signatureName')}</Typography>
                        <Typography variant="body2">{getValues('signatureContent')}</Typography>
                      </Box>
                    )}
                    {getValues('signature2Name') && (
                      <Box textAlign="center">
                        <img src={getValues('signature2URL')} alt="Signature 2" width={50} height={20} />
                        <Typography fontWeight="bold">{getValues('signature2Name')}</Typography>
                        <Typography variant="body2">{getValues('signature2Content')}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Panel */}
          <Grid size={{ xs: 12, md: 7 }}>
            <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="templateName"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Template Name" fullWidth required error={!!errors.templateName} helperText={errors.templateName?.message} />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">Upload Logo</Typography>
                  {logoPreview && (
                    <Card sx={{ maxWidth: 150, mb: 1 }}>
                      <CardMedia component="img" image={logoPreview} alt="Logo" />
                    </Card>
                  )}
                  <Button variant="outlined" component="label">
                    Upload Logo
                    <input hidden type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], setLogoPreview, 'logoURL')} />
                  </Button>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography>Select Background</Typography>
                  <Grid container spacing={2}>
                    {defaultBackground.map((bg, idx) => (
                      <Grid size={{ xs: 4 }} key={idx}>
                        <Card
                          onClick={() => {
                            setSelectedBg(bg)
                            setValue('backgroundImage', bg)
                          }}
                          sx={{
                            border: selectedBg === bg ? '2px solid #1976d2' : '1px dashed grey',
                            borderRadius: 2,
                            cursor: 'pointer'
                          }}
                        >
                          <CardMedia component="img" image={bg} height="100" />
                        </Card>
                      </Grid>
                    ))}
                    {customBg && (
                      <Grid size={{ xs: 4 }}>
                        <Card onClick={() => {
                          setSelectedBg(customBg)
                          setValue('backgroundImage', customBg)
                        }}>
                          <CardMedia component="img" image={customBg} height="100" />
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                  <Box mt={2}>
                    <Button variant="outlined" component="label">
                      Upload Custom Background
                      <input hidden type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], setCustomBg, 'backgroundImage')} />
                    </Button>
                  </Box>
                </Grid>

                {['title', 'content', 'content2'].map((key) => (
                  <Grid size={{ xs: 12 }} key={key}>
                    <Controller
                      name={key}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={key.toUpperCase()}
                          fullWidth
                          required
                          error={!!errors[key]}
                          helperText={errors[key]?.message}
                        />
                      )}
                    />
                  </Grid>
                ))}

                {[
                  ['signatureName', 'Signature 1 Name'],
                  ['signatureContent', 'Signature 1 Content'],
                  ['signature2Name', 'Signature 2 Name'],
                  ['signature2Content', 'Signature 2 Content']
                ].map(([key, label]) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={key}>
                    <Controller
                      name={key}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label={label} fullWidth error={!!errors[key]} helperText={errors[key]?.message} />
                      )}
                    />
                  </Grid>
                ))}

                {[['signature1URL', signature1Preview, setSignature1Preview], ['signature2URL', signature2Preview, setSignature2Preview]]
                  .map(([key, preview, setter], i) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={key}>
                      <Typography>Upload Signature {i + 1}</Typography>
                      {preview && (
                        <Card sx={{ maxWidth: 150, mb: 1 }}>
                          <CardMedia component="img" image={preview} height="60" />
                        </Card>
                      )}
                      <Button variant="outlined" component="label">
                        Upload Signature
                        <input hidden type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], setter, key)} />
                      </Button>
                    </Grid>
                  ))}

                <Grid size={{ xs: 12 }}>
                  <Button type="submit" fullWidth variant="contained">Save</Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CertificateForm
