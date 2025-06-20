// utils/getPermission.ts
import { useSession } from 'next-auth/react';

const URL = process.env.NEXT_PUBLIC_API_URL;

export const usePermissionList = () => {
    const { data: session } = useSession();
    const token = session?.user?.token;

    const getPermissions = async () => {
        if (!token) return {};

        try {
            const response = await fetch(`${URL}/admin/role/allow/permission`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                return data.data;
            } else {
                console.error('Failed to fetch permissions:', response.status);
                
                return {};
            }
        } catch (error) {
            console.error('Error fetching permission list:', error);
            
            return {};
        }
    };

    return getPermissions;
};
