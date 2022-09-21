/**
 * function for return the date in the correct format FOR THE REQUEST : AAAAMMGG
 * @param {Date} today
 * @returns {String} dateInFunc
 */

 export function dateToYYYYMMDD(today) {
  //let today = new Date();
  let dateMount, dateDay = "";

  if (today.getMonth() < 10) {
    dateMount = "0" + (today.getMonth() + 1);
  } else {
    dateMount = (today.getMonth() + 1).toString();
  }
  if (today.getDate() < 10) {
    dateDay = "0" + today.getDate();
  } else {
    dateDay = today.getDate().toString();
  }

  // TODO: This is a generic helper, it could be used for something else than an API
  // --> dateIn_URL_Request should be named differently
  let dateIn_URL_Request = today.getFullYear().toString() + dateMount + dateDay;
  return dateIn_URL_Request;
};
