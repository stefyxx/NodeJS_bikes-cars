/* eslint-disable no-console */

// =================================================================================================
// Main Loop
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
    console.log('date in url request: ', dateIn_URL_Request);
  
    return dateIn_URL_Request;
  };
  
  //constructor for a bike-pôle (= device) ->                    LATER TO CONTROL INTO DB THE EXISTING TABLES !!!!
  /*
  * id pole = device.namePole -> "device.".concat(namePole)
  * name pole -> string
  * addressEn -> in another request (?request=devices)                             TO SOLVE THIS PROBLEM !!!
  * start date -> STRING DIFFERENT TO 'dateIn_URL_Request' (ex: "2022/05/16")   -> TO CREATE A GOOD CONVERTION !!!
  * end date -> STRING DIFFERENT TO 'dateIn_URL_Request' (ex: "2022/05/16")     -> TO CREATE A GOOD CONVERTION !!!
  * count -> number
  * AVG_speed -> number
  */
  /**
   * @param {String} poleName
   * @param {String} addressEn
   * @param {String} startDate  // pay attention (ex: "2022/05/16")
   * @param {String} endDate
   * @param {Number} count
   * @param {Number} AVG_speed
   */
  function pole(poleName, addressEn, startDate, endDate, count, AVG_speed) {
    this.poleID = "device.".concat(poleName);   //PAY ATTENTION: TO CONTROL IN DB IF THE 'id' IS AUTO-INCREASED  !!!
    this.poleName = poleName;
    this.addressEn = addressEn;
    this.startDate = startDate;
    this.endDate = endDate;
    this.count = count;
    this.AVG_speed = AVG_speed;
  };
  
  //function to obtain a STRING with all names of pôles actives
  /**
   * function to obtain a string with all of name of devices actives (pôles)
   * @returns {String} result
   * that is myArrayString
   */
  
  function arrayNameDavicesActives() {
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
        //console.log("index ", i, " name of pôle ", namePole);
        arrayNamePoles.push(namePole);
      };
      return arrayNamePoles;
    }
    const result = fetchPromise
      .then(onSuccess)                        // return arrayNamePoles[];
      .then(x => {
        const myArrayString = x.toString();       //my array now is a String
        return myArrayString;
      })
      .catch(error => {
        console.warn('Not list of name of pôles/devices! ', error);
      });
  
    // @ts-ignore
    return result;                          //return a string
  };
  
  // @ts-ignore
  const main = async (app) => {
  
    // @ts-ignore
    console.log("HELLO , WORLD!");
  
    // Objective : Ingesting bike pole stats into our Database
    //
    // Proposed steps :
    // 1. Having all bike-pôles stats in a nice formatted array of objects at the end of this function
  
    /*ex the request to APIs for device(= bike-pôle) CB02411:  ONLY ONE DEVICE
    * https://data.mobility.brussels/bike/api/counts/?request=history&featureID=CB02411&startDate=20220516&endDate=20220517
    -> result: .feature -> name of pole
              .startDate -> "2022/05/16",
              .endDate -> "2022/05/17",
              .data -> [] ->  {} one obj for one time_gap (15 min), in this obj:
                  .count_date -> date in STRING
                  .time_gap -> 1 - ...
                  .count -> NUMBER          -> 'for' to do the summ
                  .average_speed -> number  -> 'for' to do AVG_speed (let counter, sum_AVG = result: sum_AVG/counter)
    */
    // Objective : Ingesting bike pole stats into our Database
  //
  // Proposed steps :
  // 1. Having all bike-poles stats in a nice formatted array of objects at the end of this function:

  //1.A : good format for the request, for the two date, start and end :    2022, 0o4, 0o1 := 01/05/2022   ->  MM-1
  const endDay = new Date();
  const startDay = new Date(2022, 0o4, 0o1);
  //const endDayString = dateInCorrectFormat(new Date());
  //const startDayString = dateInCorrectFormat(startDay);

  //With this you can see in console the list of ACTIVE devices (poles):
  let arrayListPoles = await arrayNameDevicesActives();

  //1.B : To create an obj bike-pole -> constructor and so on
  //1.C : To push obj bike-pole in list bike-poles (:= a nice formatted array of objects)
  let listPoles = [];
  for (let i = 0; i < arrayListPoles.length; i++) {
    let pole = await statsOneBikePole(arrayListPoles[i], startDay, endDay);  // this is a type pole
    listPoles.push(pole);
  }
  console.log(listPoles);


  /*let pole = await statsOneBikePole(arrayListPoles[1], startDayString, endDay);  // this is a type pole
  console.log('pole in main', pole);*/

  };
  
  const trafficBikePole = {
    name: "traffic-bikepole-brussels", //TODO: name should come from config. See module "screenshoter" for a good example
    program: main,
  };
  
  export default trafficBikePole
  