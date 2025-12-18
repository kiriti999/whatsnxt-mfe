const applySlug = (str) => {
  // Step 1: Decode the string
  const decodedStr = decodeURIComponent(str.toLowerCase());

  // Step 2: Replace special characters (+, :, ., ?, etc.) and spaces with hyphens
  const slug = decodedStr
    .replace(/[\s+]+/g, "-") // Replace spaces and '+' with a single hyphen
    .replace(/[^\w-]+/g, "") // Remove any non-word characters (except hyphens)
    .replace(/\./g, "") // Remove any dots from the string
    .replace(/--+/g, "-") // Replace multiple hyphens with a single one
    .replace(/^-+|-+$/g, "") // Trim hyphens from the start and end
    .replace(/\?+$/, ""); // Remove trailing question marks (?)

  return slug;
};

export { applySlug };
