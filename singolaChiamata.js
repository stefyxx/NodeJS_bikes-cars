function address(namePole, adressNl, adressFr, adressEn) {
    this.namePole = namePole;
    this.adressNl = adressNl;
    this.adressFr = adressFr;
    this.adressEn = adressEn;
}

function adressesPoleS() {
    const fetchPromise = fetch('https://data.mobility.brussels/bike/api/counts/?request=devices');

    const listsAddresses = fetchPromise.then(async response => {
        const jsonPromise = await response.json();
        console.log(jsonPromise);

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
        .then(arrayListsAddresses => {
            const arrayLists = arrayListsAddresses;
            return arrayLists;
        })
        .catch(error => {
            console.log('No address, possible? :', error);
            return [];
        });

    return listsAddresses;
};

async function main() {
    console.log("Started request...");
    let indirizzi = await adressesPoleS();
    console.log(indirizzi);
};
main();
console.log("starting");