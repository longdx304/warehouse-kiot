'use client';

import React, { PropsWithChildren, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/api/auth';
import { User } from '@/types/auth';
import { ERoutes } from '@/types/routes';

type UserContextType = {
	user: User | undefined;
	isLoading: boolean;
};

const defaultUserContext: UserContextType = {
	user: undefined,
	isLoading: false,
};

const UserContext = React.createContext(defaultUserContext);

export const UserProvider = ({ children }: PropsWithChildren) => {
	const router = useRouter();
	const { data: user, isLoading, isError } = useSession();
	
	// Use useEffect for client-side navigation
	useEffect(() => {
		if (isError) {
			router.push(ERoutes.LOGIN);
		}
	}, [isError, router]);

	return (
		<UserContext.Provider value={{ user, isLoading }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};
