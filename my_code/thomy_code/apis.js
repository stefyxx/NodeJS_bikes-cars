// @ts-ignore
import fetch from "node-fetch";

async function getPoles() {
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=devices';
  return fetch(API_URL).then((response) => response.json()).then((json) => { return json.features; });
}

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

export async function fetchLiveCounts() {
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=live';
  return await fetch(API_URL).then((response) => response.json()).then((json) => json.data);
}

export async function fetchHistory(poleName, startDate, endDate) {
  const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=history&featureID=' + poleName + '&startDate=' + startDate + '&endDate=' + endDate;
  return fetch(API_URL).then((response) => response.json());
}

/**
 *
 * @param {String} poleName
 * @param {String} startDate
 * @param {String} endDate
 * @returns
 * return Promise<poleParsed[]>
 */
export async function fetchParsedHistory(poleName, startDate, endDate) {
  const poleHistory = await fetchHistory(poleName, startDate, endDate);

  // 1. Attach hour & date to each entry
  //  ===============================================================================================
  // The API returns timesGaps and data in separated ways.
  // This allows to attach the hour (taken from the timeGap) to each entry.
  const poleHistoryParsed = poleHistory.data.map((historyItem) => {
    //trova il timegap del tuo HistoryItem e recupera l'ora:
    const timeGapForEl = poleHistory.timeGaps.find(timeGap => timeGap[0] === historyItem.time_gap);
    // TimeGap is an array with : index, startDate, endDate // es the first = [1, "00:00:00", "00:15:00"]
    const hourForEl = parseInt(timeGapForEl[1].substring(0, 2)); // "00"
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

  // 2. Merge count by hour: avro' da 0 a 4 volte la stessa ora, bisogna sommare il conto
  //  ===============================================================================================
  // We want to merge count per hour.
  // - We iterate on each poleHistory item
  // - If it's the first count for the hour, we push it to the array
  // - If we already have a count for this hour in the array, we do an addition to it
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
  //array with history for 1 pole:
  return poleHistoryByHour;
}
