// Do NOT add 'use client' here — this is a Server Component

import PermissionGuard from '@/hocs/PermissionGuard';
import Branch from '@views/apps/branch'

export default async function BranchApp({ params }) {
    const locale = params.lang;

    return (
        <PermissionGuard locale={locale} element="hasBranchPermission">
            <Branch />
        </PermissionGuard>
    );
}
