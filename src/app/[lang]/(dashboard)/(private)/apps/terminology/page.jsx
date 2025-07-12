// Component Imports
import PermissionGuard from '@/hocs/PermissionGuard'
import Terminology from '@views/apps/terminology'

export default function TerminologyApp({params}) {

  const locale = params.lang;

  return (
    <PermissionGuard locale={locale} element={'isSuperAdmin'}>
      <Terminology />
    </PermissionGuard>
  )
}
