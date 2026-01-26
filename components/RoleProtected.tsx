"use client";
import React from 'react';
import { useRoleAccess, UserRole } from '@/hooks/useRoleAccess';

interface RoleProtectedProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
    redirectTo?: string;
}

export default function RoleProtected({ allowedRoles, children, redirectTo }: RoleProtectedProps) {
    const { isAuthorized, isLoading } = useRoleAccess({ allowedRoles, redirectTo });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying permissions...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
