//MUI Imports
import Grid from '@mui/material/Grid2'

//Component Imports
import LogisticsStatisticsCard from '@views/apps/logistics/dashboard/LogisticsStatisticsCard'
import LogisticsVehicleOverview from '@views/apps/logistics/dashboard/LogisticsVehicleOverview'
import LogisticsShipmentStatistics from '@views/apps/logistics/dashboard/LogisticsShipmentStatistics'
import LogisticsDeliveryPerformance from '@views/apps/logistics/dashboard/LogisticsDeliveryPerformance'
import LogisticsDeliveryExceptions from '@views/apps/logistics/dashboard/LogisticsDeliveryExceptions'
import LogisticsOrdersByCountries from '@/views/apps/logistics/dashboard/LogisticsOrdersByCountries'
import LogisticsOverviewTable from '@views/apps/logistics/dashboard/LogisticsOverviewTable'

//Data Imports
import { getLogisticsData, getStatisticsData } from '@/app/server/actions'

const UserDashboard = async () => {

  // Vars
  const data = await getStatisticsData()
  const vehicleData = await getLogisticsData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <LogisticsStatisticsCard data={data?.statsHorizontalWithBorder} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <LogisticsDeliveryExceptions />
      </Grid>
    </Grid>
  )
}

export default UserDashboard
