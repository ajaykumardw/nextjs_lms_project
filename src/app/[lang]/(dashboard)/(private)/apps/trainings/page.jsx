// Component Imports
import Trainings from '@/views/apps/trainings/list'

import PermissionGuard from '@/hocs/PermissionGuard'

export default async function MyTrainingPage({ params }) {

  const locale = params.lang;

  return (
    <PermissionGuard locale={locale} element={'isCompany'}>
      <Trainings />
    </PermissionGuard>
  )
}
