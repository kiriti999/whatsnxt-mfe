import { notificationAPI } from '../../apis/v1/notifications';

// Handles selecting/deselecting a notification
export const handleClick = (index, setSelected) => {
  setSelected((prev) => {
    if (prev.includes(index)) return prev.filter(item => item !== index);
    return [...prev, index];
  });
};

// Handles deleting selected notifications
export const handleDelete = async (selected, notifications, setNotifications, setTotalUnseen, setSelected) => {
  if (selected.length === 0) return;
  try {
    const ids = selected.map(id => notifications[id]._id); // Extract IDs of selected notifications

    // Update state optimistically
    const remainingNotifications = notifications.filter((_, i) => !selected.includes(i));
    const unseenCount = remainingNotifications.filter(n => !n.seen).length;

    setNotifications(remainingNotifications);
    setTotalUnseen(unseenCount);
    setSelected([]);

    // Call API to delete notifications
    await notificationAPI.delete({ ids });
  } catch (err) {
    console.error('Error in handleDelete:', err);
  }
};

// Handles marking selected notifications as read
export const handleRead = async (selected, notifications, setNotifications, setTotalUnseen, setSelected) => {
  if (selected.length === 0) return;
  try {
    const ids = selected.map(id => notifications[id]._id); // Extract IDs of selected notifications

    // Update state optimistically
    const updatedNotifications = notifications.map((item, index) => {
      if (selected.includes(index)) return { ...item, seen: true };
      return item;
    });
    const unseenCount = updatedNotifications.filter(n => !n.seen).length;

    setNotifications(updatedNotifications);
    setTotalUnseen(unseenCount);
    setSelected([]);

    // Call API to mark notifications as read
    await notificationAPI.read({ ids });
  } catch (err) {
    console.error('Error in handleRead:', err);
  }
};

// Handles selecting/deselecting all notifications
export const handleSelectAll = (selected, notifications, setSelected) => {
  if (!notifications) return;

  if (selected.length === notifications.length) {
    // Deselect all
    setSelected([]);
  } else {
    // Select all
    setSelected(notifications.map((_, i) => i));
  }
};

// Handles refreshing notifications
export const handleRefresh = async (setNotifications, setLoading, setPage, setSelected, fetchNotificationsData, setTotalUnseen) => {
  setLoading(true); // Show loading state
  setNotifications([]); // Clear current notifications
  setSelected([]); // Clear selection
  setPage(1); // Reset to the first page

  try {
    const data = await fetchNotificationsData(1); // Fetch first page of notifications
    setNotifications(data.notifications);
    setTotalUnseen(data.totalUnseen);
  } catch (err) {
    console.error('Error in handleRefresh:', err);
  } finally {
    setLoading(false); // Hide loading state
  }
};
