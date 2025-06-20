// Component Imports
import Language from '@views/apps/language'
import PermissionGuard from '@/hocs/PermissionGuard'

export default function LanguageApp({ params }) {

  const locale = params.lang;

  return (
    <PermissionGuard locale={locale} element={'isSuperAdmin'}>
      <Language />
    </PermissionGuard>
  )

}

// const LanguageApp = async () => {

//   return <Language />
// }

// export default LanguageApp
