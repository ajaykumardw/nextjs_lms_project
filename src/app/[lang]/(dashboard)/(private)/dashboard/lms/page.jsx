// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import DistributedBarChartOrder from '@views/dashboard/lms/DistributedBarChartOrder'
import LineAreaYearlySalesChart from '@views/dashboard/lms/LineAreaYearlySalesChart'
import CardStatVertical from '@/components/card-statistics/Vertical'
import BarChartRevenueGrowth from '@views/dashboard/lms/BarChartRevenueGrowth'
import EarningReportsWithTabs from '@views/dashboard/lms/EarningReportsWithTabs'
import RadarSalesChart from '@views/dashboard/lms/RadarSalesChart'
import SalesByCountries from '@views/dashboard/lms/SalesByCountries'
import ProjectStatus from '@views/dashboard/lms/ProjectStatus'
import ActiveProjects from '@views/dashboard/lms/ActiveProjects'
import LastTransaction from '@views/dashboard/lms/LastTransaction'
import ActivityTimeline from '@views/dashboard/lms/ActivityTimeline'

// Permission Guard
import PermissionGuard from '@/hocs/PermissionGuard'

export default function DashboardCRM({ params }) {
  const locale = 'en';

  return (
    <PermissionGuard locale={locale} element="notUser">
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <DistributedBarChartOrder />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <LineAreaYearlySalesChart />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <CardStatVertical
            title="Total Profit"
            subtitle="Last Week"
            stats="1.28k"
            avatarColor="error"
            avatarIcon="tabler-credit-card"
            avatarSkin="light"
            avatarSize={44}
            chipText="-12.2%"
            chipColor="error"
            chipVariant="tonal"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <CardStatVertical
            title="Total Sales"
            subtitle="Last Week"
            stats="24.67k"
            avatarColor="success"
            avatarIcon="tabler-currency-dollar"
            avatarSkin="light"
            avatarSize={44}
            chipText="+24.67%"
            chipColor="success"
            chipVariant="tonal"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8, lg: 4 }}>
          <BarChartRevenueGrowth />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <EarningReportsWithTabs />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <RadarSalesChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <SalesByCountries />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <ProjectStatus />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <ActiveProjects />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {/* <LastTransaction serverMode={serverMode} /> */}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ActivityTimeline />
        </Grid>
      </Grid>
    </PermissionGuard>
  );
}

