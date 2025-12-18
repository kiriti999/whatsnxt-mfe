import moment from "moment-timezone";

// const getTime = (time) => {
//     let [h, m] = time.split(":");
//     let result = (h % 12 ? h % 12 : 12) + ":" + m + (h >= 12 ? 'PM' : 'AM');
//     return result;
// }

const getTime = (time) => {
  let [h, m] = time.split(":").map(Number); // Ensure h and m are numbers
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12; // Convert to 12-hour format, where 0 or 12 maps to 12
  return `${hour}:${m.toString().padStart(2, "0")}${period}`;
};

const getTimeZone = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return moment.tz(userTimeZone).zoneAbbr();
};

export { getTime, getTimeZone };
