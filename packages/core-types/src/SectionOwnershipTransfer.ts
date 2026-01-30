/**
 * SectionOwnershipTransfer Type Definition
 * 
 * Tracks pending and completed section ownership transfer requests between trainers.
 * Only one pending transfer allowed per section at a time.
 */

export type SectionTransferStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface SectionOwnershipTransfer {
  _id: string;              // MongoDB ObjectId
  sectionId: string;        // Reference to Section._id
  fromTrainerId: string;    // Reference to current owner's Trainer._id
  toTrainerId: string;      // Reference to target trainer's Trainer._id
  status: SectionTransferStatus;
  message?: string;         // Optional message from requesting trainer
  requestedAt: string;      // ISO 8601 timestamp
  respondedAt?: string;     // ISO 8601 timestamp (when accepted/declined)
  completedAt?: string;     // ISO 8601 timestamp (when ownership transferred)
}

/**
 * Create ownership transfer request payload
 */
export interface CreateOwnershipTransferRequest {
  sectionId: string;
  toTrainerId: string;
  message?: string;
}

/**
 * Respond to ownership transfer request payload
 */
export interface RespondToOwnershipTransferRequest {
  action: 'accept' | 'decline';
}

/**
 * Ownership transfer with populated details (for UI display)
 */
export interface SectionOwnershipTransferWithDetails extends SectionOwnershipTransfer {
  section: {
    title: string;
    slug: string;
    contentType: 'blog' | 'tutorial';
  };
  fromTrainer: {
    name: string;
    email: string;
  };
  toTrainer: {
    name: string;
    email: string;
  };
}
