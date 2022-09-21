// @ts-ignore
import fetch from "node-fetch";
import Pole from "./Pole";

// @ts-nocheck
/* eslint-disable no-console */
//=================================================================================================

//good day: 'YYYYMMDD' -> dateIn_URL_Request (?request=history)
/**
 * function for return the date in the correct format FOR THE REQUEST : AAAAMMGG
 * @param {Date} today
 * @returns {String} dateInFunc
 */

export function dateInCorrectFormat(today) {
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

  let dateIn_URL_Request = today.getFullYear().toString() + dateMount + dateDay;
  //console.log('date in url request: ', dateIn_URL_Request);
  return dateIn_URL_Request;
};

// For fetching the values: id, name, three addresses
/**
 *.features -> I can fetch the values: id, name, three addresses
 * @returns
 */
async function getPoles() {
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=devices';
  return fetch(API_URL).then((/** @type {{ json: () => any; }} */ response) => response.json()).then((/** @type {{ features: any; }} */ data) => { return data.features; });
}

//To get [namePole1, namePole2, ...] -> array with the name of poles
/**
 * You have the possibility to see all name of poles actives
 * return [..with name fo poles..]
 * @returns Promise<String[]>
 */
export async function getPolesNames() {
  const allPoles = await getPoles();
  return allPoles.map((/** @type {{ properties: { device_name: any; }; }} */ el) => {
    return el.properties.device_name;
  })
}

//To get a Map later for having 'count' and 'startDate'
/**
 * To get a Map that has into his entries 'count' and 'startDate'
 * @returns Map<string, any>
 * return:
 * string -> name of pole
 * any -> obj ->
 * {"hour_cnt": Number,  -> last hour   -> checked in 'count'
 *  "day_cnt":  Number,  -> last day
 *  "year_cnt": Number,  -> last year
 *  "cnt_time": Date }   -> date of request
 */
async function getCountPoles() {
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=live';
  const result = await fetch(API_URL).then((/** @type {{ json: () => any; }} */ response) => response.json()).then((/** @type {{ data: any; }} */ datas) => datas.data);
  const mapResult = new Map(Object.entries(result));
  //arrayResult.get('CSG301').hour_cnt;
  return mapResult;
}

//To get an array of Poles
/**
 *To get an array of Poles
 * @returns Promise<Pole[]>
 */
export async function getConstructedPoles() {
  //TODO: Fetch poles and return them as constructed objects using Pole constructor
  const allPoles = await getPoles();
  return allPoles.map((/** @type {{ properties: { device_name: any; road_nl: any; road_fr: any; road_en: any; }; }} */ element) => {
    const AVG_speed = 0;
    // @ts-ignore
    return new Pole(element.properties.device_name, element.properties.road_nl, element.properties.road_fr, element.properties.road_en, null, null, null, AVG_speed);
  });
}

//Update count of poles
/**
 * Update count of poles:
 * @param {Pole[]} listPoles
 * @returns Promise<Pole[]>
 */
export async function setCountPoles(listPoles) {
  const allCounts = await getCountPoles();          //Map < namePole, {list count et dateRiquest} >
  return listPoles.map(pole => {
    const setCount = allCounts.get(pole.poleName).hour_cnt;
    pole.startDate = new Date(allCounts.get(pole.poleName).cnt_time);
    pole.endDate = new Date();
    pole.updateCountPole(setCount);

    return pole;
  });
}

/**
 * to get an history for ONE pole
 * @param {string} poleName
 * @param {Date} startDate
 * startDate = new Date(AAAA, MM-1, GG)
 * @param {Date} endDate
 * @returns Promise<any[]>
 *[ {
   count_date: '2022/05/31',
   time_gap: 3,
   count: 3,
   average_speed: 19
  }, {...}, ... ]
 * In the reality the APIs, now, has no history for yesterday.
 */
export async function getHistory(poleName, startDate, endDate) {
  const dateStartString = dateInCorrectFormat(startDate);
  const dateEndString = dateInCorrectFormat(endDate);
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=history&featureID=' + poleName + '&startDate=' + dateStartString + '&endDate=' + dateEndString;
  return fetch(API_URL).then((/** @type {{ json: () => any; }} */ response) => response.json()).then((/** @type {{ data: any; }} */ datas) => { return datas.data });
}

/**
 *To fill for TODAY, with each Pole, the property 'history', array, with obj:
 *history -> array ->
 * [
 *   {
 *    date: 20220501  ->  String
 *    hour: 0 (to 23) ->  Number
 *    count: 39       ->  Number
 *    AVG_hour_speed: 20,34 -> Number: float rounded by two numbers after the decimal point
 *   },
 * {...}, {...}, ... ]
 *
 * @param {Pole[]} poles
 * @param {String} startDateString
 * @param {String} endDateString
 * returns an array, filled history, with a list of poles
 * @returns Promise<Pole[]>
 */
