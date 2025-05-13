import isEmpty from 'lodash/isEmpty';
import intersection from 'lodash/intersection';
import { NextRequest, NextResponse } from 'next/server';

import { ERoutes, routesConfig } from '@/types/routes';
import { ERole } from './types/account';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const AUTH_COOKIE = '_admin_chamdep_jwt';

// Routes that don't require authentication
const publicRoutes = ['/login'];

async function getUser(accessToken: string | undefined) {
	if (!accessToken) return null;
	
	try {
		const response = await fetch(`${API_URL}/api/users/me`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error('Error fetching user:', error);
		return null;
	}
}

export async function middleware(request: NextRequest) {
	// Get the pathname
	const { pathname } = request.nextUrl;
	console.log('Path:', pathname);
	
	// Check if this is a public route
	const isPublicRoute = publicRoutes.some(route => 
		pathname === route || pathname.startsWith(`${route}/`)
	);
	console.log('Is public route:', isPublicRoute);
	
	// CASE 1: Public route - allow access
	if (isPublicRoute) {
		return NextResponse.next();
	}
	
	// Get the token from cookies
	const accessToken = request.cookies.get(AUTH_COOKIE)?.value;
	console.log('Has token:', !!accessToken);
	
	// CASE 2: No token and trying to access protected route - redirect to login
	if (!accessToken) {
		console.log('No token, redirecting to login');
		const loginUrl = new URL(ERoutes.LOGIN, request.url);
		return NextResponse.redirect(loginUrl);
	}
	
	// CASE 3: Has token - validate it
	const userData = await getUser(accessToken);
	console.log('User data:', userData ? 'exists' : 'null');
	
	// CASE 4: Invalid token - redirect to login
	if (!userData) {
		console.log('Invalid token, redirecting to login');
		const loginUrl = new URL(ERoutes.LOGIN, request.url);
		return NextResponse.redirect(loginUrl);
	}
	
	// Extract user data
	const { role, permissions = '' } = userData;
	console.log('User role:', role);
	
	// CASE 5: User is admin - allow access to everything
	if (role === ERole.ADMIN) {
		console.log('User is admin, allowing access');
		return NextResponse.next();
	}
	
	// CASE 6: Check route permissions
	const routeConfig = routesConfig.find(route => pathname.startsWith(route.path));
	
	// No specific route config found - redirect to dashboard
	if (!routeConfig || !routeConfig.mode || routeConfig.mode.length === 0) {
		console.log('No route config, redirecting to dashboard');
		const dashboardUrl = new URL(ERoutes.DASHBOARD, request.url);
		return NextResponse.redirect(dashboardUrl);
	}
	
	// Check if user has required permissions for this route
	const userPermissions = permissions.split(',');
	const hasRequiredPermissions = intersection(routeConfig.mode, userPermissions).length > 0;
	console.log('Has permissions:', hasRequiredPermissions);
	
	// CASE 7: User doesn't have required permissions - redirect to dashboard
	if (!hasRequiredPermissions) {
		console.log('No permissions, redirecting to dashboard');
		const dashboardUrl = new URL(ERoutes.DASHBOARD, request.url);
		return NextResponse.redirect(dashboardUrl);
	}
	
	// CASE 8: User has permissions - allow access
	console.log('User has permissions, allowing access');
	return NextResponse.next();
}

export const config = {
	matcher: [
		'/admin/:path*',
		'/login'
	]
};
