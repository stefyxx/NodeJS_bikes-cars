/* eslint-disable no-console */
import { moduleName, POLES_LIST_REFRESH_INTERVAL, POLES_COUNT_REFRESH_INTERVAL, POLES_HISTORY_START_DATE, POLE_HISTORY_END_DATE } from "./config";
import { getParsedPoles, fetchLiveCounts, fetchParsedHistory } from "./api-bikes";
import { dateToYYYYMMDD } from "./helpers";
import { fetchLiveCarCounts, getParsedTraverses } from "./api-traffic";

// =================================================================================================
// MAIN
// =================================================================================================
const main = async () => {

  // ===============================================================================================
  // Init
  // ===============================================================================================

  // 1. Fetch all POLES and all TRAVERSES with your name, addresses and void History:
  let allPolesBike = await getParsedPoles();
  let allTraversesCar = await getParsedTraverses()

  // 2. Fetch history for all poles (there isn't for car_APIs the possibility to botain the last history)
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

  // 1. Refresh Poles List and Traverses List every N hours
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
    console.debug("Here is the first one :", allPolesBike[0]);          //past Histories
    console.log("Traverses refreshed. We have", allTraversesCar.length, "traverses");
    console.debug("Here is the first one :", allTraversesCar[0]);
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
      // 1. We take all the history for this pole     EXCEPT one for the ongoing hour, since we will replace it with fresher data
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
      if (count.count === null || count.start_time === '-') {
        //if you want to delete the traverse with void history, because is an inactive traverse
        /*
          const indexFound = allTraversesCar.findIndex(el=> el.name === traverse.name);
          return allTraversesCar.splice(indexFound,1);

        */
        return {
          ...traverse,
        }
      } else {
        const pastHistoryCars = traverse.history.filter(el => el.hour !== parseInt(count.start_time.split(" ")[1].substring(0, 2)));
        return {
          ...traverse,
          history: [
            ...pastHistoryCars,
            {
              "date": count.start_time.split(" ")[0].split("/").join(""),
              "hour": parseInt(count.start_time.split(" ")[1].substring(0, 2)),
              "count": (count.count === null) ? 0 : count.count,
            }
          ]
        }

      }
    })

    // 3. Log the total of live count on *all* poles and *all* traverses
    const totalCountBikesToday = allPolesBike.map(pole => pole.history).flat().filter(history => history.date === dateToYYYYMMDD(new Date())).map(e => e.count).reduce((prec, post) => prec + post);
    const totalCountCarsToday = allTraversesCar.map(traverse => traverse.history).flat().filter(history => history.date === dateToYYYYMMDD(new Date())).map(e => e.count).reduce((prec, post) => prec + post);

    const count = {
      bikes: totalCountBikesToday,
      cars: totalCountCarsToday
    }
    console.log('----------------------------------------------------------------------------');
    console.log("Count Bikes refreshed: " + count.bikes + "  Count Cars refreshed: " + count.cars);
    console.debug("Here is the first one Pole :", allPolesBike[0]);
    console.debug("Here is the first one Traverse :", allTraversesCar[0]);
  }, POLES_COUNT_REFRESH_INTERVAL);

};

const trafficBikePole = {
  name: moduleName,
  program: main,
};

export default trafficBikePole
