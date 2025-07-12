'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { useRouter } from 'next/navigation'

import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Menu,
    MenuItem,
    IconButton
} from '@mui/material'
import Grid from '@mui/material/Grid2'


const CertificateCard = ({ teams = [], onAddTeamSubmit }) => {
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [showTable, setShowTable] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const router = useRouter()

    useEffect(() => {
        router.prefetch('/apps/certificate/form')
    }, [router])

    const handleOpen = () => {
        router.push('/apps/certificate/form')
    }

    const handleMenuOpen = (event, team) => {
        setSelectedTeam(team)
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
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
                    <Grid key={team.id} item size={{ xs: 12, sm: 6, md: 4 }}>
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
                                    style={{ inlineSize: '100%', blockSize: '200px', objectFit: 'contain' }}
                                />

                                {/* Hover Overlay */}
                                <Box
                                    className="hoverOverlay"
                                    sx={{
                                        position: 'absolute',
                                        insetBlockStart: 0,
                                        insetInlineStart: 0,
                                        insetInlineEnd: 0,
                                        insetBlockEnd: 0,
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

                                <IconButton onClick={(e) => handleMenuOpen(e, team)}>
                                    <i className="tabler-dots-vertical" />
                                </IconButton>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem
                    onClick={() => {
                        console.log('Edit', selectedTeam)
                        handleMenuClose()
                    }}
                >
                    <i className="tabler-edit" style={{ marginRight: 8 }} />
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        console.log('Reset', selectedTeam)
                        handleMenuClose()
                    }}
                >
                    <i className="tabler-refresh" style={{ marginRight: 8 }} />
                    Reset to default template
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        console.log('Clone', selectedTeam)
                        handleMenuClose()
                    }}
                >
                    <i className="tabler-copy" style={{ marginRight: 8 }} />
                    Clone
                </MenuItem>
            </Menu>
        </>
    )
}

export default CertificateCard
