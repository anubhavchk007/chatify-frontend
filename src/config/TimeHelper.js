export function formatTime(timestamp) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // handle 0 as 12
  const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${paddedMinutes} ${ampm}`;
}

// Example usage
console.log(formatTime("2023-12-01T14:00:00Z")); // e.g., "7:30 PM" (depends on local time)
