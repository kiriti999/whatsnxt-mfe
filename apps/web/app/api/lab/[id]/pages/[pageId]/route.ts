import { NextResponse } from 'next/server';
import { deleteLabPage } from '../../../../../../fetcher/labServerQuery';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const { id, pageId } = await params;

    if (!id || !pageId) {
      return NextResponse.json(
        { error: 'Lab ID and Page ID are required' },
        { status: 400 }
      );
    }

    const result = await deleteLabPage(id, pageId);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to delete page' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
