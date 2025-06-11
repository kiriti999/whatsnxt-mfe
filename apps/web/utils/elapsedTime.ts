export const elapsedTime = (date) => {
  if (!date) date = new Date();
  const now = new Date();
  const newDate = new Date(date);
  const diff = now.getTime() - newDate.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) {
    return 'just now';
  } else if (diff < hour) {
    const minutesAgo = Math.round(diff / minute);
    return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  } else if (diff < day) {
    const hoursAgo = Math.round(diff / hour);
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  } else if (diff < week) {
    const daysAgo = Math.round(diff / day);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  } else if (diff < month) {
    const weeksAgo = Math.round(diff / week);
    return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
  } else if (diff < year) {
    const monthsAgo = Math.round(diff / month);
    return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
  } else {
    const yearsAgo = Math.round(diff / year);
    return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
  }
}