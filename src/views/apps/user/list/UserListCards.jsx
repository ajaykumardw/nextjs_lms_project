// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Vars
const data = [
  {
    title: 'Total users',
    stats: '0',
    avatarIcon: 'tabler-users',
    avatarColor: 'primary',
    trend: 'positive',
    trendNumber: '',
    subtitle: ''
  },
  {
    title: 'Active users',
    stats: '0',
    avatarIcon: 'tabler-user-plus',
    avatarColor: 'error',
    trend: 'positive',
    trendNumber: '',
    subtitle: ''
  },
  {
    title: 'Inactive Users',
    stats: '0',
    avatarIcon: 'tabler-user-check',
    avatarColor: 'success',
    trend: 'negative',
    trendNumber: '',
    subtitle: ''
  },
  {
    title: 'Not logged in',
    stats: '0',
    avatarIcon: 'tabler-user-search',
    avatarColor: 'warning',
    trend: 'positive',
    trendNumber: '0',
    subtitle: ''
  }
]

const UserListCards = () => {
  return (
    <Grid container spacing={6}>
      {data.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default UserListCards
