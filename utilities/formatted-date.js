export function createFormattedDate(millis){
  let date = new Date(millis)
  let [year, month, day] = [date.getFullYear(), date.getMonth() +1, date.getDate()]
  return `${year}-${month}-${day}`;
}