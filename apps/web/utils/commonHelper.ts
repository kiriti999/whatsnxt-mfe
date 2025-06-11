const checkSuccessResponse = (status: number) => {
  return status === 200 || status === 201;
};

export function checkGraphqlResponse(response: any) {
  // Check if there are errors in the response data
  if (response.errors && response.errors.length > 0) {
    throw new Error(response.errors[0].message || 'An error occurred.');
  }

  // Ensure the response contains the expected data
  if (!response.data) {
    throw new Error('Invalid response format.');
  }

  return response.data;
}

export function isWebWorker(): boolean {
  // @ts-ignore
  return typeof Worker !== 'undefined' && typeof importScripts === 'function';
}