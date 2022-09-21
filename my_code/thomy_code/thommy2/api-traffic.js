// @ts-ignore
import fetch from "node-fetch";

//List of active device (named carDevice) : 66
async function getCarTraverses() {
  const API_URL = "https://data.mobility.brussels/traffic/api/counts/?request=devices";
  //non scirvo return fetch perché poi lo utilizzo con await
  return fetch(API_URL).then(response => response.json()).then(data => { return data.features });
}

//requeste live: non esiste una history pregressa
/*
nameCarDevice : {
  'results':{
    "1m": {
      t1:{"count": 33,   //conto del min passato -> RECUPERARE QUESTO
          "speed": 84.5,
          "occupancy": 17.5,
          "start_time": "2022/06/09 17:25",   // if (start_time === a quello che ho ) -> non serve cambiare count
          "end_time": "2022/06/09 17:26"
      }
      t2:{count}    //conto di 2 min passati
    },
    "5m": {},
    "15m": {},    //sono i possibili step per minuti-> io chiamo solo il primo: '&interval=1'
    "60m": {}
  }
}
*/
export async function fetchLiveCarCounts(){
  const API_URL = "http://data.mobility.brussels/traffic/api/counts/?request=live&interval=1";
  //qui scrivo await perché é il mio risultato finale
  return await fetch(API_URL).then(response => response.json()).then(datas => { return datas.data; });
}
//altra possibilità: recuperare lo step di 1min
//https://data.mobility.brussels/traffic/api/counts/?request=live&featureID=ARL_203&interval=1

//creo la mia lista di CarTraverses
export async function getParsedTraverses() {
  const allCarTraverses = await getCarTraverses();
  return allCarTraverses.map(element => {
    return {
      name: element.properties.traverse_name,
      location: {
        nl: element.properties.descr_nl,
        fr: element.properties.descr_fr,
        en: element.properties.descr_en
      },
      history: [],
    }
  });
}
