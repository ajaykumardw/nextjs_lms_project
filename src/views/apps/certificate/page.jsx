'use client'

import { useState } from 'react'

import Image from 'next/image'

import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    CardMedia,
    CardActionArea,
} from '@mui/material'

import { useForm, Controller } from 'react-hook-form'

import { valibotResolver } from '@hookform/resolvers/valibot'

// Valibot schema

import { object, string, minLength, pipe, maxLength, boolean, regex } from 'valibot'

import Grid from '@mui/material/Grid2'

const presetBackgrounds = [
    { src: '/frames/bg1.jpg', label: 'BG 1' },
    { src: '/frames/bg2.jpg', label: 'BG 2' },
    { src: '/frames/bg3.jpg', label: 'BG 3' },
    { src: '/frames/bg4.jpg', label: 'BG 4' },
]


const schema = object({
    templateName: pipe(
        string(),
        minLength(1, 'Template Name is required'),
        maxLength(255, 'Template Name can be maximum of 255 characters'),
        regex(/^[A-Za-z\s]+$/, 'Only alphabets and spaces are allowed')
    ),
    status: boolean()
})

const CertificateForm = () => {
    const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''
    const signature_url = `${assert_url}/signature/signature1.png`
    const logo_url = `${assert_url}/company_logo/demo39.svg`

    const [customBg, setCustomBg] = useState(null)
    const [signature1, setSignature1] = useState(signature_url)
    const [signature2, setSignature2] = useState(signature_url)
    const [logoURL, setLogoURL] = useState(logo_url);

    const [formData, setFormData] = useState({
        templateName: '',
        title: 'CERTIFICATE',
        content: 'This is to certify that',
        content2: 'has successfully completed the',
        signatureName: 'Sandeep Soni',
        signatureContent: 'CEO Dreamweavers',
        signature1URL: signature_url,
        signature2URL: signature_url,
        logoURL,
        signature2Name: '',
        signature2Content: '',
        backgroundImage: `${assert_url}${presetBackgrounds[0].src}`, // Default
    })

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
            templateName: '',
            status: false
        }
    })

    const handleBgChange = (img) => {
        setFormData(prev => ({ ...prev, backgroundImage: img }))
    }

    const handleUpload = (e) => {
        const file = e.target.files?.[0]

        if (file) {
            const url = URL.createObjectURL(file)

            setCustomBg(url)
            handleBgChange(url)
        }
    }

    const handleSignature1URL = (e) => {
        const file = e.target.files?.[0]

        if (file) {
            const url = URL.createObjectURL(file)

            setSignature1(url)
            setFormData(prev => ({ ...prev, signature1URL: url }))
        }
    }

    const handleSignature2URL = (e) => {
        const file = e.target.files?.[0]

        if (file) {
            const url = URL.createObjectURL(file)

            setSignature2(url)
            setFormData(prev => ({ ...prev, signature2URL: url }))
        }
    }

    const handleLogo = (e) => {
        const file = e.target.files?.[0]

        if (file) {
            const url = URL.createObjectURL(file)

            setLogoURL(url)
            setFormData(prev => ({ ...prev, logoURL: url }))
        }
    }

    return (
        <Box p={4} display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={6}>
            {/* Certificate Preview */}
            <Box width={{ xs: '100%', md: '40%' }}>
                <Card
                    variant="outlined"
                    sx={{
                        width: '100%',
                        backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 2,
                    }}
                >
                    <CardContent>
                        <Box
                            p={2}
                            textAlign="center"
                            sx={{
                                backgroundColor: 'transparent',
                                borderRadius: 2,
                            }}
                        >
                            <Image src={`${logoURL}`} alt="Logo" width={80} height={40} />

                            <Typography variant="h6" fontWeight="bold">{formData.title}</Typography>
                            <Typography>{formData.content}</Typography>
                            <Typography variant="h6" fontWeight="bold">[UserName]</Typography>
                            <Typography>{formData.content2}</Typography>
                            <Typography variant="h6" fontWeight="bold">[QuizName]</Typography>
                            <Typography variant="body2" color="textSecondary">On [date]</Typography>

                            {!formData.signature2Name && (
                                <Box mt={6} display="flex" justifyContent="center" gap={formData.signature2Name ? 6 : 0}>
                                    <Box>
                                        <Image src={`${formData.signature1URL}`} alt="Signature 1" width={100} height={40} />
                                        <Typography fontWeight="bold">{formData.signatureName}</Typography>
                                        <Typography>{formData.signatureContent}</Typography>
                                    </Box>
                                </Box>
                            )}

                            {formData.signature2Name && (
                                <Box mt={6} display="flex" justifyContent="space-between" gap={formData.signature2Name ? 6 : 0}>
                                    <Box>
                                        <Image src={`${formData.signature1URL}`} alt="Signature 1" width={50} height={20} />
                                        <Typography fontWeight="bold">{formData.signatureName}</Typography>
                                        <Typography>{formData.signatureContent}</Typography>
                                    </Box>
                                    <Box>
                                        <Image src={formData.signature2URL} alt="Signature 2" width={50} height={20} />
                                        <Typography fontWeight="bold">{formData.signature2Name}</Typography>
                                        <Typography>{formData.signature2Content}</Typography>
                                    </Box>
                                </Box>
                            )}

                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Form Section */}
            <Box width={{ xs: '100%', md: '60%' }}>
                <Typography variant="h6" gutterBottom>Create Certificate Template</Typography>

                <Grid container spacing={3}>
                    {/* <Grid item size={{ xs: 12 }}>
                        <TextField fullWidth label="Template Type" value={formData.templateType} disabled />
                    </Grid> */}

                    <Grid item size={{ xs: 12 }}>
                        <TextField
                            required
                            fullWidth label="Template Name"
                            value={formData.templateName}
                            onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                            error={!!errors?.templateName}
                            helperText={errors?.templateName?.message}
                        />
                    </Grid>

                    {/* Signature 2 Upload */}
                    <Grid item size={{ xs: 12 }}>
                        <Typography variant="body2" gutterBottom>Upload Signature 2</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4} md={3}>
                                <Card
                                    sx={{
                                        border: formData.logoURL === logoURL ? '2px solid #1976d2' : '2px solid transparent',
                                        backgroundColor: '#fff',
                                        borderRadius: 2,
                                    }}
                                    onClick={() => setFormData({ ...formData, logoURL: logoURL })}
                                >
                                    <CardActionArea>
                                        <CardMedia component="img" height="100" image={logoURL} alt="Signature 2" />
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        </Grid>
                        <Box mt={2}>
                            <Button variant="outlined" component="label">
                                Upload Logo
                                <input hidden type="file" accept="image/*" onChange={handleLogo} />
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                        <Typography variant="body2" gutterBottom>Select Certificate Background</Typography>
                        <Grid container spacing={2}>
                            {presetBackgrounds.map((img, idx) => {
                                const fullPath = `${assert_url}${img.src}`

                                return (
                                    <Grid item xs={4} sm={3} key={idx}>
                                        <Card
                                            sx={{
                                                border: formData.backgroundImage === fullPath ? '2px solid #1976d2' : '2px solid transparent',
                                                boxShadow: formData.backgroundImage === fullPath ? '0 0 4px #1976d2' : undefined,
                                                borderRadius: 2,
                                            }}
                                        >
                                            <CardActionArea onClick={() => handleBgChange(fullPath)}>
                                                <CardMedia component="img" height="80" image={fullPath} alt={img.label} />
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                )
                            })}
                            {customBg && (
                                <Grid item xs={4} sm={3}>
                                    <Card
                                        sx={{
                                            border: formData.backgroundImage === customBg ? '2px solid #1976d2' : '2px solid transparent',
                                            boxShadow: formData.backgroundImage === customBg ? '0 0 4px #1976d2' : undefined,
                                            borderRadius: 2,
                                        }}
                                    >
                                        <CardActionArea onClick={() => handleBgChange(customBg)}>
                                            <CardMedia component="img" height="80" image={customBg} alt="Custom" />
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                        <Box mt={2}>
                            <Button variant="outlined" component="label">
                                Upload Custom Background
                                <input hidden type="file" accept="image/*" onChange={handleUpload} />
                            </Button>
                        </Box>
                    </Grid>

                    {/* Text Inputs */}
                    {['title', 'content', 'content2', 'signatureName', 'signatureContent', 'signature2Name', 'signature2Content'].map((key, i) => (
                        <Grid item size={{ xs: 12 }} key={i}>
                            <TextField
                                fullWidth
                                label={key.replace(/([A-Z])/g, ' $1').replace('signature', 'Signature')}
                                value={formData[key]}
                                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            />
                        </Grid>
                    ))}

                    {/* Signature 1 Upload */}
                    <Grid item size={{ xs: 12 }}>
                        <Typography variant="body2" gutterBottom>Upload Signature 1</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4} md={3}>
                                <Card
                                    sx={{
                                        border: formData.signature1URL === signature1 ? '2px solid #1976d2' : '2px solid transparent',
                                        backgroundColor: '#fff',
                                        borderRadius: 2,
                                    }}
                                    onClick={() => setFormData({ ...formData, signature1URL: signature1 })}
                                >
                                    <CardActionArea>
                                        <CardMedia component="img" height="100" image={signature1} alt="Signature 1" />
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        </Grid>
                        <Box mt={2}>
                            <Button variant="outlined" component="label">
                                Upload Signature
                                <input hidden type="file" accept="image/*" onChange={handleSignature1URL} />
                            </Button>
                        </Box>
                    </Grid>

                    {/* Signature 2 Upload */}
                    <Grid item size={{ xs: 12 }}>
                        <Typography variant="body2" gutterBottom>Upload Signature 2</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4} md={3}>
                                <Card
                                    sx={{
                                        border: formData.signature2URL === signature2 ? '2px solid #1976d2' : '2px solid transparent',
                                        backgroundColor: '#fff',
                                        borderRadius: 2,
                                    }}
                                    onClick={() => setFormData({ ...formData, signature2URL: signature2 })}
                                >
                                    <CardActionArea>
                                        <CardMedia component="img" height="100" image={signature2} alt="Signature 2" />
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        </Grid>
                        <Box mt={2}>
                            <Button variant="outlined" component="label">
                                Upload Signature
                                <input hidden type="file" accept="image/*" onChange={handleSignature2URL} />
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                        <Button fullWidth variant="contained">Save</Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}

export default CertificateForm
