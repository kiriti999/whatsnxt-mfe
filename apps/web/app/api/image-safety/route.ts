
import { NextRequest, NextResponse } from 'next/server';
import { scanImageSafety, validateImageForSafety, getSafetySummary } from '../../../utils/imageSafety';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Image safety scan request received');

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' }, 
        { status: 400 }
      );
    }

    console.log('📁 API: Processing file:', file.name, 'Size:', file.size);

    // Validate file for safety scanning
    try {
      validateImageForSafety(file);
    } catch (error) {
      console.error('❌ API: File validation failed:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'File validation failed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('🔍 API: Starting safety scan...');

    // Perform safety scan
    const safetyResult = await scanImageSafety(buffer);
    const summary = getSafetySummary(safetyResult);

    console.log('✅ API: Safety scan completed:', safetyResult);

    return NextResponse.json({
      success: true,
      safe: safetyResult.safe,
      summary,
      details: safetyResult,
    });

  } catch (error) {
    console.error('❌ API: Safety scan failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Safety scan failed',
        safe: false // Always mark as unsafe if scan fails
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
