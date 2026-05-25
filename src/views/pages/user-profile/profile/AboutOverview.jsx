// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

const renderList = list => {
  return (
    list.length > 0 &&
    list.map((item, index) => {
      return (
        <div key={index} className='flex items-center gap-2'>
          <i className={item.icon} />
          <div className='flex items-center flex-wrap gap-2'>
            <Typography className='font-medium'>
              {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
            </Typography>
            <Typography> {item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
          </div>
        </div>
      )
    })
  )
}

const renderTeams = teams => teams?.length > 0 && <div className='flex flex-wrap gap-2'>{teams.map((item, index) => <div key={index} className='px-2 py-1 rounded border'><Typography className='font-medium'>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Typography></div>)}</div>

const AboutOverview = ({ data }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                About
              </Typography>

              <div className='flex items-center gap-2'>
                <i className='tabler-user' />
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>
                    {`${data?.first_name?.toUpperCase()} ${data?.last_name?.toUpperCase()}`}
                  </Typography>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <i className='tabler-mail' />
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>
                    {data?.email}
                  </Typography>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <i className='tabler-device-mobile' />
                <div className='flex items-center flex-wrap gap-2'>
                  <Typography className='font-medium'>
                    {data?.phone}
                  </Typography>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Roles
              </Typography>
              {data?.roles && renderTeams(data?.roles)}
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AboutOverview
