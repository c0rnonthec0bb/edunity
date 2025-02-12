export function formatDate(date: Date | { seconds: number, nanoseconds: number }, format?: string) {
  if (!(date instanceof Date)) {
    date = new Date(date.seconds * 1000)
  }
  
  if (format === 'M/D') {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric'
    })
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
