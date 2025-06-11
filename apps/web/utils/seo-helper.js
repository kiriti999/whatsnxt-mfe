export default function removeTags(str) {
  if (!str) {
    return '';
  }

  // Convert input to string if it's not already
  str = str.toString();

  // Use DOMParser to parse the string as HTML and return the text content
  const parser = new DOMParser();
  const parsedString = parser.parseFromString(str, 'text/html');
  return parsedString.body.textContent;
}
