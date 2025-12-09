import { NextResponse } from 'next/server';
import { Lab } from '../../../../types/lab';
import { createLab } from '../../../../fetcher/labServerQuery';

export async function POST(request: Request) {
  try {
    const body: Lab = await request.json();

    // Basic validation
    if (!body.title || !body.description || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, or type' },
        { status: 400 }
      );
    }

    const savedLab = await createLab(body);

    if (!savedLab) {
       throw new Error('Failed to create lab in backend');
    }

    return NextResponse.json({ success: true, data: savedLab }, { status: 201 });
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
