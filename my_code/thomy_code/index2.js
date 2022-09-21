/* eslint-disable no-console */
import { NODE_ENV } from "../../config";
import { moduleName } from "./config";
import { getParsedPoles, fetchLiveCounts, fetchParsedHistory } from "./api";
import { dateInCorrectFormat } from "./helpers";

// =================================================================================================
// CONFIG
// =================================================================================================

// TODO: Read about "NODE_ENV" & Environnement Variables
// --> if it's "development" I want interval to be 10seconds
// --> Otherwise, I want it to be 12 hours
let POLES_LIST_REFRESH_INTERVAL = 10000;
const POLES_COUNT_REFRESH_INTERVAL = 3000;
const POLES_HISTORY_START_DATE = 20211205; //05/12/2021
let POLE_HISTORY_END_DATE = 20211206; // 06/12/2021
//TODO: It should be yesterday in Production, and 20211206 in development (so we only fetch 2 days while developing)
if (NODE_ENV === "development") {
  POLES_LIST_REFRESH_INTERVAL = 10000;
  //minimum possible for APIs = 20181205
  POLE_HISTORY_END_DATE = 20211206;
} else {
  //12h= 43200000   24h =86400000
  POLES_LIST_REFRESH_INTERVAL = 43200000;
  POLE_HISTORY_END_DATE = parseInt(dateInCorrectFormat(new Date())) - 1;
}

// =================================================================================================
// MAIN
// =================================================================================================
const main = async () => {

  // ===============================================================================================
  // Init
  // ===============================================================================================

  // 1. Fetch all Poles with your name, addresses and void History:
  let allPoles = await getParsedPoles();

  // 2. Fetch history for all poles
  allPoles.forEach(async (pole) => {

    // NOTE: We don't await!
    // It means the program will continue executing while we fetch the history for all ours poles
    // This is very good: we can start fetching live counts ASAP, while quietly fetching history
    // for our poles one by one in the "background"

    //...............................................................
    // TODO: Replace this by a Promise.all and see how the behaviour of the program change
    //...............................................................

    // if in parameter there is 'true', you obtain, in the history, the total count of bikes per DAY
    // if in parameter there is 'false', you obtain, in the history, the total count of bikes per HOUR
    fetchParsedHistory(pole.name, POLES_HISTORY_START_DATE, POLE_HISTORY_END_DATE, true)
      .then((history) => {
        // Update History object on existing Pole
        const poleIndex = allPoles.findIndex((el) => el.name === pole.name);
        allPoles[poleIndex].history = history;
      });

  });
  //question = Here?
  //const result = await Promise.all(allPoles);
  //console.log("first pole with await Promise.all : ", result[0]);

  // 3. Log
  console.log("Initialization completed, we have", allPoles.length, "poles");
  console.debug("Here is the first one :", allPoles[0]);

  // ===============================================================================================
  // Recurring Tasks
  // ===============================================================================================

  // 1. Refresh Poles List every N hours
  // ===============================================================================================
  setInterval(async () => {
    // 1. Fetch all Poles
    const newPoles = await getParsedPoles(); //name, addresses and void History

    // 2. Merge new poles we just fetched with existing data
    allPoles = newPoles.map(newEl => {
      //se ho già un pole che si chiama cosi', prendi il vecchio pole e sostituiscilo con il nuovo:
      const previousDataForThisPole = allPoles.find(pastEl => pastEl.name === newEl.name);
      return {
        name: newEl.name,
        address: newEl.address,
        history: (previousDataForThisPole.history) ? previousDataForThisPole.history : [],
      }
    });
    console.log("Poles refreshed. We have", allPoles.length, "poles");
    console.debug("Here is the first one :", allPoles[0]); //storico passato
  }, POLES_LIST_REFRESH_INTERVAL);    //10 sec

  // 2. Refresh live counts every N seconds
  // ===============================================================================================

  setInterval(async () => {
    // 1. Fetch Counts
    const allCounts = await fetchLiveCounts();

    // 2. Associate counts to poles
    // TODO: Maybe we should move this to an helper?

    allPoles = allPoles.map(pole => {
      //recupero obj corrisp a name: {"hour_cnt": n°,"day_cnt": n°,"year_cnt": n°,"cnt_time": "2022/06/08 14:02:00"}
      const count = allCounts[pole.name]
      // se conto esiste -> non c'interessa -> risettalo col nuovo

      // 1. We take all the history for this pole
      // EXCEPT one for the ongoing hour, since we will replace it with fresher data
      //(.hour is a number)
      //
      //console.log("ultim'ora : ", new Date().getHours());
      const poleHistoryWithoutThisHour = pole.history.filter(el => el.hour !== count.cnt_time.split(" ")[1].substring(0, 2));
      //filter: array di matched
      return {
        ...pole,       //TODO: Read about the "spread" operator
        history: [
          ...poleHistoryWithoutThisHour,
          //aggiungo ultima ora
          {
            "date": dateInCorrectFormat(new Date(count.cnt_time)), //TODO: Use the helper function to replace today by the YYYYMMDD string of today
            //"hour": new Date().getHours(), /// NOT CORRENTTT
            "hour": count.cnt_time.split(" ")[1].substring(0, 2),
            "count": count.hour_cnt,  // se conto esiste -> non c'interessa -> risettalo col nuovo
          }
        ]
      }
    });

    //TODO: I want you to log the total of live count on *all* poles here, use reduce
    const totalCount = allPoles.map(pole => pole.history[(pole.history.length) - 1].count).reduce((prec, post) => prec + post);
    console.log("total count ", totalCount);
    //console.log("Count refreshed. TODO total cyclists today.");
    //console.debug("Here is the first one :", allPoles[0]);
  }, POLES_COUNT_REFRESH_INTERVAL);

};

const trafficBikePole = {
  name: moduleName, //TODO: name should come from config. See module "screenshoter" for a good example
  program: main,
};

export default trafficBikePole
