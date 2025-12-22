import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Note: API routes with cookies() are automatically dynamic - no config needed
export async function GET() {
    try {
        const BASEURL = process.env.BFF_HOST_LAB_API as string;
        const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN || 'whatsnxt_access_token';
        const cookieStore = await cookies();
        const token = cookieStore.get(tokenKeyName)?.value;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': token }),
        };

        const response = await fetch(`${BASEURL}/labs`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch labs: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data: data?.data || [] });
    } catch (error) {
        console.error('Error fetching labs:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch labs' }, { status: 500 });
    }
}
