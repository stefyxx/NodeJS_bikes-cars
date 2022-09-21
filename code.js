//funzione per la data nel formato corretto  per la REQUEST : AAAAMMGG
/**
 * function for return the date in the correct format : AAAAMMGG
 * good day: 'YYYYMMDD' -> dateInFunc
 * @param {Date} today
 * @returns {String} dateInFunc
 * 
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

    let dateInfunc = today.getFullYear().toString() + dateMount + dateDay;
    console.log('data ', dateInfunc);

    return dateInfunc;
}

//funzione che mi dona la lista dei nomi delle pôles
/**
 * function to obtain a string with all of name of devices actives (poles / burn)
 * @returns {String} result , that is myArrayString
 */

function arrayNameDavicesActives() {
    const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=devices');

    //callback:
    async function onSuccess(response) {
        //console.log("response onSuccess ", response);
        const jsonPromise = await response.json();
        let arrayNamePoles = [];
        //posso recuperare qui' l'address e inserirlo in un obj invece di un [] ... 
        //il problema é che saranno 2 richieste separate
        for (let i = 0; i < jsonPromise.features.length; i++) {
            //console.log(jsonPromise.features[i].id);
            let stringa = jsonPromise.features[i].id;
            let index = stringa.indexOf('.');
            let namePole = stringa.slice(index + 1);
            //console.log("index ",i," name of pole ",namePole);
            arrayNamePoles.push(namePole);
        };
        return arrayNamePoles;
    }
    const result = fetchPromise
    .then(onSuccess)                        // return arrayNamePoles[];
    .then(x =>{
        //const myArrayString = x.toString();       //my array now is a String
        const myArrayString = x;       //my array now is a String
        return myArrayString;
    })
    .catch(error=>{
        console.warn('Not list of name of poles! ',error);
    });    

    return result;                          //return a string
}

//constructor for a bike-pôle (= device) -> POI CONTROLLA DB
/**
   * @param {String} poleName
   * @param {String} addressEn  //per ora in un'altra richieste: ?request=devices
   * @param {String} startDate  // pay attention (ex: "2022/05/16")
   * @param {String} endDate
   * @param {Number} count
   * @param {Number} AVG_speed
   */
function pole(poleName, addressEn = "", startDate, endDate, count, AVG_speed) {
    this.poleID = "device.".concat(poleName);   //PAY ATTENTION: TO CONTROL IN DB IF THE 'id' IS AUTO-INCREASED  !!!
    this.poleName = poleName;
    this.addressEn = addressEn;
    this.startDate = startDate;
    this.endDate = endDate;
    this.count = count;
    this.AVG_speed = AVG_speed;
};

/*
 result: .feature -> name of pole
        .startDate -> "2022/05/16",
        .endDate -> "2022/05/17",
        .data -> [] ->  {} one obj for one time_gap (15 min), in this obj:
          .count_date -> date in STRING
          .time_gap -> 1 - ...
          .count -> NUMBER          -> 'for' to do the summ
          .average_speed -> number  -> 'for' to do AVG_speed (let counter, sum_AVG = result: sum_AVG/counter)
*/
//function che mi dona una bikePole    ->  POI FARO' la lista di bike-pôleS
function statsOneBikePole(namePole,startDate,endDate){
    const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=history&featureID='+ namePole +'&startDate='+ startDate+ '&endDate='+ endDate);

    const result = fetchPromise.then(async response =>{
        //console.log('status response in 1°then of listPoles: ',response.status);
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
        //console.log('conteggio fuori: ',countOfNumberOfBikesForPole);
        //console.log('speed totale fuori: ', totalSpeed);
        let average_speed = 0; //cosi' elimino la possibilità di avere 0/0
        if(counter !=0)  average_speed = parseFloat((totalSpeed / counter).toFixed(2));
        //console.log('avg:',average_speed);
        
        let address = "";
        //I trasform the date '20220519' into '2022/05/19'
        const startDateString = jsonResponse.startDate.toString();
        const endDateString = jsonResponse.endDate.toString();
        let bikePole = new pole(namePole, address, startDateString, endDateString, countOfNumberOfBikesForPole, average_speed);
        //console.log('Sara\' un pole?: ', bikePole);  //yes

        return bikePole;
    })
    .then(pole =>{
        const onePole = pole;
        return onePole;
    })
    .catch(error=>{
        console.warn('Not bike-pole! ',error);
    });

    return result;
};




async function main() {
    //data x request in console:
    let endDay = dateInCorrectFormat(new Date());
        // RICORDA MM-1 !! -> 04 = maggio
    let startDay= new Date(2022,04,01);
        // trasformo la data nel buon formato
    startDay = dateInCorrectFormat(startDay);
    

    //lista nomi pôles:
    let namePoles = await arrayNameDavicesActives();
    //console.log("response in main type", typeof (namePoles));     //array
    //console.log('response in main', namePoles); 

    //url es: ONLY ONE DEVICE 
    /*ex the request to APIs for device(= bike-pôle) CB02411:  ONLY ONE DEVICE
    * https://data.mobility.brussels/bike/api/counts/?request=history&featureID=CB02411&startDate=20220516&endDate=20220517
    -> result: .data -> [] ->  {} one obj for one time_gap (15 min), in this obj:
                  .count -> NUMBER          -> 'for' to do the summ
                  .average_speed -> number  -> 'for' to do AVG_speed (let counter, sum_AVG = result: sum_AVG/counter)
    */
    
    //un obj  bike-pole di type pole:
    let bikePole = await statsOneBikePole('CB02411',startDay,endDay);
    //bikePole = await stacOneBikePoles('CB02411','20220516','20220517');
    console.log('bike-pole in main: ',bikePole);

    //creare la lista di poles
    let listPoles = [];
    for (let i = 0; i < namePoles.length; i++) {
        let pole = await statsOneBikePole(namePoles[i],startDay,endDay);
        listPoles.push(pole);
    }
    console.log(listPoles);

    //return namePoles;     
}
main();

//const corpo = main();
//console.log("result du main",corpo);  // no return -> undefined

/*corpo.then(()=>{
    console.log("FINII");
});*/
console.log("starting");




