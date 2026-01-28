import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export type UserRole =
    | 'super_admin'
    | 'event_admin'
    | 'coordinator'
    | 'registration'
    | 'program_reporting'
    | 'scoring';

interface UseRoleAccessOptions {
    allowedRoles: UserRole[];
    redirectTo?: string;
}

export function useRoleAccess({ allowedRoles, redirectTo = '/dashboard' }: UseRoleAccessOptions) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const res = await api.get('/auth/me');
                if (res.data.success) {
                    const role = res.data.data.role as UserRole;
                    setUserRole(role);

                    if (allowedRoles.includes(role)) {
                        setIsAuthorized(true);
                    } else {
                         const roleRedirects: Record<UserRole, string> = {
            super_admin: '/dashboard',
            event_admin: '/dashboard',
            coordinator: '/events',
            registration: '/dashboard/registration',
            program_reporting: '/dashboard/reporting',
            scoring: '/dashboard/scoring',
          };


          
          router.replace(roleRedirects[role] || '/dashboard');
                    }
                }
            } catch (error) {
                console.error('Authorization check failed:', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [allowedRoles, redirectTo, router]);

    return { isAuthorized, isLoading, userRole };
}
