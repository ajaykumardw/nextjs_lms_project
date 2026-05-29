// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar';

import { getInitials } from '@/utils/getInitials'

const UserProfileHeader = ({ data }) => {

  const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''

  const getAvatar = params => {
    const { avatar, fullName } = params

    if (avatar) {
      return (
        <CustomAvatar
          src={`${assert_url}/${avatar}`}
          sx={{ width: 120, height: 120 }}
        />
      )
    } else {
      return (
        <CustomAvatar sx={{ width: 120, height: 120 }}>
          {getInitials(fullName)}
        </CustomAvatar>
      )
    }
  }

  return (
    <Card>
      <CardMedia image={`${assert_url}/uploads/images/profile_bg.jfif`} className='bs-[250px]' />
      <CardContent className='flex gap-5 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
          {getAvatar({ avatar: data?.photo, fullName: `${data?.first_name} ${data?.last_name}` })}
        </div>
        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{data?.first_name} {data?.last_name}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              {data?.designation && (
                <div className='flex items-center gap-2'>
                  {<i className="tabler-briefcase" />}

                  <Typography className='font-medium'>
                    {data?.designation?.name}
                  </Typography>
                </div>
              )}
              <div className='flex items-center gap-2'>
                <i className='tabler-map-pin' />
                <Typography className='font-medium'>{data?.address}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-calendar' />
                <Typography className='font-medium'>
                  {data?.created_at
                    ? new Date(data.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                    : '-'}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
