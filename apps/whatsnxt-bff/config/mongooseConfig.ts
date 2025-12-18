// utils/mongooseConfig.js - Single Global Date Formatter Solution
const mongoose = require("mongoose");

// Single date formatter function that works in both JS and TS
const formatDate = (date: any) => {
  if (!date) return date;

  const d = new Date(date);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = d.getDate().toString().padStart(2, "0");
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${day} ${d.getFullYear()}`;
};

// Global schema configuration - applies to ALL schemas automatically
mongoose.set("toJSON", {
  transform: function (doc: any, ret: any) {
    // Format createdAt and updatedAt if they exist
    if (ret.createdAt) {
      ret.createdAt = formatDate(ret.createdAt);
    }
    if (ret.updatedAt) {
      ret.updatedAt = formatDate(ret.updatedAt);
    }

    // Format any other common date fields across all models
    const dateFields = [
      "publishedAt",
      "deletedAt",
      "completedAt",
      "enrolledAt",
      "expiresAt",
      "updatedAt",
    ];
    dateFields.forEach((field) => {
      if (ret[field]) {
        ret[field] = formatDate(ret[field]);
      }
    });

    return ret;
  },
});

module.exports = { formatDate };
