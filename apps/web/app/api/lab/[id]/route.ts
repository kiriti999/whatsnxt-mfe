import { NextResponse } from 'next/server';
import { fetchLabById, updateLab } from '../../../../fetcher/labServerQuery';
import { Lab } from '../../../../types/lab';

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Lab = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Lab ID is required' },
        { status: 400 }
      );
    }

    const updatedLab = await updateLab(id, body);

    if (!updatedLab) {
      return NextResponse.json(
        { error: 'Failed to update lab' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedLab });
  } catch (error) {
    console.error('Error updating lab:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
