
import PermissionGuardServer from '@/hocs/PermissionGuard';
import Notification from '@views/apps/Notification/page'

export default async function AdminNotification({ params }) {

    const { lang: lang } = await params?.lang;

    return (
        <PermissionGuardServer locale={lang} element={'isSuperAdmin'}>
            <Notification />
        </PermissionGuardServer>
    );
}
