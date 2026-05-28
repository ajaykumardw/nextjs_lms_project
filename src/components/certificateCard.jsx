'use client'

import { useState, useRef } from 'react'

import Image from 'next/image'

import {
    Dialog,
    DialogActions,
    DialogContent,
    Button,
    Box
} from '@mui/material'

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

import DialogCloseButton from './dialogs/DialogCloseButton'

const badgeIcon = '/images/apps/academy/badge.png'

const assetsUrl = process.env.NEXT_PUBLIC_ASSETS_URL || ''

// ----------------------
// HELPERS
// ----------------------

function formatEnrollDate(dateString) {
    if (!dateString) return '-'

    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

const CertificateCard = ({ searchValue = [], userName }) => {
    const [open, setOpen] = useState(false)
    const [selectedCertificate, setSelectedCertificate] = useState(null)

    const certificateRef = useRef(null)

    // ----------------------
    // MODAL
    // ----------------------

    const handleOpen = certificate => {

        console.log("Certificate", certificate);
        

        setSelectedCertificate(certificate)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setSelectedCertificate(null)
    }

    // ----------------------
    // DOWNLOAD PDF
    // ----------------------

    const handleDownload = async () => {
        try {
            if (!certificateRef.current) return

            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true
            })

            const imgData = canvas.toDataURL('image/png')

            const pdf = new jsPDF('landscape', 'pt', 'a4')

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

            pdf.save(
                `${selectedCertificate?.title || 'certificate'}.pdf`
            )

            handleClose();

        } catch (error) {
            console.error('Error generating PDF:', error)
        }
    }

    return (
        <>
            <Typography variant='h5' fontWeight={600} sx={{ mb: 4 }}>
                My Certificates
            </Typography>

            <Grid container spacing={6}>
                {searchValue?.map((certificate, index) => (
                    <Grid
                        key={index}
                        size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    >
                        <Card
                            onClick={() => handleOpen(certificate)}
                            className='cursor-pointer rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]'
                            sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: 3,
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header */}
                            <Box
                                sx={{
                                    minHeight: 70,
                                    background:
                                        'linear-gradient(to right, #e2d9fb, #e9e4ff)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 2
                                }}
                            >
                                <Image
                                    src={badgeIcon}
                                    alt='Badge'
                                    width={40}
                                    height={40}
                                />

                                <Typography
                                    variant='h6'
                                    fontWeight={600}
                                    sx={{ ml: 2 }}
                                    className='text-primary'
                                >
                                    {certificate?.title || 'Certificate'}
                                </Typography>
                            </Box>

                            {/* Content */}
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '10px 24px'
                                    }}
                                >
                                    <Box sx={{ width: 'calc(50% - 12px)' }}>
                                        <Typography
                                            variant='body2'
                                            color='text.secondary'
                                        >
                                            <strong>Issued By:</strong>{' '}
                                            {certificate?.user?.first_name}{' '}
                                            {certificate?.user?.last_name}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ width: 'calc(50% - 12px)' }}>
                                        <Typography
                                            variant='body2'
                                            color='text.secondary'
                                        >
                                            <strong>Issued on:</strong>{' '}
                                            {formatEnrollDate(
                                                certificate?.module_completed_at ||
                                                certificate?.content_folder_completed_at
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* ---------------------- */}
            {/* CERTIFICATE MODAL */}
            {/* ---------------------- */}

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth='lg'
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        overflow: 'visible'
                    }
                }}
            >
                <DialogCloseButton onClick={handleClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>

                <DialogContent
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        p: 3,
                        background: '#f5f5f5'
                    }}
                >
                    <Box position='relative' ref={certificateRef}>
                        <Box
                            sx={{
                                backgroundImage: `url(${assetsUrl}/frames/${selectedCertificate?.certificates?.backgroundImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: 2,
                                mt: 1,
                                width: '1000px',
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                style={{
                                    padding: '38px 35px',
                                    aspectRatio: '1.41/1'
                                }}
                            >
                                {selectedCertificate?.certificates?.logoURL && (
                                    <Box textAlign='center'>
                                        <img
                                            src={`${assetsUrl}/company_logo/${selectedCertificate?.certificates?.logoURL}`}
                                            alt='Logo'
                                            width={120}
                                            height={60}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </Box>
                                )}

                                <Box textAlign='center' mt={4}>
                                    <Typography variant='h4' fontWeight='bold'>
                                        {selectedCertificate?.certificates?.title}
                                    </Typography>

                                    <Typography mt={2} fontSize={18}>
                                        {selectedCertificate?.certificates?.content}
                                    </Typography>

                                    <Typography
                                        variant='h3'
                                        fontWeight='bold'
                                        mt={3}
                                    >
                                        {userName}
                                    </Typography>

                                    <Typography mt={2} fontSize={18}>
                                        {selectedCertificate?.certificates?.content2}
                                    </Typography>

                                    <Typography
                                        variant='h4'
                                        fontWeight='bold'
                                        mt={2}
                                    >
                                        {selectedCertificate?.title}
                                    </Typography>

                                    <Typography
                                        variant='body1'
                                        color='text.secondary'
                                        mt={2}
                                    >
                                        On {formatEnrollDate(selectedCertificate?.module_completed_at ||
                                            selectedCertificate?.content_folder_completed_at)}
                                    </Typography>
                                </Box>

                                <Box
                                    mt={10}
                                    display='flex'
                                    justifyContent={
                                        selectedCertificate?.certificates?.signatureName &&
                                            selectedCertificate?.certificates?.signatureName2
                                            ? 'space-between'
                                            : 'center'
                                    }
                                    gap={4}
                                >
                                    {selectedCertificate?.certificates?.signatureName && (
                                        <Box textAlign='center'>
                                            <img
                                                src={`${assetsUrl}/signature/${selectedCertificate?.certificates?.signatureURL ||
                                                    'signature1.png'
                                                    }`}
                                                alt='Signature 1'
                                                width={120}
                                                height={60}
                                            />

                                            <Typography fontWeight='bold'>
                                                {selectedCertificate?.certificates?.signatureName}
                                            </Typography>

                                            <Typography variant='body2'>
                                                {selectedCertificate?.certificates?.signatureContent}
                                            </Typography>
                                        </Box>
                                    )}

                                    {selectedCertificate?.certificates?.signatureName2 && (
                                        <Box textAlign='center'>
                                            <img
                                                src={`${assetsUrl}/signature/${selectedCertificate?.certificates?.signatureURL2 ||
                                                    'signature1.png'
                                                    }`}
                                                alt='Signature 2'
                                                width={120}
                                                height={60}
                                            />

                                            <Typography fontWeight='bold'>
                                                {selectedCertificate?.certificates?.signatureName2}
                                            </Typography>

                                            <Typography variant='body2'>
                                                {selectedCertificate?.certificates?.signatureContent2}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </div>
                        </Box>
                    </Box>
                </DialogContent>

                {/* Actions */}
                <DialogActions
                    sx={{
                        justifyContent: 'center',
                        pb: 3,
                        mt: 5,
                        mb: 2
                    }}
                >
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleDownload}
                    >
                        Download Certificate
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default CertificateCard
