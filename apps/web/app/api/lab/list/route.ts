import { NextResponse } from 'next/server';
import { fetchLabs } from '../../../../fetcher/labServerQuery';

export async function GET() {
    try {
        const labs = await fetchLabs();
        return NextResponse.json({ success: true, data: labs });
    } catch (error) {
        console.error('Error fetching labs:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch labs' }, { status: 500 });
    }
}
