/**
 * SectionOwnershipError
 * 
 * Custom error class for section ownership violations and transfer failures.
 * Extends the base Exception class following the platform's error handling standards.
 */

import { Exception } from './index';
import { StatusCodes } from 'http-status-codes';

/**
 * Context information for section ownership errors
 */
export interface SectionOwnershipContext {
  sectionId?: string;
  trainerId?: string;
  requiredTrainerId?: string;
  operation?: string;
  transferId?: string;
}

/**
 * Error thrown when a trainer attempts to access or modify a section they don't own,
 * or when ownership transfer operations fail.
 */
export class SectionOwnershipError extends Exception {
  public readonly sectionId?: string;
  public readonly trainerId?: string;
  public readonly requiredTrainerId?: string;
  public readonly operation?: string;

  constructor(
    message: string = 'Section ownership violation',
    context?: SectionOwnershipContext
  ) {
    super(StatusCodes.FORBIDDEN, message, context);
    
    // Store ownership-specific context
    if (context) {
      this.sectionId = context.sectionId;
      this.trainerId = context.trainerId;
      this.requiredTrainerId = context.requiredTrainerId;
      this.operation = context.operation;
    }

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, SectionOwnershipError.prototype);
  }
}

// Common error messages for section ownership
export const SECTION_OWNERSHIP_ERRORS = {
  NOT_OWNER: 'You do not own this section',
  TRANSFER_FAILED: 'Ownership transfer failed',
  TRANSFER_PENDING: 'A transfer is already pending for this section',
  TRANSFER_NOT_FOUND: 'Ownership transfer request not found',
  INVALID_RECIPIENT: 'Invalid transfer recipient',
  CANNOT_TRANSFER_TO_SELF: 'Cannot transfer section to yourself',
  SECTION_NOT_FOUND: 'Section not found',
  UNAUTHORIZED_ACCESS: 'Unauthorized access to section',
} as const;
