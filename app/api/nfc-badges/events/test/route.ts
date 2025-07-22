import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { broadcastNFCBadgeUpdate } = await import('../route');
    
    // Test broadcast
    const testData = {
      id: 'test-badge-' + Date.now(),
      badgeId: 'TEST-' + Date.now().toString(16).toUpperCase(),
      status: 'AVAILABLE',
      employee: null,
      notes: 'Test broadcast from API',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await broadcastNFCBadgeUpdate('create', testData);
    
    return NextResponse.json({
      success: true,
      message: 'Test broadcast sent',
      data: testData,
    });
  } catch (error) {
    console.error('Test broadcast failed:', error);
    return NextResponse.json(
      { error: 'Test broadcast failed', details: error.message },
      { status: 500 }
    );
  }
} 
