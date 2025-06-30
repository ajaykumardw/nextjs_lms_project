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

// Sample data (keep your full list here)
const courseList = [
  {
    id: 1,
    tutorImg: '/images/apps/academy/1.png',
    courseTitle: 'Basics of Angular',
    tags: 'Web',
  },
  {
    id: 2,
    tutorImg: '/images/apps/academy/2.png',
    courseTitle: 'UI/UX Design',
    tags: 'Design',
  },
  {
    id: 3,
    tutorImg: '/images/apps/academy/3.png',
    courseTitle: 'React Native',
    tags: 'Web',
  },
  {
    id: 4,
    tutorImg: '/images/apps/academy/4.png',
    courseTitle: 'Art & Drawing',
    tags: 'Design',
  },
  {
    id: 5,
    tutorImg: '/images/apps/academy/5.png',
    courseTitle: 'Basic Fundamentals',
    tags: 'Web',
  },
  {
    id: 6,
    tutorImg: '/images/apps/academy/6.png',
    courseTitle: 'React for Beginners',
    tags: 'Web',
  },
  {
    id: 7,
    tutorImg: '/images/apps/academy/1.png',
    courseTitle: 'The Science of Critical Thinking',
    tags: 'Psychology',
  },
  {
    id: 8,
    tutorImg: '/images/apps/academy/2.png',
    courseTitle: 'The Complete Figma UI/UX Course',
    tags: 'Design',
  },
  {
    id: 9,
    tutorImg: '/images/apps/academy/3.png',
    courseTitle: 'Advanced Problem Solving Techniques',
    tags: 'Psychology',
  },
  {
    id: 10,
    tutorImg: '/images/apps/academy/4.png',
    courseTitle: 'Advanced React Native',
    tags: 'Web',
  },
]

const Courses = ({ searchValue }) => {
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
    const filtered = searchValue
      ? courseList.filter(course =>
        course.courseTitle.toLowerCase().includes(searchValue.toLowerCase())
      )
      : courseList

    setFilteredCourses(filtered)
  }, [searchValue])

  return (
    <div className='p-4 flex flex-col gap-6'>

      <div className='flex flex-wrap gap-6 justify-start'>
        <Grid container spacing={6}>
          {filteredCourses.map((course, index) => (
            <Grid key={index} size={{ xs: 12, sm: 3 }}>
              {/* // <div key={index} className='flex-none w-[19%]'> */}
              <Card
                className='rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary'
                sx={{
                  height: 320,
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
                  </div>

                  <div>
                    <Typography variant='body2' color='text.primary'>
                      In Progress
                    </Typography>
                    <Typography variant='body2' color='error.main' fontWeight={600}>
                      Overdue
                    </Typography>
                  </div>
                </CardContent>

                <div style={{ height: 4, backgroundColor: '#FACC15' }} />
              </Card>
              {/* // </div> */}
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  )
}

export default Courses
