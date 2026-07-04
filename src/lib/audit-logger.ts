/**
 * Audit Logger Module
 * 
 * This module provides comprehensive audit logging functionality for sensitive admin actions.
 * It logs all security-related events and administrative operations with detailed context.
 * 
 * Features:
 * - Detailed event logging with admin context
 * - IP address and user agent tracking
 * - Structured log format for easy querying
 * - Severity levels for different types of events
 */

import prisma from './prisma';

export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE',
  OTP_REQUEST = 'OTP_REQUEST',
  OTP_VERIFICATION = 'OTP_VERIFICATION',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Admin Management Events
  ADMIN_CREATED = 'ADMIN_CREATED',
  ADMIN_UPDATED = 'ADMIN_UPDATED',
  ADMIN_DELETED = 'ADMIN_DELETED',
  ADMIN_ACTIVATED = 'ADMIN_ACTIVATED',
  ADMIN_DEACTIVATED = 'ADMIN_DEACTIVATED',
  ADMIN_ROLE_CHANGED = 'ADMIN_ROLE_CHANGED',
  
  // Security Events
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface AuditMetadata {
  targetAdminId?: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Creates a new audit log entry
 */
export const createAuditLog = async (
  eventType: AuditEventType,
  adminId: number | null,
  severity: AuditSeverity,
  metadata: AuditMetadata
) => {
  try {
    const log = await prisma.adminAuditLog.create({
      data: {
        eventType,
        severity,
        adminId,
        targetAdminId: metadata.targetAdminId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: metadata.details ? JSON.stringify(metadata.details) : null,
        timestamp: new Date()
      }
    });

    // For critical events, we might want to trigger additional notifications
    if (severity === AuditSeverity.CRITICAL) {
      await notifyCriticalEvent(log);
    }

    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Even if logging fails, we don't want to break the application
    return null;
  }
};

/**
 * Helper function to log authentication events
 */
export const logAuthEvent = async (
  eventType: AuditEventType,
  phoneNumber: string,
  success: boolean,
  metadata: AuditMetadata
) => {
  const severity = success ? AuditSeverity.INFO : AuditSeverity.WARNING;
  
  // Try to find the admin for the phone number
  const admin = await prisma.admin.findUnique({
    where: { phoneNumber },
    select: { id: true }
  });

  return createAuditLog(
    eventType,
    admin?.id || null,
    severity,
    {
      ...metadata,
      details: {
        ...metadata.details,
        phoneNumber,
        success
      }
    }
  );
};

/**
 * Helper function to log admin management events
 */
export const logAdminEvent = async (
  eventType: AuditEventType,
  performedByAdminId: number,
  targetAdminId: number,
  metadata: AuditMetadata
) => {
  return createAuditLog(
    eventType,
    performedByAdminId,
    AuditSeverity.INFO,
    {
      ...metadata,
      targetAdminId
    }
  );
};

/**
 * Helper function to log security events
 */
export const logSecurityEvent = async (
  eventType: AuditEventType,
  adminId: number | null,
  metadata: AuditMetadata
) => {
  return createAuditLog(
    eventType,
    adminId,
    AuditSeverity.WARNING,
    metadata
  );
};

/**
 * Notify relevant parties about critical security events
 */
async function notifyCriticalEvent(log: any) {
  // TODO: Implement notification system for critical events
  // This could send emails, SMS, or integrate with a monitoring system
  console.warn('Critical security event:', log);
}

/**
 * Clean up old audit logs
 * This should be run periodically (e.g., via a cron job)
 */
export const cleanupOldAuditLogs = async (daysToKeep: number = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  try {
    await prisma.adminAuditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        },
        severity: {
          not: AuditSeverity.CRITICAL // Keep all critical logs
        }
      }
    });
  } catch (error) {
    console.error('Failed to cleanup audit logs:', error);
  }
};
