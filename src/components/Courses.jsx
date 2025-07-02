'use client'

import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Utils
import Grid from '@mui/material/Grid2'

import { getLocalizedUrl } from '@/utils/i18n'
import themeConfig from '@/configs/themeConfig'


const Courses = ({ searchValue, type }) => {
  const [filteredCourses, setFilteredCourses] = useState([])
  const { lang: locale } = useParams()

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')         // Replace spaces and underscores with -
      .replace(/[^\w\-]+/g, '')        // Remove all non-word chars
      .replace(/\-\-+/g, '-');         // Replace multiple - with single -


  useEffect(() => {
    if (searchValue) {
      setFilteredCourses(searchValue);
    }

  }, [searchValue]);

  console.log("Theme", themeConfig);


  return (
    <Grid container spacing={6}>
      {filteredCourses.map((course, index) => (
        <Grid key={index} size={{ xs: 12, sm: 3 }}>
          {/* // <div key={index} className='flex-none w-[19%]'> */}
          <Card
            key={index}
            className='rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary'
            style={{
              width: "100%",
              height: 310,
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              border: '1px solid transparent',
              '&:hover': {
                borderColor: theme => theme.palette.primary.main,
              },
            }}
          >
            <Link href={getLocalizedUrl(`/apps/moduleProgram/detail/${slugify(course.courseTitle)}`, locale)}>
              <img
                src={course.tutorImg}
                alt={course.courseTitle}
                className='w-full object-cover'
                style={{ height: 120 }}
              />
            </Link>

            <CardContent
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1
              }}
            >
              <div>
                <Typography
                  variant='subtitle1'
                  fontWeight={600}
                  component={Link}
                  href={getLocalizedUrl(`/apps/moduleProgram/detail/${slugify(course.courseTitle)}`, locale)}
                  className='line-clamp-2 hover:text-primary'
                >
                  {course.courseTitle}
                </Typography>

                {type == 1 && (
                  <div className='flex flex-wrap gap-1 my-1'>
                    {course.tags && (
                      <Chip
                        label={course.tags}
                        variant='outlined'
                        size='small'
                        sx={{ fontSize: '0.7rem', borderRadius: '12px' }}
                      />
                    )}
                  </div>
                )}

                {type === 0 && (
                  <Typography className="mt-5 text-center w-full flex justify-center">
                    Estimated to 2
                  </Typography>
                )}


              </div>

              {type === 0 && (
                <Typography
                  variant="body2"
                  className="line-clamp-3 text-sm text-grey-600"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  Angular is a TypeScript-based front-end web application framework developed by Google. It is used to build dynamic, single-page web applications (SPAs) with a structured and scalable architecture.
                </Typography>
              )}


              {type == 1 && (

                <div>
                  <Typography variant='body2' color='text.primary'>
                    In Progress
                  </Typography>
                  <Typography variant='body2' color='error.main' fontWeight={600}>
                    Overdue
                  </Typography>
                </div>
              )}
            </CardContent>

            {type == 1 && (

              <div style={{ blockSize: 4, inlineSize: `${course.percentage}%`, backgroundColor: '#FACC15' }} />
            )}
          </Card>
          {/* // </div> */}
        </Grid>
      ))}
    </Grid>
  )
}

export default Courses
