'use client'

import {
  useRef,
  forwardRef,
  useState
} from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI
import {
  Button,
  Card,
  Breadcrumbs,
  Link,
  Skeleton,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip
} from '@mui/material'

import Grid from '@mui/material/Grid2'

// PDF
import jsPDF from 'jspdf'

import html2canvas from 'html2canvas'

const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''

const slugify = text => {

  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to -
    .replace(/-+/g, '-') // remove duplicate -
}

function formatEnrollDate(dateString) {

  if (!dateString) return '-'

  const date = new Date(dateString)

  return `${String(date.getDate()).padStart(2, '0')} ${String(
    date.getMonth() + 1
  ).padStart(2, '0')} ${date.getFullYear()}`
}

const DownloadCertificate = forwardRef(
  ({ certificateData, userName, date, courseName }, ref) => {

    return (

      <Grid size={{ xs: 12 }}>
        <Box position='relative' ref={ref}>
          <Box
            sx={{
              backgroundImage: `url(${assert_url}/frames/${certificateData?.backgroundImage})`,
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
                    src={`${assert_url}/company_logo/${certificateData?.logoURL}`}
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
                      src={`${assert_url}/signature/${certificateData?.signatureURL ||
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
                      src={`${assert_url}/signature/${certificateData?.signatureURL2 ||
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

export default function ProgramPage({ data }) {

  const { lang } = useParams()

  const router = useRouter()

  const { data: session } = useSession()

  const certificateRef = useRef(null)

  const [datas, setDatas] = useState(null)

  const isLoading = !data

  const handleDownloadCertificate = async item => {

    const certificatePayload = {
      userName: session?.user?.name || '',
      date: item?.module_completed_at,
      certificate: item?.certificate,
      courseName: item?.title
    }

    setDatas(certificatePayload)

    // Wait for component render
    setTimeout(async () => {
      try {
        const input = certificateRef.current

        if (!input) return

        const canvas = await html2canvas(input, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
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

        pdf.save(
          `${slugify(item?.title || 'certificate')}.pdf`
        )
      } catch (error) {
        console.error('Certificate Download Error:', error)
      }
    }, 500)
  }

  if (isLoading) {

    return (
      <Box className='p-6 space-y-5'>
        <Card>
          <Box px={5} py={2}>
            <Skeleton width={120} height={20} />
          </Box>

          <CardContent className='flex flex-col sm:flex-row gap-5'>
            <Skeleton
              variant='rectangular'
              width={260}
              height={230}
            />

            <Box
              flex={1}
              className='flex flex-col justify-between gap-3'
            >
              <Skeleton width='50%' height={32} />
              <Skeleton width='70%' height={28} />

              <Stack direction='row' spacing={4}>
                <Skeleton width={80} height={20} />
                <Skeleton width={80} height={20} />
              </Stack>

              <Skeleton
                variant='rectangular'
                width='100%'
                height={10}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  const logs = data?.courses || []

  const avgCompletion =
    logs.length > 0
      ? logs.reduce(
        (sum, item) =>
          sum + Number(
            item?.completion_percentage || 0
          ),
        0
      ) / logs.length
      : 0

  return (
    <Box className='p-6 space-y-5'>
      {/* Header */}
      <Card>
        <Breadcrumbs
          aria-label='breadcrumb'
          separator='›'
          sx={{
            px: 5,
            py: 2,
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Link href={`/${lang}/apps/my-courses`}>
            <Typography component='span'>
              Home
            </Typography>
          </Link>
        </Breadcrumbs>

        <CardContent className='flex flex-col sm:flex-row gap-5'>
          <Box
            component='img'
            src={`${assert_url}/program_module/${data?.courseDetails?.image_url}`}
            alt={data?.courseDetails?.title}
            sx={{
              width: 260,
              height: 230,
              borderRadius: 2,
              objectFit: 'cover'
            }}
          />

          <Box className='flex flex-col justify-between'>
            <div>
              <Typography variant='h6'>
                Program:
              </Typography>

              <Typography
                fontWeight={600}
                variant='h5'
              >
                {data?.courseDetails?.title}
              </Typography>
            </div>

            <Box className='flex gap-10 mt-3'>
              <div>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Modules Enrolled
                </Typography>

                <Typography fontWeight={600}>
                  {data?.courses?.length || 0}
                </Typography>
              </div>
            </Box>

            <Box mt={2}>
              <Typography variant='body2'>
                {avgCompletion.toFixed(1)}%
                Completed
              </Typography>

              <LinearProgress
                variant='determinate'
                value={avgCompletion}
                sx={{
                  mt: 1,
                  height: 8,
                  borderRadius: 2
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Modules */}
      <Typography variant='h6'>
        Enrolled Modules
      </Typography>

      {data?.courses?.length > 0 ? (
        data?.courses?.map((item, index) => {

          const completion = Number(
            item?.completion_percentage || 0
          )

          let status = 'Pending'

          if (completion >= 100) {
            
            status = 'Completed'
          } else if (completion > 0) {

            status = 'In Progress'
          }

          return (
            
            <Card
              key={index}
              className='rounded-lg hover:shadow-sm transition-all cursor-pointer'
              onClick={() => {
                router.push(
                  `/${lang}/apps/content?id=${item?._id}&content-folder-id=${data?.courseDetails?._id}`
                )
              }}
            >
              <CardContent className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                <Stack
                  direction='row'
                  spacing={2}
                  className='flex-1 min-w-0'
                >
                  <Box
                    component='img'
                    src={`${assert_url}/program_module/${item?.image_url}`}
                    alt={item?.title}
                    sx={{
                      width: 75,
                      height: 75,
                      borderRadius: 1,
                      objectFit: 'cover'
                    }}
                  />

                  <Box>
                    <Typography fontWeight={600}>
                      {item?.title}
                    </Typography>

                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      {item?.description}
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='flex-end'
                >
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    Enrolled on{' '}
                    {formatEnrollDate(
                      item?.created_at
                    )}
                  </Typography>

                  <Chip
                    label={status}
                    size='small'
                    color={
                      status === 'Completed'
                        ? 'success'
                        : status === 'In Progress'
                          ? 'warning'
                          : 'default'
                    }
                    sx={{ mt: 1 }}
                  />

                  {item?.has_completed &&
                    item?.is_certificate_enable && (
                      <Button
                        variant='contained'
                        size='small'
                        sx={{ mt: 1 }}
                        onClick={e => {
                          e.stopPropagation()
                          e.preventDefault()

                          handleDownloadCertificate(
                            item
                          )
                        }}
                      >
                        Download Certificate
                      </Button>
                    )}
                </Box>
              </CardContent>

              {status !== 'Pending' && (
                <LinearProgress
                  variant='determinate'
                  value={
                    completion > 100
                      ? 100
                      : completion
                  }
                  sx={{
                    height: 3
                  }}
                />
              )}
            </Card>
          )
        })
      ) : (
        <Box
          className='flex justify-center items-center'
          sx={{
            py: 6,
            border: '1px solid #ECECEC',
            borderRadius: 2,
            backgroundColor: '#FAFAFA'
          }}
        >
          <Typography
            variant='body1'
            color='text.secondary'
            fontStyle='italic'
          >
            No Program found.
          </Typography>
        </Box>
      )}

      {/* Hidden Certificate */}
      {datas && (
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
            courseName={datas?.courseName}
            certificateData={datas?.certificate}
            userName={datas?.userName}
            date={datas?.date}
          />
        </Box>
      )}
    </Box>
  )
}
