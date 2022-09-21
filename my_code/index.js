import { getConstructedPoles, setCountPoles, fillHistoryForPolesToday, dateInCorrectFormat, fillLastHistoryForPoles2, fillLastHistoryForPoles3 } from "./functions";
import Pole from "./Pole";
// @ts-nocheck
/* eslint-disable no-console */

// =================================================================================================
// Main Loop
// =================================================================================================


// NEW TODO 20220527
// - Clean and remove useless function          OK
// - Change the shape of pole address
//    - Before:
//          Pole {                        getConstructedPoles()
//            adddress_fr: ...
//           adddress_en: ...
//           adddress_nl: ...
//        }
//    - After:                                   OK
//          Pole {
//            adddress: {
//              fr: ...
//              en: ...
//              nl: ...
//            }
//          }
//
// - Add a new function : fillHistoryForPoles(poles)
//    - Takes 3 arguments :
//          - poles : A list of constructed poles
//          - startDate : A YYYYMMDD string
//          - endDate : A YYYYMMDD string
//    - Returns a list of poles with filled history         -> pole.history = [];
//            pole {
//              name : string
//             address_fr
//             address_en
//             ...
//             history : [
//               {
//                date: 20220501
//                hour: 0 (to 23)
//                count: 39
//              },
//              {
//                date: 20220501
//                hour: 1
//                count: 39
//              },
//            ]
//            }

// Draft of Database Schema
// -------------------------------------------------------------------------------------------------
// date | hour | count | deviceId
//
// 20220527 | 1 | 33 | CSG301
// 20220527 | 2 | 33 | CSG301
// 20220527 | 23 | 33 | CSG301
// 20220528 | 1 | 1 | CSG301

//todo:
//  - Have both history for previous days and today in the same history object
// - Make PR ready (green, all test passed)

// @ts-ignore
const main = async (app) => {

  // Objective : Ingesting bike pole stats into our Database

  /**
   * List of poles refreshed every 10 seconds: for an updated list of poles
   * filled with the first setInterval
   * @type {Pole[]}
   */
  let allPoles = [];

  /**
   * List of poles used to fill each pole's history for TODAY ONLY
   * in this list I increase only the count every 5 seconds
   * filled with the second setInterval
   * @type {Pole[]}
   */
  let polesForTodayHistory = await getConstructedPoles();

  /**
   * List of poles having a day-history for each pole
   * @type {Pole[]}
   */
  let historyToday = [];


  // First setInterval: to fetch *constructed* poles every 10s
  setInterval(async function myFunc() {
    allPoles = await getConstructedPoles();
    //console.log("[INFO]", "Pole refreshed, we now have:", allPoles.length, "poles");
  }, 10000);


  // Second setInterval: to fetch updated counts every 5sec.
  setInterval(async function myFunc() {
    allPoles = await setCountPoles(allPoles);
    const totalCount = allPoles.reduce((/** @type {Number} */ acc, /** @type {{ count: Number; }} */ pole) => acc + pole.count, 0);
    //console.log("[INFO]", "Pole counters refreshed. Total count for the ongoing hour:", totalCount);

    //List of poles for today history, including the possibility to add a new pole in real time:
    polesForTodayHistory = await setCountPoles(polesForTodayHistory);
    //finding if there are new poles: 'notInCommon' is a list of poles not in 'polesForTodayHistory', but in 'allPoles'
    let notInCommon = allPoles.filter(pole => {
      if (!polesForTodayHistory.map(poleEL => { return poleEL.poleName }).includes(pole.poleName)) return pole;
    });
    //b)if there is a match, push the new poles in 'polesForToday History' without erasing the poles and their latest history:
    if (notInCommon.length > 0) {
      notInCommon.map(pole => { polesForTodayHistory.push(pole); return pole });
      // c) after .sort(), to put them in correct order
      polesForTodayHistory = polesForTodayHistory.sort();
    }
  }, 5000);

  // Third setInterval: to fill, with each Pole, the property 'history'for the CURRENT day,    --> one history for hour
  setInterval(async function myFunc() {
    historyToday = await fillHistoryForPolesToday(polesForTodayHistory, dateInCorrectFormat(new Date()), dateInCorrectFormat(new Date()));
    //console.log("History today: one history for every hour ", historyToday[0]);
    let NEWpolesWithHistory = await fillLastHistoryForPoles2(polesForTodayHistory, new Date(2022, 4, 31), new Date());
  }, 3600000);

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // 5.To fill, with each Pole, the property 'history', starting from a start date to an end date
  //in this case use a different request to the APIs for each Pole

  /*method with FOR - OF:
  with this method you don't create another obj, returns is 'void', but you modify the array given in parameter
  */
  let NEWpolesWithHistory = await fillLastHistoryForPoles3(polesForTodayHistory, new Date(2022, 4, 31), new Date());
  console.log("FIRST pole with its history from 30/05/2022 to yesterday with the For-OF method: ", polesForTodayHistory[0]);

  /*method with .map():
  with this method you returns an array of poles with history for day et for hour:
  */
  //let NEWpolesWithHistory2 = await fillLastHistoryForPoles2(polesForTodayHistory, new Date(2022, 4, 30), new Date());
  //console.log("FIRST pole with its history from 30/05/2022 to yesterday with the .map() method: ", NEWpolesWithHistory2[0]);

};

const trafficBikePole = {
  name: "traffic-bikepole-brussels", //TODO: name should come from config. See module "screenshoter" for a good example
  program: main,
  //program: promise,
};

export default trafficBikePole
