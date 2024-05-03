export function getTodaysDate() {
  const date = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  const day = days[date.getDay()]
  const month = months[date.getMonth()]

  const dateOfMonth = date.getDate()
  let suffix = 'th'
  if (dateOfMonth === 1 || dateOfMonth === 21 || dateOfMonth === 31) {
    suffix = 'st'
  } else if (dateOfMonth === 2 || dateOfMonth === 22) {
    suffix = 'nd'
  } else if (dateOfMonth === 3 || dateOfMonth === 23) {
    suffix = 'rd'
  }

  return `${day}, ${dateOfMonth}<sup>${suffix}</sup> ${month}`
}
