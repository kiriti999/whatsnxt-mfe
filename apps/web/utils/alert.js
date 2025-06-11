export const alertMessage = (opts) => {
  opts.response === 'Password reset link has been sent to your email'
    ? showSuccessMessage(opts)
    : showErrorMessage(opts);

  opts.setIsAlert(true);
};

function showErrorMessage(opts) {
  opts.setShowAlertMessage({
    status: 'danger',
    message: opts.response,
  });
}

function showSuccessMessage(opts) {
  opts.setShowAlertMessage({
    status: 'success',
    message: opts.response,
  });
}
