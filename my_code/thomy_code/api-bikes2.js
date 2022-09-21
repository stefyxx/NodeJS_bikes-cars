// @ts-ignore
import fetch from "node-fetch";

async function getPoles() {
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=devices';
  return fetch(API_URL).then((response) => response.json()).then((json) => { return json.features; });
}
//List of Actives Poles with your name, addresses and void History
export async function getParsedPoles() {
  const allPoles = await getPoles();
  return allPoles.map((el) => {
    // @ts-ignore
    return {
      name: el.properties.device_name,
      address: {
        nl: el.properties.road_nl,
        fr: el.properties.road_fr,
        en: el.properties.road_en
      },
      history: [],
    }
  });
}

/* live:
json.data = {
"CAT17": {
"hour_cnt": 0,
"day_cnt": 649,
"year_cnt": 206119,
"cnt_time": "2022/06/08 14:02:00"
},
"CB02411": {
"hour_cnt": 1,
"day_cnt": 896,
"year_cnt": 244442,
"cnt_time": "2022/06/08 14:02:00"
},, {...} }
{...}
*/
export async function fetchLiveCounts() {
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=live';
  return await fetch(API_URL).then((response) => response.json()).then((json) => json.data);
}

//json of history
export async function fetchHistory(poleName, startDate, endDate) {
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=history&featureID=' + poleName + '&startDate=' + startDate + '&endDate=' + endDate;
  return fetch(API_URL).then((response) => response.json());
}

/**
 *
 * @param {String} poleName
 * @param {any} startDate //string | number
 * @param {any} endDate   //string | number
 * @param {Boolean} groupByDay
 * @returns
 * returns array, poleHistoryByHour, with history for 1 pole
 * poleHistoryByHour = [{..historyHour..}, {..historyHour..}, ...]
 * historyHour -> {
 *  date: string "AAAAMMDD"
 *  hour: string "nn"
 *  count: Number
 * }
 */
export async function fetchParsedHistory(poleName, startDate, endDate, groupByDay = false) {
  const poleHistory = await fetchHistory(poleName, startDate, endDate);

  // 1. Attach hour & date to each entry
  //  ===============================================================================================
  // The API returns timesGaps and data in separated ways.
  // This allows to attach the hour (taken from the timeGap) to each entry.
  const poleHistoryParsed = poleHistory.data.map((historyItem) => {
    const timeGapForEl = poleHistory.timeGaps.find(timeGap => timeGap[0] === historyItem.time_gap); // TimeGap is an array with : index, startDate, endDate
    const hourForEl = parseInt(timeGapForEl[1].substring(0, 2));
    return {
      date: historyItem.count_date.split("/").join(""), // in YYYYMMDD format
      hour: hourForEl,
      count: historyItem.count,
    }
  });
  //poleHistoryParsed = [{..historyItem..}, {..historyItem..}, ...]
  /*historyItem = {
    date: "YYYYMMDD",
    hour: "nn",      avro' da 0 a 4 volte la stessa ora, bisogna sommare il conto
    count: n
  }*/

  // 2. Merge count by hour: We want to merge count per hour
  //  ===============================================================================================
  let poleHistoryByHour = [];
  poleHistoryParsed.forEach(historyItem => {
    //se esiste il 'find'(ho già l'ora presente in 'poleHistoryByHour' ) allora somma count a el.count
    if (poleHistoryByHour.find(el => historyItem.hour === el.hour && historyItem.date === el.date)) {
      const indexOfHour = poleHistoryByHour.findIndex(el => historyItem.hour === el.hour);
      poleHistoryByHour[indexOfHour].count += historyItem.count;
    }
    else {
      poleHistoryByHour.push(historyItem);
    }
  })

  // 3. Merge count by date
  //  ===============================================================================================
  let poleHistoryByDay = [];
  if (groupByDay) {
    //console.warn("Grouping by day is not yet supported. Stefania has to do it...");
    poleHistoryParsed.forEach(historyItem => {
      let indexOfDay = 0;
      if (poleHistoryByDay.find(el => historyItem.date === el.date)) {
        indexOfDay = poleHistoryByDay.findIndex(el => historyItem.date === el.date);
        poleHistoryByDay[indexOfDay].hour = "one day";
        poleHistoryByDay[indexOfDay].count += historyItem.count;
      }
      else {
        poleHistoryByDay.push(historyItem);
      }
    })
  }
  //different return:
  return (groupByDay ? poleHistoryByDay : poleHistoryByHour);
}