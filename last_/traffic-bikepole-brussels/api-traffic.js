// @ts-ignore
import fetch from "node-fetch";

//List of active device (named carDevice) : 66
async function getCarTraverses() {
  const API_URL = "https://data.mobility.brussels/traffic/api/counts/?request=devices";
  return fetch(API_URL).then((/** @type {{ json: () => any; }} */ response) => response.json()).then((/** @type {{ features: any; }} */ data) => { return data.features });
}

//requeste live: dont exist the last history per traverse
export async function fetchLiveCarCounts() {
  const API_URL = "http://data.mobility.brussels/traffic/api/counts/?request=live&interval=1";
  return await fetch(API_URL).then((/** @type {{ json: () => any; }} */ response) => response.json()).then((/** @type {{ data: any; }} */ datas) => { return datas.data; });
}

//List of CarTraverses
export async function getParsedTraverses() {
  const allCarTraverses = await getCarTraverses();
  return allCarTraverses.map((/** @type {{ properties: { traverse_name: any; descr_nl: any; descr_fr: any; descr_en: any; }; }} */ element) => {
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
