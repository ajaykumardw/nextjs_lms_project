import LogisticsDashboard from '../../../apps/dashboard/page'
import PermissionGuard from '@/hocs/PermissionGuard';
import BlastMessage from "@/components/blast-success-message/page.jsx";

export default async function UserDashboard({ params }) {

    const locale = await params?.lang;

    return (
        <>
            <PermissionGuard locale={locale} element={'isUser'}>
                <>
                    <LogisticsDashboard />
                </>

            </PermissionGuard>
        </>
    )

}
