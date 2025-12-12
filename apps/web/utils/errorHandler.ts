// apps/web/utils/errorHandler.ts
import { notifications } from '@mantine/notifications';
import { getLogger } from '@whatsnxt/core-util/logger'; // Assuming a shared logger utility

const logger = getLogger('FrontendErrorHandler'); // Placeholder if shared logger isn't configured yet

interface ClientError extends Error {
  response?: {
    data?: {
      message?: string;
      code?: string;
    };
    status?: number;
  };
  isAxiosError?: boolean;
}

export const handleClientError = (error: ClientError, context: string = 'Application') => {
  let message = 'An unexpected error occurred.';
  let title = 'Error';
  let status = 500;

  // Handle API errors (e.g., from axios)
  if (error.isAxiosError && error.response) {
    status = error.response.status || 500;
    message = error.response.data?.message || error.message;
    title = `API Error (${status})`;
  } else if (error.message) {
    message = error.message;
  }

  logger.error(`[${context}] Frontend error:`, error);

  // Display user-friendly notification
  notifications.show({
    title: title,
    message: message,
    color: 'red',
  });

  // Example of graceful degradation:
  // Depending on the error type, you might:
  // - Redirect the user to an error page
  // - Disable certain UI elements
  // - Provide fallback data
  // - Ask the user to retry
};
