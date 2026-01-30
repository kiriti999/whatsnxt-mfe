/**
 * Section Ownership Transfer API Client
 * 
 * Handles section ownership transfer operations including:
 * - Initiating transfer requests
 * - Accepting/declining transfer requests
 * - Canceling pending transfers
 * - Fetching pending/sent transfer requests
 * 
 * @module apis/v1/sidebar/sectionOwnershipApi
 */

import xior from 'xior';
import type {
  SectionOwnershipTransfer,
  SectionOwnershipTransferWithDetails,
  CreateOwnershipTransferRequest,
} from '@whatsnxt/core-types';

const sidebarApiClient = xior.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444',
  withCredentials: true,
});

/**
 * Initiate a section ownership transfer request
 * @param sectionId - ID of the section to transfer
 * @param payload - Transfer request details (toTrainerId, optional message)
 * @returns Created transfer request
 */
export async function initiateTransfer(
  sectionId: string,
  payload: CreateOwnershipTransferRequest
): Promise<SectionOwnershipTransfer> {
  try {
    const response = await sidebarApiClient.post<{ success: boolean; data: SectionOwnershipTransfer }>(
      `/api/v1/sections/${sectionId}/transfer`,
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error('Failed to initiate transfer:', error);
    throw error;
  }
}

/**
 * Get pending transfer requests for a trainer (requests TO them)
 * @param toTrainerId - ID of the trainer receiving requests
 * @returns List of pending transfer requests with details
 */
export async function getPendingRequests(
  toTrainerId: string
): Promise<SectionOwnershipTransferWithDetails[]> {
  try {
    const response = await sidebarApiClient.get<{
      success: boolean;
      data: SectionOwnershipTransferWithDetails[];
    }>(`/api/v1/section-transfers`, {
      params: { toTrainerId, status: 'pending' },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch pending requests:', error);
    throw error;
  }
}

/**
 * Get sent transfer requests from a trainer (requests FROM them)
 * @param fromTrainerId - ID of the trainer who sent requests
 * @returns List of sent transfer requests with details
 */
export async function getSentRequests(
  fromTrainerId: string
): Promise<SectionOwnershipTransferWithDetails[]> {
  try {
    const response = await sidebarApiClient.get<{
      success: boolean;
      data: SectionOwnershipTransferWithDetails[];
    }>(`/api/v1/section-transfers`, {
      params: { fromTrainerId },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch sent requests:', error);
    throw error;
  }
}

/**
 * Accept a section ownership transfer request
 * @param transferId - ID of the transfer request to accept
 * @returns Updated transfer record with completed status
 */
export async function acceptTransfer(
  transferId: string
): Promise<SectionOwnershipTransfer> {
  try {
    const response = await sidebarApiClient.post<{
      success: boolean;
      data: SectionOwnershipTransfer;
    }>(`/api/v1/section-transfers/${transferId}/accept`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to accept transfer:', error);
    throw error;
  }
}

/**
 * Decline a section ownership transfer request
 * @param transferId - ID of the transfer request to decline
 * @returns Updated transfer record with declined status
 */
export async function declineTransfer(
  transferId: string
): Promise<SectionOwnershipTransfer> {
  try {
    const response = await sidebarApiClient.post<{
      success: boolean;
      data: SectionOwnershipTransfer;
    }>(`/api/v1/section-transfers/${transferId}/decline`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to decline transfer:', error);
    throw error;
  }
}

/**
 * Cancel a pending section ownership transfer request
 * @param transferId - ID of the transfer request to cancel
 * @returns Success confirmation
 */
export async function cancelTransfer(transferId: string): Promise<void> {
  try {
    await sidebarApiClient.delete(`/api/v1/section-transfers/${transferId}`);
  } catch (error) {
    console.error('Failed to cancel transfer:', error);
    throw error;
  }
}

/**
 * Get all transfer requests (both sent and received) for a trainer
 * @param trainerId - ID of the trainer
 * @returns Object with sent and received transfer requests
 */
export async function getAllTransfers(trainerId: string): Promise<{
  sent: SectionOwnershipTransferWithDetails[];
  received: SectionOwnershipTransferWithDetails[];
}> {
  try {
    const [sent, received] = await Promise.all([
      getSentRequests(trainerId),
      getPendingRequests(trainerId),
    ]);
    return { sent, received };
  } catch (error) {
    console.error('Failed to fetch all transfers:', error);
    throw error;
  }
}
