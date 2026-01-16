import LogisticsDashboard from '../../../apps/dashboard/page'
import PermissionGuard from '@/hocs/PermissionGuard';
import BlastMessage from "@/components/blast-success-message/page.jsx";

export default async function UserDashboard({ params }) {

    const { lang } = await params;

    return (
        <>
            <PermissionGuard locale={lang   } element={'isUser'}>
                <>
                    <LogisticsDashboard />
                </>

            </PermissionGuard>
        </>
    )

}
