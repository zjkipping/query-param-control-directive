export function decodeValueFromUrl(value: any): any {
  let decoded = decodeURIComponent(value);
  try {
    decoded = JSON.parse(decoded);
  } catch {
    // if the JSON.parse fails just use the value as is (value is probably a string/number)
  }
  return decoded;
}
