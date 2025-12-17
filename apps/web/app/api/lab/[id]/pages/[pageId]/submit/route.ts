import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4444';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; pageId: string } }
) {
  try {
    const body = await request.json();
    const { id: labId, pageId } = params;

    // Forward to backend
    const response = await fetch(
      `${BACKEND_URL}/api/v1/labs/${labId}/pages/${pageId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward authorization if present
          ...(request.headers.get('authorization') && {
            authorization: request.headers.get('authorization')!,
          }),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to submit test' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error submitting test:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; pageId: string } }
) {
  try {
    const { id: labId, pageId } = params;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { message: 'studentId is required' },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetch(
      `${BACKEND_URL}/api/v1/labs/${labId}/pages/${pageId}/submission?studentId=${studentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('authorization') && {
            authorization: request.headers.get('authorization')!,
          }),
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch submission' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
