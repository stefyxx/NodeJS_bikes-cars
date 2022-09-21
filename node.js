/*fetchPromise := obj ritornato da una fuonc asyncrona, é il risultato in quel momento della richiesta
quindi non il risultato finale*/
//const fetchPromise = fetch('url API , response = json');
//fetch := va a prendere
//then := SE riempi questa const, continua con ..   -> ossia se fetch() non ritorna un obj Promise' ( ossia se non riempie la const, es 'Failed to fetch'), non entro proprio nel then

//CASO 1) chiamata all'API che conta le bikes
//const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=live&outputFormat=json');
//CASO 2) esempio mozzilla (https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)
//const fetchPromise = fetch('https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json');

//caso 3) x ottenere la lista dei nomi possibili:
const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=devices');

//console.log("request fetching ", fetchPromise);
//se riesco a recuperare qualcosa == fetchPromise é riempita ->

fetchPromise.then(async response => {
    console.log(`Received response: ${response.status}`);
    //console.log("risposta:"+response);  //object Response: bisogna trasformare la risposta in json per vedere la tab
    /*response.headers.forEach((value,key) => {
        console.log(key + " : " + value);
    });*/

    const jsonPromise = await response.json();
    console.log("json response", jsonPromise); // ha il valore, ma non é ancora un array, infatti console.log(jsonPromise[0]);  questo non ha senso, ma ha senso console.log(jsonPromise[0].name) ->

    //CASO 1) [[PromiseResult]]: Object
    //CASO 2) [[PromiseResult]]: Array(12) -> array di 12 obj (che hanno tra cui key 'name')

    //CASO 2)
    /*jsonPromise.then(jsonArray => {
        for (let i = 0; i < jsonArray.length; i++) {
            //console.log(jsonArray[i]);
            for (const key in jsonArray[i]) {
                //console.log(key + " : " + jsonArray[i][key]);
            }
            //console.log(jsonArray[i].type); 
        }
    });*/
    //console.log(jsonPromise.data);
    /*
    jsonPromise.features.properties ha una serie di obj che hanno property  .device_name ==featureID
    */
    let arrayNamePoles = [];
    for (let i = 0; i < jsonPromise.features.length; i++) {
        //console.log(jsonPromise.features[i].id);
        let stringa = jsonPromise.features[i].id;
        let index = stringa.indexOf('.');
        //console.log('index', index);
        let namePole = stringa.slice(index + 1);
        console.log(namePole);
        arrayNamePoles.push(namePole);
    };
    for (let i = 0; i < arrayNamePoles.length; i++) {
        console.log("array riempito? SI",arrayNamePoles[i]);
  
    };

    console.log(response.arrayNamePoles);//undefined
    //bisogna usare il prototype?? 
    

});

//fetchPromise.then dovrebbe ritornarmi una Promise, infatti é PENDING nonostante il async
/*const fetchPromisee = fetch('https://data.mobility.brussels/bike/api/counts/?request=devices');
let miaPromise = fetchPromisee.then(async response => {
    const jsonPromise = await response.json();
    let arrayNamePoles = [];
    for (let i = 0; i < jsonPromise.features.length; i++) {
        //console.log(jsonPromise.features[i].id);
        let stringa = jsonPromise.features[i].id;
        let index = stringa.indexOf('.');
        //console.log('index', index);
        let namePole = stringa.slice(index + 1);
        console.log(namePole);
        arrayNamePoles.push(namePole);
    };
    //arrayNamePoles si riempie correttamente
});
console.log('promessa mia ', miaPromise);*/

console.log("Started request...");
//live => "CB02411": {"hour_cnt": 171, "day_cnt": 2132, "year_cnt": 191895, "cnt_time": "2022/05/16 17:25:00"},
// APP:  https://data.mobility.brussels/bike/api/counts/
/*
?request=
    devices     -> lista e nomi dei dispositivi
    live        -> bici passate nell'ultima ora, ultimo giorno, ultimo anno
    history     -> conteggio x dispositivo (conto ogni 15 min)
    time_gaps
&outputFormat=
    json -> default
    csv
&featureID=
    -> obbligatorio x history
    "CAT17"
    "CB02411"
    "CB1142"
    "CB1143" 
    "CB1599" 
    "CB1699" 
    "CB2105" 
    "CEE016" 
    "CEK049" 
    "CEK18" 
    "CEK31" 
    "CEV011" 
    "CJE181"
    "CJM90"
        "CKG017" 
    "CLW239"
    "COM205" 
    "CSG301" 
    "CVT387" 
        "SEV011"
        "SJE181"
&startDate='YYYYMMDD' -> dateInfunc
&endDate='YYYYMMDD' -> dateInfunc
*/
//1) data corretta: 'YYYYMMDD' -> dateInfunc
let today = new Date();
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
//console.log('data ', dateInfunc);

//fonction to have an array of name of poles(burn)

function arrayNameDavices() {
    const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=devices');
    console.log("request fetching ", fetchPromise);

    return fetchPromise.then(async response => {
        //console.log(`Received response: ${response.status}`);
        const jsonPromise = await response.json();
        //console.log("json response features: ", jsonPromise.features);
        let arrayNamePoles = [];
        for (let i = 0; i < jsonPromise.features.length; i++) {
            //console.log(jsonPromise.features[i].id);
            let stringa = jsonPromise.features[i].id;
            let index = stringa.indexOf('.');
            //console.log('index', index);
            let namePole = stringa.slice(index + 1);
            //console.log(namePole);
            arrayNamePoles.push(namePole);
        };

    });
}


//costruttore di pole(burn): "CB02411": {"hour_cnt": 171, "day_cnt": 2132, "year_cnt": 191895, "cnt_time": "2022/05/16 17:25:00"},
//last hour, last day, last year

function pole(hour_cnt, day_cnt, year_cnt, cnt_time) {
    this.hour_cnt = hour_cnt;
    this.day_cnt = day_cnt;
    this.year_cnt = year_cnt;
    this.cnt_time = cnt_time;
}

let startDay = new Date(2022, 04, 16, 17, 25, 00);
startDay.getMilliseconds();
console.log('millisecondi', startDay.getTime());

//creare una funzione con parametri: il n° del palo, start et end date nel buon formato
//per ottenere una tab ordinata di tutti i bikes passati

function bikePoleStats(featureID = 'CAT17', startDate = dateInfunc, endDate = dateInfunc) {
    const url = 'https://data.mobility.brussels/bike/api/counts/?request=live&featureID=' + featureID + '&startDate=' + startDate + '&endDate=' + endDate;

    const fetchPromise = fetch(url);

}

function main() {
    let response= arrayNameDavices();
    console.log("risposta in main", response);
}
main();