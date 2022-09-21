/* eslint-disable no-console */
import { isNull } from "lodash";
import { moduleName, POLES_LIST_REFRESH_INTERVAL, POLES_COUNT_REFRESH_INTERVAL, POLES_HISTORY_START_DATE, POLE_HISTORY_END_DATE } from "./config";
import { getParsedPoles, fetchLiveCounts, fetchParsedHistory } from "./api-bikes";
import { dateToYYYYMMDD } from "./helpers";
import { fetchLiveCarCounts, getParsedTraverses } from "./api-traffic";

// TODO: 20220609
// - Reduce & Filter
// - Play a bit with Promise.all
// - Change shape of count : {count: {bikes: 0, cars:0}}
// - Fetch data from new API

// =================================================================================================
// MAIN
// =================================================================================================
const main = async () => {

  // ===============================================================================================
  // Init
  // ===============================================================================================

  // 1. Fetch all Poles with your name, addresses and void History:
  let allPolesBike = await getParsedPoles();
  let allTraversesCar = await getParsedTraverses()

  // 2. Fetch history for all poles
  allPolesBike.forEach(async (pole) => {
    // if in parameter there is 'true', you obtain, in the history, the total count of bikes per DAY
    // if in parameter there is 'false', you obtain, in the history, the total count of bikes per HOUR
    fetchParsedHistory(pole.name, POLES_HISTORY_START_DATE, POLE_HISTORY_END_DATE, true)
      .then((history) => {
        // Update History object on existing Pole
        const poleIndex = allPolesBike.findIndex((el) => el.name === pole.name);
        allPolesBike[poleIndex].history = history;
      });
  });

  // 3. Log
  console.log("Initialization completed, we have", allPolesBike.length, " poles");
  console.debug("Here is the first one :", allPolesBike[0]);
  console.log('-----------------------------------------');
  console.log("Initialization completed, we have", allTraversesCar.length, " traverses");
  console.debug("Here is the first one :", allTraversesCar[0]);
  console.log("//////////////////////////////////////////////////////////////////");

  // ===============================================================================================
  // Recurring Tasks
  // ===============================================================================================

  // 1. Refresh Poles List every N hours
  // ===============================================================================================
  setInterval(async () => {
    // 1. Fetch all-Poles/all-Traverses again, to check if there are any new ones :     name, addresses and void History
    const newPoles = await getParsedPoles();
    const newTraverses = await getParsedTraverses();

    // 2. Merge new poles we just fetched with existing data
    allPolesBike = newPoles.map(newEl => {
      //se ho già un pole che si chiama cosi', prendi il vecchio pole e sostituiscilo con il nuovo:
      const previousDataForThisPole = allPolesBike.find(pastEl => pastEl.name === newEl.name);
      return {
        name: newEl.name,
        address: newEl.address,
        history: (previousDataForThisPole.history) ? previousDataForThisPole.history : [],
      }
    });
    // 2. Merge new traverses we just fetched with existing data
    allTraversesCar = newTraverses.map(newEL => {
      const carExist = allTraversesCar.find(pastEl => pastEl.name === newEL.name);
      return {
        name: newEL.name,
        location: newEL.location,
        history: (carExist.history) ? carExist.history : [],
      }
    });
    console.log("Poles refreshed. We have", allPolesBike.length, "poles");
    console.debug("Here is the first one :", allPolesBike[0]);          //storico passato
    console.log("Traverses refreshed. We have", allTraversesCar.length, "traverses");
    console.debug("Here is the first one :", allTraversesCar
    [0]);
  }, POLES_LIST_REFRESH_INTERVAL);

  // 2. Refresh live counts every N seconds
  // ===============================================================================================
  setInterval(async () => {
    // 1. Fetch Counts (live):
    const allCountsBikes = await fetchLiveCounts();
    const allCountCars = await fetchLiveCarCounts();
    // 2. Associate counts to poles
    allPolesBike = allPolesBike.map(pole => {
      const count = allCountsBikes[pole.name]
      // 1. We take all the history for this pole
      // EXCEPT one for the ongoing hour, since we will replace it with fresher data
      //NOTE: new Date().getHours() doesn't really give the current time (UTC + 2 or +1)
      const poleHistoryWithoutThisHour = pole.history.filter(el => el.hour !== parseInt(count.cnt_time.split(" ")[1].substring(0, 2)));

      return {
        ...pole,
        history: [
          ...poleHistoryWithoutThisHour,
          // 2. Add the ongoing hour
          {
            "date": dateToYYYYMMDD(new Date(count.cnt_time)),
            //"hour": new Date().getHours(), /// NOT CORRECT
            "hour": parseInt(count.cnt_time.split(" ")[1].substring(0, 2)),
            "count": count.hour_cnt,
          }
        ]
      }
    });

    // 2. Associate counts to traverses: existe only live history

    allTraversesCar = allTraversesCar.map(traverse => {
      const count = allCountCars[traverse.name].results["1m"].t1;
      //console.log("CONTO? :", count);
      //there isn"t in ?request=devices a key 'active'
      if (count.count === null || count.start_time === '-') {
        return {
          ...traverse,
          history: [
            //come recuperare le history passate?
            //...pastHistoryCars,
          ]
        }

      } else {
        const pastHistoryCars = traverse.history.filter((el) => {
          const hour = parseInt(count.start_time.split(" ")[1].substring(0, 2));
          return el.hour !== parseInt(count.start_time.split(" ")[1].substring(0, 2));
        });
        return {
          ...traverse,
          history: [
            ...pastHistoryCars,
            {
              //start_time: it can be string ('2022/06/10 11:04') or '-'
              "date": (count.start_time === '-') ? dateToYYYYMMDD(new Date()) : count.start_time.split(" ")[0].split("/").join(""),
              "hour": parseInt(count.start_time.split(" ")[1].substring(0, 2)),
              //it can be number or null
              "count": (count.count === null) ? 0 : count.count,
            }
          ]
        }

      }
    })

    //TODO: I want you to log the total of live count on *all* poles here, use reduce
    const totalCountBikesToday = allPolesBike.map(pole => pole.history).flat().filter(history => history.date === dateToYYYYMMDD(new Date())).map(e => e.count).reduce((prec, post) => prec + post); //senza .map -> .reduce((prec,post)=>prec.count+post.count) -> :( !non va
    //const totalCountCarsToday = allTraversesCar.map(traverse => traverse.history).flat().filter(history => history.date === dateToYYYYMMDD(new Date())).map(e => e.count).reduce((prec, post) => prec + post);
    const totalCountCarsToday = "0000";
    const count = {
      bikes: totalCountBikesToday,
      cars: totalCountCarsToday
    }
    console.log('-----------------------------------------');
    console.log("Count Bikes refreshed: " + count.bikes + "  Count Cars refreshed: " + count.cars);
    console.debug("Here is the first one Pole :", allPolesBike[0]);
    console.debug("Here is the first one Traverse :", allTraversesCar[0]);
    console.log("//////////////////////////////////////////////////////////////////");
  }, POLES_COUNT_REFRESH_INTERVAL);
};

const trafficBikePole = {
  name: moduleName, //TODO: name should come from config. See module "screenshoter" for a good example
  program: main,
};

export default trafficBikePole
