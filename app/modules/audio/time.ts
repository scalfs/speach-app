export const parseTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds - hours * 3600) / 60)
  seconds = seconds - hours * 3600 - minutes * 60
  return [hours, minutes, seconds]
}

export const formatTime = (hours: number, minutes: number, seconds: number) => {
  hours = Math.round(hours)
  minutes = Math.round(minutes)
  seconds = Math.round(seconds)
  let out = ''
  if (hours !== 0) {
    out += `${hours}:`
  }
  if (minutes < 10 && hours > 0) {
    out += `0${minutes}:`
  } else {
    out += `${minutes}:`
  }
  if (seconds < 10) {
    out += `0${seconds}`
  } else {
    out += `${seconds}`
  }
  return out
}

export const unixToPrettyDate = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp)
  const year = date.getFullYear().toString().slice(-2)
  let month: string | number = date.getMonth() + 1
  let day: string | number = date.getDate()
  let hours: string | number = date.getHours()
  let minutes: string | number = date.getMinutes()

  month = month < 10 ? `0${month}` : month
  day = day < 10 ? `0${day}` : day
  hours = hours < 10 ? `0${hours}` : hours
  minutes = minutes < 10 ? `0${minutes}` : minutes

  return `${day}/${month}/${year}, ${hours}:${minutes}`
}
