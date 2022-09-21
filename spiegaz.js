//funzione per la data nel formato corretto AAAAMMGG
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

/**
 * function to obtain an array of name of devices (poles / burn)
 * @returns {Array} arrayNamePoles
 */

function arrayNameDavices() {
    const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=devices');
    //console.log("request fetching ", fetchPromise);

    async function onSuccess( response) {
    //function onSuccess(response) {
        console.log("response onSuccess ", response);
        const jsonPromise = await response.json();
        /*const jsonPromise = response.json();
        const bho = jsonPromise.then(value =>{
            console.log(value);
        });*/
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
        return arrayNamePoles;
    }

    /*const result = fetchPromise.then(async response => {
        //console.log(`Received response: ${response.status}`);
        console.log("response then ", response);
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

    });*/
    const result = fetchPromise.then(onSuccess);    // return arrayNamePoles;
    //console.log("result then", result);
    return result;
}

async function main() {
    let response =await arrayNameDavices();
    //console.log("response type", typeof (response));
    //onSuccess sarà la mia fuonc di callback
    //const result = response
    console.log('main returing', response);
    return response;     
}
//const corpo = main();
//console.log("result du main",corpo);  // no return -> undefined

/*corpo.then(()=>{
    console.log("FINII");
});*/
console.log("starting");

const risultato = Promise.resolve(2)
.then(x =>{
    console.log("then 1° : x:",x);
    let result = x*2;
    console.log("then 1° : result:",result);
    return result;
})
.then(x=>{
    console.log("then 2° : x:",x);
    let result = x**2;
    console.log("then 2° : result:",result);
    const risultato = Promise.resolve(result);  //anche se ritorno una 'promise'-> il 3° then attende per me e lo trasforma in un valore finito 
    console.log("then 2° :",risultato);
    return risultato;
})
.then(x=>{
    console.log("then 3° : x:",x);      //x sarà un valore finito, MA SOLO ALL'INTERNO DI then
    let result = x**2;
    console.log("then 3° : result:",result);
    return result;
})
.then(()=>{
    const result = fetch('https://stoomlinks.com');
    console.log("then :", result);
    return result;
})
.then(x=>{
    console.log("dernier then: ",x);
    const result = x.text();
    console.log("text :", result);
    return result;
})
.then(text =>{
    const resultFinal= text;
    console.log("dernier",resultFinal);
    return resultFinal;
})
.catch(error =>{            //serve a  non far bloccare il programma, perché catch cattura l'errore
    console.warn(error); 
});

//console.log("alla fine", risultato); //mai possibile



