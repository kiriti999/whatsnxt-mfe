// Custom error class to replace NestJS HttpException
class HttpException extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "HttpException";
    this.statusCode = statusCode;
  }
}

// HTTP Status codes
const HttpStatus = {
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

// Export functions and utilities
export { HttpException, HttpStatus };

const formatDate = (date) => {
  console.log(" formatDate :: date:", date);
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

export { formatDate };
