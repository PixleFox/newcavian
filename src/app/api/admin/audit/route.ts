'use server';

import { NextRequest, NextResponse } from 'next/server';
import { logAdminEvent } from '@/lib/audit-logger';
import { AuditEventType } from '@/lib/audit-logger';
import { getSession, getClientIp, getUserAgent } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getSession(request);
    if (!session?.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { eventType, performedByAdminId, targetAdminId, metadata } = await request.json();

    // Validate required fields
    if (!eventType || !performedByAdminId || !targetAdminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the event type is valid
    if (!Object.values(AuditEventType).includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Add IP and user agent to metadata
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Create the audit log
    await logAdminEvent(
      eventType as AuditEventType,
      performedByAdminId,
      targetAdminId,
      {
        ...metadata,
        ipAddress,
        userAgent
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
