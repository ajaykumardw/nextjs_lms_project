'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
} from '@mui/material'

import Grid from '@mui/material/Grid2';

import { redirect } from 'next/navigation';

import CertificateForm from '@/views/apps/certificate/page';

const CertificateCard = ({ teams = [], onAddTeamSubmit }) => {
    const [files, setFiles] = useState([])
    const [open, setOpen] = useState(false)
    const [certificateName, setCertificateName] = useState('')
    const [certificateDescription, setCertificateDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [showTable, setShowTable] = useState(false)
    const [value, setValue] = useState('info')

    const handleOpen = () => {

        redirect('/apps/certificate/form')
        // setOpen(true)
    }


    const handleClose = () => {
        setOpen(false)
        setCertificateName('')
        setCertificateDescription('')
        setFiles([])
        setLoading(false)
    }

    return (
        <>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight={600}>
                    Certificates
                </Typography>
                <Button variant="contained" onClick={handleOpen}>
                    Add certificate
                </Button>
            </Box>

            {/* Cards */}
            <Grid container spacing={4}>
                {teams.map((team) => (
                    <Grid key={team.id} item>
                        <Card
                            sx={{
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                boxShadow: 'none',
                                overflow: 'hidden',
                                position: 'relative',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.01)',
                                    boxShadow: 3,
                                },
                                '&:hover .hoverOverlay': {
                                    opacity: 1,
                                    visibility: 'visible',
                                },
                            }}
                        >
                            {/* Image section */}
                            <Box
                                position="relative"
                                onClick={() => {
                                    setSelectedTeam(team)
                                    setShowTable(true)
                                }}
                            >
                                <Image
                                    src={team.image || '/images/apps/academy/badge.png'}
                                    alt={team.name}
                                    width={500}
                                    height={200}
                                    style={{ width: '100%', height: '200px', objectFit: 'contain' }}
                                />

                                {/* Hover Overlay */}
                                <Box
                                    className="hoverOverlay"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        color: '#fff',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        visibility: 'hidden',
                                        transition: 'opacity 0.3s ease',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <i className="tabler-eye" style={{ fontSize: 28 }} />
                                    <Typography variant="body2" mt={1}>
                                        Preview certificate
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Title & Menu */}
                            <CardContent
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    pt: 2,
                                    pb: 2,
                                    pl: 2,
                                    pr: 2,
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={500}>
                                    {team.name}
                                </Typography>

                                <Box sx={{ cursor: 'pointer' }}>
                                    <i className="tabler-dots-vertical" />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}

export default CertificateCard
