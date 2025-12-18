const calculateCourseDuration = (videoDurationInSeconds) => {
  const totalMinutes = Math.floor(videoDurationInSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = videoDurationInSeconds % 60;

  const durationText =
    hours > 0
      ? `${hours} hour${hours > 1 ? "s" : ""} ${minutes} min${minutes > 1 ? "s" : ""}`
      : minutes > 0
        ? `${minutes} min${minutes > 1 ? "s" : ""}`
        : `${Math.floor(seconds)} sec${seconds > 1 ? "s" : ""}`;

  return { hours, minutes, seconds, durationText };
};

export default calculateCourseDuration;