export async function fillHistoryForPolesToday(poles, startDateString, endDateString) {
  return poles.map(pole => {
    let contoNow = pole.count;
    let contoBefore = 0;
    let ora = 0;
    let minuti = 0;
    if (dateInCorrectFormat(pole.startDate) === startDateString && parseInt(dateInCorrectFormat(pole.endDate)) <= parseInt(endDateString) && parseInt(endDateString) <= parseInt(dateInCorrectFormat(new Date()))) {
      minuti = parseInt(pole.startDate.getMinutes().toString());
      // To create one history for hour
      if (minuti === 59) {
        let conto = contoNow - contoBefore;
        contoBefore = conto;
        ora = parseInt(pole.startDate.getHours().toString());
        pole.history.push(Object.assign({}, { date: startDateString, hour: ora, count: conto }));
      }
    }

    return pole;
  });
}

/**
 * To fill, with each Pole, the property 'history', array, with obj:
 *history -> array ->
 * [
 *   {
 *    date: 20220501  ->  String
 *    hour: 0 (to 23) ->  Number
 *    count: 39       ->  Number
 *    AVG_hour_speed: 20,34 -> Number: float rounded by two numbers after the decimal point
 *   },
 * {...}, {...}, ... ]
 * url example:  https://data.mobility.brussels/bike/api/counts/?request=history&featureID=CB2105&startDate=20220523&endDate=20220524
 * NB: to get not empty data, endDate = today - 1
 * but if endDate = new Date(); you WON'T have an error, just an empty of data for yesterday
 * @param {Pole[]} poles
 * @param {Date} startDate
 * @param {Date} endDate
 * startDate = new Date(aaaa, mm - 1, gg); es:17/05/2014 ->new Date(2014, 4, 17)
 * @returns
 * return void, but modified the list 'poles', the first
 */
export async function fillLastHistoryForPoles3(poles, startDate, endDate) {
  for (const pole of poles) {
    const historyPole = await getHistory(pole.poleName, startDate, endDate);
    let oneDay = historyPole[0].count_date;          //"2022/05/29"
    let counter = 0;              // because I can have 'gaps' where no bike has passed, and these gaps are not stored
    let contoBikes = 0;
    let ora = 0;
    let AVGtotal = 0;
    let gap = 0;
    let AVG_hourSpeed = 0;
    for (let i = 0; i < historyPole.length; i++) {
      gap = historyPole[i].time_gap;
      if (oneDay === historyPole[i].count_date) {
        contoBikes = contoBikes + historyPole[i].count;
        if (historyPole[i].average_speed !== -1) counter++;
        if (historyPole[i].average_speed !== -1) { AVGtotal = AVGtotal + historyPole[i].average_speed; }
        //an hour has passed:
        if (gap % 4 === 0) {
          if (contoBikes !== 0) {
            //I create one avg for hour
            AVG_hourSpeed = parseFloat((AVGtotal / counter).toFixed(2));
          }
          //To create one history for every hour:
          pole.history.push(Object.assign({}, { date: oneDay.split("/").join(""), hour: ora, count: contoBikes, AVG_hour_speed: AVG_hourSpeed }));
          ora++;
          contoBikes = 0;
          counter = 0;
          AVGtotal = 0;
        };   //finished 1 hour
      } else {
        //to check the next day:
        oneDay = historyPole[i].count_date;
        ora = 0;
        contoBikes = contoBikes + historyPole[i].count;
        AVGtotal = AVGtotal + historyPole[i].average_speed;
      }
    }
    pole.startDate = startDate;
    pole.endDate = endDate;
  }
  Promise.all(poles);
  //return poles;
}

/**
 * @param {Pole[]} poles
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns Promise<Pole[]>
 */
export async function fillLastHistoryForPoles2(poles, startDate, endDate) {
  const result = poles.map(async pole => {
    const historyPole = await getHistory(pole.poleName, startDate, endDate);
    let oneDay = historyPole[0].count_date;     //"2022/05/29"
    let counter = 0;                            // because I can have 'gaps' where no bike has passed, and these gaps are not stored
    let contoBikes = 0;
    let ora = 0;
    let AVGtotal = 0;
    let gap = 0;
    let AVG_hourSpeed = 0;
    for (let i = 0; i < historyPole.length; i++) {
      gap = historyPole[i].time_gap;
      counter++;
      if (oneDay === historyPole[i].count_date) {
        contoBikes = contoBikes + historyPole[i].count;
        AVGtotal = AVGtotal + historyPole[i].average_speed;
        //an hour has passed:
        if (gap % 4 === 0) {
          if (contoBikes !== 0) {
            //I create one avg for hour
            AVG_hourSpeed = parseFloat((AVGtotal / counter).toFixed(2));
          }
          //To create one history for every hour:
          pole.history.push(Object.assign({}, { date: oneDay.split("/").join(""), hour: ora, count: contoBikes, AVG_hour_speed: AVG_hourSpeed }));
          ora++;
          contoBikes = 0;
          counter = 0;
          AVGtotal = 0;
        };   //finished 1 hour
      } else {
        //to check the next day:
        oneDay = historyPole[i];
        ora = 0;
        contoBikes = contoBikes + historyPole[i].count;
        AVGtotal = AVGtotal + historyPole[i].average_speed;
      }
    }
    pole.startDate = startDate;
    pole.endDate = endDate;
    return pole;
  });
  // result is a list of Promise{pending}, so I await to resolving every Promise
  const resultPromiseAll = await Promise.all(result);
  return resultPromiseAll;
}

//..............................................................
//catch()? qui' non buono perché il loro sistema, se il mio programma si blocca, lo rilancia automaticamente
