'use client'

import { useState, useEffect, useRef, forwardRef } from 'react'

import Link from 'next/link'

import { useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI
import Grid from '@mui/material/Grid2'

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Button
} from '@mui/material'

// Utils

// PDF
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import { getLocalizedUrl } from '@/utils/i18n'

const assetsUrl = process.env.NEXT_PUBLIC_ASSETS_URL || ''

// ----------------------
// HELPERS
// ----------------------

const slugify = text => {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function formatEnrollDate(dateString) {
  if (!dateString) return '-'

  const date = new Date(dateString)

  return `${String(date.getDate()).padStart(2, '0')} ${String(
    date.getMonth() + 1
  ).padStart(2, '0')} ${date.getFullYear()}`
}

// ----------------------
// CERTIFICATE COMPONENT
// ----------------------

const DownloadCertificate = forwardRef(
  ({ certificateData, userName, date, courseName }, ref) => {

    return (

      <Grid size={{ xs: 12 }}>
        <Box position='relative' ref={ref}>
          <Box
            sx={{
              backgroundImage: `url(${assetsUrl}/frames/${certificateData?.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
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
              {certificateData?.logoURL && (
                <Box textAlign='center'>
                  <img
                    src={`${assetsUrl}/company_logo/${certificateData?.logoURL}`}
                    alt='Logo'
                    width={120}
                    height={60}
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              )}

              <Box textAlign='center' mt={4}>
                <Typography variant='h4' fontWeight='bold'>
                  {certificateData?.title}
                </Typography>

                <Typography mt={2} fontSize={18}>
                  {certificateData?.content}
                </Typography>

                <Typography
                  variant='h3'
                  fontWeight='bold'
                  mt={3}
                >
                  {userName}
                </Typography>

                <Typography mt={2} fontSize={18}>
                  {certificateData?.content2}
                </Typography>

                <Typography
                  variant='h4'
                  fontWeight='bold'
                  mt={2}
                >
                  {courseName}
                </Typography>

                <Typography
                  variant='body1'
                  color='text.secondary'
                  mt={2}
                >
                  On {formatEnrollDate(date)}
                </Typography>
              </Box>

              <Box
                mt={10}
                display='flex'
                justifyContent={
                  certificateData?.signatureName &&
                    certificateData?.signatureName2
                    ? 'space-between'
                    : 'center'
                }
                gap={4}
              >
                {certificateData?.signatureName && (
                  <Box textAlign='center'>
                    <img
                      src={`${assetsUrl}/signature/${certificateData?.signatureURL ||
                        'signature1.png'
                        }`}
                      alt='Signature 1'
                      width={120}
                      height={60}
                    />

                    <Typography fontWeight='bold'>
                      {certificateData?.signatureName}
                    </Typography>

                    <Typography variant='body2'>
                      {certificateData?.signatureContent}
                    </Typography>
                  </Box>
                )}

                {certificateData?.signatureName2 && (
                  <Box textAlign='center'>
                    <img
                      src={`${assetsUrl}/signature/${certificateData?.signatureURL2 ||
                        'signature1.png'
                        }`}
                      alt='Signature 2'
                      width={120}
                      height={60}
                    />

                    <Typography fontWeight='bold'>
                      {certificateData?.signatureName2}
                    </Typography>

                    <Typography variant='body2'>
                      {certificateData?.signatureContent2}
                    </Typography>
                  </Box>
                )}
              </Box>
            </div>
          </Box>
        </Box>
      </Grid>
    )
  }
)


DownloadCertificate.displayName = 'DownloadCertificate'

// ----------------------
// MAIN COMPONENT
// ----------------------

const Courses = ({ searchValue, type }) => {
  const { data: session } = useSession()

  const [filteredCourses, setFilteredCourses] = useState([])

  const { lang: locale } = useParams()

  const certificateRef = useRef(null)

  const [certificatePayload, setCertificatePayload] = useState(null)

  // ----------------------
  // DOWNLOAD PDF
  // ----------------------

  const handleDownloadCertificate = async item => {
    try {
      console.log('Start 1', item)

      const payload = {
        userName: session?.user?.name || '',
        date: item?.content_folder_completed_at,
        certificate: item?.certificates,
        courseName: item?.courseTitle
      }

      // SET STATE
      setCertificatePayload(payload)

      // WAIT FOR REACT RENDER
      await new Promise(resolve => requestAnimationFrame(resolve))

      // EXTRA SMALL DELAY
      await new Promise(resolve => setTimeout(resolve, 1000))

      const input = certificateRef.current


      if (!input) {

        return
      }

      console.log('Start 2')

      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true
      })

      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        canvas.width,
        canvas.height
      )

      pdf.save(`${slugify(item?.courseTitle || 'certificate')}.pdf`)
    } catch (error) {
      console.error('Certificate Download Error:', error)
    }
  }

  // ----------------------
  // EFFECT
  // ----------------------

  useEffect(() => {
    if (searchValue) {
      setFilteredCourses(searchValue)
    } else {
      setFilteredCourses([])
    }
  }, [searchValue])

  // ----------------------
  // RENDER
  // ----------------------

  return (
    <>
      <Grid container spacing={4}>
        {filteredCourses?.length > 0 ? (
          filteredCourses.map((course, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',

                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                {/* IMAGE */}
                <Link
                  href={getLocalizedUrl(
                    `/apps/moduleProgram/detail/${course?._id}`,
                    locale
                  )}
                >
                  <Box
                    sx={{
                      overflow: 'hidden',
                      height: 220,
                      position: 'relative'
                    }}
                  >
                    <img
                      src={`${assetsUrl}/program_module/${course?.tutorImg}`}
                      alt={course?.courseTitle}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                    />
                  </Box>
                </Link>

                {/* CONTENT */}
                <CardContent
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flexGrow: 1
                  }}
                >
                  <Box>
                    <Typography
                      component={Link}
                      href={getLocalizedUrl(
                        `/apps/moduleProgram/detail/${course?._id}`,
                        locale
                      )}
                      sx={{
                        fontSize: '20px',
                        fontWeight: 700,
                        lineHeight: 1.5,
                        color: 'text.primary',
                        textDecoration: 'none',
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',

                        '&:hover': {
                          color: 'primary.main'
                        }
                      }}
                    >
                      {course?.courseTitle}
                    </Typography>

                    {/* TAGS */}
                    {type === 1 && course?.tags && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          mt: 2
                        }}
                      >
                        <Chip
                          label={course?.tags}
                          size='small'
                          variant='outlined'
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    )}

                    {/* PROGRESS */}
                    {type === 0 && course?.has_completed &&
                      course?.checkCertificate && (
                        <Box mt={3}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 1
                            }}
                          >
                            <Typography
                              variant='body2'
                              color='text.secondary'
                            >
                              Progress
                            </Typography>

                            <Typography
                              variant='body2'
                              fontWeight={700}
                              color='primary.main'
                            >
                              {Number(course?.completion_percentage || 0)}%
                            </Typography>
                          </Box>

                          {/* DOWNLOAD BUTTON */}
                          {(

                            <>

                              <LinearProgress
                                variant='determinate'
                                value={Number(course?.completion_percentage || 0)}
                                sx={{
                                  height: 10,
                                  borderRadius: 10,

                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 10
                                  }
                                }}
                              />

                              <Button
                                fullWidth
                                variant='contained'
                                onClick={e => {
                                  e.preventDefault()
                                  e.stopPropagation()

                                  handleDownloadCertificate(course)
                                }}
                                sx={{
                                  mt: 3,
                                  borderRadius: '12px',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  py: 1.2
                                }}
                              >
                                Download Certificate
                              </Button>

                            </>
                          )}
                        </Box>
                      )}
                  </Box>

                  {/* TYPE 1 FOOTER */}
                  {type === 1 && (
                    <Box mt={3}>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'success.main',
                          fontWeight: 600
                        }}
                      >
                        In Progress
                      </Typography>

                      <Typography
                        variant='body2'
                        sx={{
                          color: 'warning.main',
                          fontWeight: 600
                        }}
                      >
                        Overdue
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                {/* BOTTOM PROGRESS STRIP */}
                {type === 1 && (
                  <Box
                    sx={{
                      height: 5,
                      width: `${course?.percentage || 60}%`,
                      background:
                        'linear-gradient(90deg, #FACC15 0%, #F59E0B 100%)'
                    }}
                  />
                )}
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                py: 10,
                borderRadius: '20px',
                border: '1px dashed',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                No courses found.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* HIDDEN CERTIFICATE */}
      {/* HIDDEN CERTIFICATE */}
      <Box
        sx={{
          position: 'fixed',
          top: '-99999px',
          left: '-99999px',
          zIndex: -1
        }}
      >
        <DownloadCertificate
          ref={certificateRef}
          courseName={certificatePayload?.courseName}
          certificateData={certificatePayload?.certificate}
          userName={certificatePayload?.userName}
          date={certificatePayload?.date}
        />
      </Box>
    </>
  )
}

export default Courses
