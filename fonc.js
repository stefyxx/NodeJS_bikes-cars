import { response } from "express";
import fetch from "node-fetch";
import { pole } from "./constructors";
import { address } from "./constructors";

// =================================================================================================

//good day: 'YYYYMMDD' -> dateIn_URL_Request
/**
 * function for return the date in the correct format FOR THE REQUEST : AAAAMMGG
 * @param {Date} today
 * @returns {String} dateInFunc
 */

function dateInCorrectFormat(today) {
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

//function to obtain a Array with all names of pôles actives
/**
 * function to obtain an array with all of name of devices actives (pôles)
 * that is myArrayPoles
 *@returns {Promise<any[]>} result
 */

export function arrayNameDevicesActives() {
  const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=devices');

  //callback:
  /**
   * @param {{ json: () => any; }} response
   */
  async function onSuccess(response) {
    //console.log("response onSuccess ", response);
    const jsonPromise = await response.json();
    let arrayNamePoles = [];
    for (let i = 0; i < jsonPromise.features.length; i++) {
      //console.log(jsonPromise.features[i].id);
      let stringa = jsonPromise.features[i].id;
      let index = stringa.indexOf('.');
      let namePole = stringa.slice(index + 1);
      //console.log("index ", i, " name of pole ", namePole);
      arrayNamePoles.push(namePole);
    };
    return arrayNamePoles;
  }
  const result = fetchPromise
    .then(onSuccess)                        // return arrayNamePoles[];
    .then((/** @type {any} */ x) => {
      //const myArrayPoles = x.toString();       //my array now is a String
      const myArrayPoles = x;                    //my array
      return myArrayPoles;
    })
    .catch((/** @type {any} */ error) => {
      console.warn('Not list of name of poles/devices! ', error);
      return [];
    });

  return result;
};

//function to obtain a list of obj; one object contain 4 properties: name, address en Nl, address en Fr, address en En
/**
 * function to obtain a list of objcts 'address';
 * one object contain 4 properties:
 * name, address en Nl, address en Fr, address en En
 * @returns Promise<any> listsAddresses
 */
function adressesPoleS() {
  const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=devices');

  const listsAddresses = fetchPromise.then(async response => {

    const jsonPromise = await response.json();

    let addressEN = "";
    let addressFr = "";
    let addressNl = "";
    let namePole = "";
    let listAddresses = [];
    for (let i = 0; i < jsonPromise.features.length; i++) {
      addressNl = jsonPromise.features[i].properties.road_nl;
      addressFr = jsonPromise.features[i].properties.road_fr;
      addressEN = jsonPromise.features[i].properties.road_en;
      namePole = jsonPromise.features[i].properties.device_name;
      const addressesPole = new address(namePole, addressNl, addressFr, addressEN);
      listAddresses.push(addressesPole);
    }
    return listAddresses;   // array with obj 'address'
  })
    .then((/** @type {any} */ arrayListsAddresses) => {
      const arrayLists = arrayListsAddresses;
      return arrayLists;
    })
    .catch((/** @type {any} */ error) => {
      //console.log('No address, possible? :', error);
      return [];
    });

  return listsAddresses;
};

//function to obtain ONE obj pole with all stats for a range of dates:
/**
 * @param {string} namePole
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<void | pole>} bikePole
 */
function statsOneBikePole(namePole, startDate, endDate) {
  const starDateGoodFormat = dateInCorrectFormat(startDate);
  const endDateGoodFormat = dateInCorrectFormat(endDate);
  const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=history&featureID=' + namePole + '&startDate=' + starDateGoodFormat + '&endDate=' + endDateGoodFormat);

  const bikePole = fetchPromise.then(async (/** @type {{ json: () => any; }} */ response) => {
    //console.log('status response in 1°then of listPoles: ', response.status);
    const jsonResponse = await response.json();
    //console.log('JSON response in 1°then of listPoles:', jsonResponse);
    let countOfNumberOfBikesForPole = 0;
    let counter = 0;
    let totalSpeed = 0;
    for (let i = 0; i < jsonResponse.data.length; i++) {
      counter++;
      countOfNumberOfBikesForPole += jsonResponse.data[i].count;
      totalSpeed += jsonResponse.data[i].average_speed;
    }
    let average_speed = 0;                //never ever 0/0 or n/0
    if (counter !== 0) average_speed = parseFloat((totalSpeed / counter).toFixed(2));

    //const poleName = jsonResponse.feature;
    const listsPolesAndYoursAddresses = await adressesPoleS();
    let addressEN = "";
    let addressFR = "";
    let addressNL = "";
    for (let j = 0; j < listsPolesAndYoursAddresses.length; j++) {
      if (namePole === listsPolesAndYoursAddresses[j].namePole) {
        addressNL = listsPolesAndYoursAddresses[j].adressNl;
        addressFR = listsPolesAndYoursAddresses[j].adressFr;
        addressNL = listsPolesAndYoursAddresses[j].adressEn;
      }
    }
    //I transform the date '20220519' into '2022/05/19'
    /*const startDateString = jsonResponse.startDate.toString();
    const endDateString = jsonResponse.endDate.toString();*/
    const bikePole = new pole(namePole, addressNL, addressFR, addressEN, startDate, endDate, countOfNumberOfBikesForPole, average_speed);
    //console.log('That\'s a pole ?: ', bikePole);  //yes

    return bikePole;
  })
    .then((/** @type {any} */ pole) => {
      const onePole = pole;
      return onePole;                     //now I have my obj of type pole
    })
    .catch((/** @type {any} */ error) => {
      console.warn('Not bike-pole! ', error);
    });

  return bikePole;
};

// function to obtain A LIST of poles into a range of dates
/**
 * function to obtain A LIST of poles into a range of dates
 * return [{...}, {...}, ...]
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<(void | pole)[]>} listOfPoles
 */
export async function listPoles(startDate, endDate) {
  let listOfPoles = [];
  let arrayListPoles = await arrayNameDevicesActives();
  for (let i = 0; i < arrayListPoles.length; i++) {
    let pole = await statsOneBikePole(arrayListPoles[i], startDate, endDate);
    listOfPoles.push(pole);
  }
  return listOfPoles;
}

//function to get stats for one pole  into range of dates (APIs -> live)
/**
 * https://data.mobility.brussels/bike/api/counts/?request=live&featureID=CB2105
 * @param {Function} arrayNameDevicesActives
 */
async function statsPoles(arrayNameDevicesActives) {
  const arrayNamePoles = await arrayNameDevicesActives();
  for (let i = 0; i < arrayNamePoles.length; i++) {
    const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=live&featureID=' + namePole);

    const result = fetchPromise.then( async response =>{
      const jsonPromise = await response.json();

    })


  }

}
