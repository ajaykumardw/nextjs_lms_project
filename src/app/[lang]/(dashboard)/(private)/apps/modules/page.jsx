// Component Imports
import AcademyMyCourse from '@/views/apps/modules/list'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Data Imports
import { getAcademyData } from '@/app/server/actions'

import PermissionGuard from '@/hocs/PermissionGuard'


export default async function MyCoursePage({ params }) {

  const locale = params.lang;

  const mode = await getServerMode()
  const data = await getAcademyData()

  return (
    <PermissionGuard locale={locale} element={'isCompany'}>
      <AcademyMyCourse mode={mode} courseData={data?.courses} />
    </PermissionGuard>
  )
}
// const MyCoursePage = async () => {
//   // Vars
// }

// export default MyCoursePage
