/**
 * Section Transfer Notifications Utility
 * Feature: 002-reusable-sections
 * Task: T093
 * 
 * Centralized notification handlers for all section ownership transfer operations.
 * Provides consistent success/error messaging across the application.
 */

import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconAlertCircle, IconTransfer } from '@tabler/icons-react';

/**
 * Show success notification when transfer is initiated
 */
export const notifyTransferInitiated = (sectionTitle: string, toTrainerName?: string) => {
  notifications.show({
    title: 'Transfer Request Sent',
    message: toTrainerName
      ? `Ownership transfer request for "${sectionTitle}" has been sent to ${toTrainerName}`
      : `Ownership transfer request for "${sectionTitle}" has been sent successfully`,
    color: 'green',
    icon: '<IconTransfer size={18} />',
    autoClose: 5000,
  });
};

/**
 * Show error notification when transfer initiation fails
 */
export const notifyTransferInitiationFailed = (
  sectionTitle: string,
  errorMessage?: string
) => {
  notifications.show({
    title: 'Transfer Request Failed',
    message:
      errorMessage ||
      `Failed to initiate transfer for "${sectionTitle}". Please try again.`,
    color: 'red',
    icon: '<IconX size={18} />',
    autoClose: 7000,
  });
};

/**
 * Show success notification when transfer is accepted
 */
export const notifyTransferAccepted = (sectionTitle: string) => {
  notifications.show({
    title: 'Transfer Accepted',
    message: `You are now the owner of "${sectionTitle}". You can now edit and manage this section.`,
    color: 'green',
    icon: '<IconCheck size={18} />',
    autoClose: 5000,
  });
};

/**
 * Show error notification when transfer acceptance fails
 */
export const notifyTransferAcceptanceFailed = (
  sectionTitle: string,
  errorMessage?: string
) => {
  notifications.show({
    title: 'Accept Transfer Failed',
    message:
      errorMessage ||
      `Failed to accept transfer for "${sectionTitle}". Please try again.`,
    color: 'red',
    icon: '<IconX size={18} />',
    autoClose: 7000,
  });
};

/**
 * Show success notification when transfer is declined
 */
export const notifyTransferDeclined = (sectionTitle: string) => {
  notifications.show({
    title: 'Transfer Declined',
    message: `Transfer request for "${sectionTitle}" has been declined.`,
    color: 'orange',
    icon: '<IconAlertCircle size={18} />',
    autoClose: 5000,
  });
};

/**
 * Show error notification when transfer decline fails
 */
export const notifyTransferDeclineFailed = (
  sectionTitle: string,
  errorMessage?: string
) => {
  notifications.show({
    title: 'Decline Transfer Failed',
    message:
      errorMessage ||
      `Failed to decline transfer for "${sectionTitle}". Please try again.`,
    color: 'red',
    icon: `<IconX size={18} />`,
    autoClose: 7000,
  });
};

/**
 * Show success notification when transfer is cancelled
 */
export const notifyTransferCancelled = (sectionTitle: string) => {
  notifications.show({
    title: 'Transfer Cancelled',
    message: `Transfer request for "${sectionTitle}" has been cancelled.`,
    color: 'blue',
    icon: '<IconAlertCircle size={18} />',
    autoClose: 5000,
  });
};

/**
 * Show error notification when transfer cancellation fails
 */
export const notifyTransferCancellationFailed = (
  sectionTitle: string,
  errorMessage?: string
) => {
  notifications.show({
    title: 'Cancel Transfer Failed',
    message:
      errorMessage ||
      `Failed to cancel transfer for "${sectionTitle}". Please try again.`,
    color: 'red',
    icon: '<IconX size={18} />',
    autoClose: 7000,
  });
};

/**
 * Show notification when a new transfer request is received
 */
export const notifyTransferRequestReceived = (
  sectionTitle: string,
  fromTrainerName: string,
  onView?: () => void
) => {
  notifications.show({
    id: `transfer-received-${Date.now()}`,
    title: 'New Transfer Request',
    message: `${fromTrainerName} wants to transfer "${sectionTitle}" to you.`,
    color: 'blue',
    icon: '<IconTransfer size={18} />',
    autoClose: 10000,
    withCloseButton: true,
    onClick: onView,
    style: { cursor: onView ? 'pointer' : 'default' },
  });
};

/**
 * Show warning when attempting to transfer with pending requests
 */
export const notifyPendingTransferExists = (sectionTitle: string) => {
  notifications.show({
    title: 'Pending Transfer Exists',
    message: `A transfer request for "${sectionTitle}" is already pending. Please cancel it before creating a new one.`,
    color: 'yellow',
    icon: '<IconAlertCircle size={18} />',
    autoClose: 7000,
  });
};

/**
 * Show warning when attempting to transfer to self
 */
export const notifyCannotTransferToSelf = () => {
  notifications.show({
    title: 'Invalid Transfer',
    message: 'You cannot transfer ownership to yourself.',
    color: 'yellow',
    icon: '<IconAlertCircle size={18} />',
    autoClose: 5000,
  });
};

/**
 * Show error when user lacks permission to transfer
 */
export const notifyNoTransferPermission = (sectionTitle: string) => {
  notifications.show({
    title: 'Permission Denied',
    message: `You do not have permission to transfer "${sectionTitle}". Only the owner can initiate transfers.`,
    color: 'red',
    icon: '<IconX size={18} />',
    autoClose: 7000,
  });
};

/**
 * Generic error notification for transfer operations
 */
export const notifyTransferError = (
  operation: 'initiate' | 'accept' | 'decline' | 'cancel',
  errorMessage?: string
) => {
  const operationLabels = {
    initiate: 'initiate transfer',
    accept: 'accept transfer',
    decline: 'decline transfer',
    cancel: 'cancel transfer',
  };

  notifications.show({
    title: 'Transfer Operation Failed',
    message:
      errorMessage ||
      `Failed to ${operationLabels[operation]}. Please check your connection and try again.`,
    color: 'red',
    icon: '<IconX size={18} />',
    autoClose: 7000,
  });
};
