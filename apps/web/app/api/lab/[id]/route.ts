import { NextResponse } from 'next/server';
import { fetchLabById } from '../../../../fetcher/labServerQuery';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Lab ID is required' },
        { status: 400 }
      );
    }

    const lab = await fetchLabById(id);

    if (!lab) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lab });
  } catch (error) {
    console.error('Error fetching lab:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
