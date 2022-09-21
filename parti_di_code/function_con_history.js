import { Pole } from "./Pole";

//ha un errore
//l'idea é recuperare lo storico dell'altroieri (minimo storico possibile) di UNA POLE

//to get all of actives poles for ONE day, including AVG speed, but the day before yesterday
/**
 *@returns Promise<Pole[]>
 */

export async function theDayBeforeYesterdayAllPoles() {
    const today = new Date();
    const dateStartInt = parseInt(dateInCorrectFormat(today)) - 2;
    const dateEndInt = dateStartInt + 1;
    const dateStartString = dateStartInt.toString();  // opp dateInCorrectFormat(today) -> era x non chiamare 2 volte la funzione
    const dateEndString = dateEndInt.toString();
    const allNamePoles = await getPolesNamesPlusAddresses();          //Promise<Pole[]>

    /**
     * @type {any[]}
     */
    let allPoles = [];
    allNamePoles.map((/** @type {{ poleName: string; startDate: Date; endDate: Date; count: number; AVG_speed: number; }} */ pole) => {
        const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=history&featureID=' + pole.poleName + '&startDate=' + dateStartString + '&endDate=' + dateEndString;

        const response = fetch(API_URL).then((/** @type {{ json: () => void; }} */ response) => { response.json() })
            .then((/** @type {{ data: any; }} */ datas) => { datas.data });

        let countOfNumberOfBikesForPole = 0;
        let counter = 0;
        let totalSpeed = 0;
        let average_speed = 0;

        response.map((/** @type {{ count: number; }} */ gap) => {
            countOfNumberOfBikesForPole += gap.count;
            // @ts-ignore
            totalSpeed += gap.average_speed;
            counter++;
            //never ever 0/0 or n/0
            if (counter !== 0) average_speed = parseFloat((totalSpeed / counter).toFixed(2));

            // @ts-ignore
            pole.startDate = new Date(dateStartString);
            // @ts-ignore
            pole.endDate = new Date(dateEndString);
            // @ts-ignore
            pole.count = countOfNumberOfBikesForPole;
            // @ts-ignore
            pole.AVG_speed = average_speed;
            allPoles.push(pole);
            return allPoles;
        });

        return allPoles;
    });
}

///history -> no error
/**
 * to get an history for ONE pole
 * @param {string} poleName
 * @param {Date} startDate
 * startDate = new Date(AAAA, MM-1, GG)
 * @param {Date} endDate
 * @returns Promise<any[]>
 *[ {
    count_date: '2022/05/31',
    time_gap: 3,
    count: 3,
    average_speed: 19
  }, {...}, ... ]
 */
export async function getHistory(poleName, startDate, endDate) {
    const dateStartString = dateInCorrectFormat(startDate);
    const dateEndString = dateInCorrectFormat(endDate);
    const API_URL = 'https://data.mobility.brussels/bike/api/counts/?request=history&featureID=' + poleName + '&startDate=' + dateStartString + '&endDate=' + dateEndString;
    return fetch(API_URL).then((/** @type {{ json: () => any; }} */ response) => response.json()).then(datas => { return datas.data });
}

/**
 *To fill, with each Pole, the property 'history', array, with obj {date:..., count:...}:
 *history -> array ->
 * [
 *   {
 *    date: 20220501  ->  String
 *    hour: 0 (to 23) ->  Number
 *    count: 39       ->  Number
 *    AVG_hour_speed: 20,34 -> Number: float rounded by two numbers after the decimal point
 *   },
 * {...}, {...}, ... ]
 * @param {Pole[]} poles
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns Promise<Pole[]>
 */
export async function fillLastHistoryForPoles2(poles, startDate, endDate) {
    const result = poles.map(async pole => {
        const historyPole = await getHistory(pole.poleName, startDate, endDate);
        let oneDay = historyPole[0].count_date;     //"2022/05/29"
        let counter = 0;                            // because I can have 'gaps' where no bike has passed, and these gaps are not stored
        let contoBikes = 0;
        let ora = 0;
        let AVGtotal = 0;
        let gap = 0;
        let AVG_hourSpeed = 0;
        for (let i = 0; i < historyPole.length; i++) {
            gap = historyPole[i].time_gap;
            counter++;
            if (oneDay === historyPole[i].count_date) {
                contoBikes = contoBikes + historyPole[i].count;
                AVGtotal = AVGtotal + historyPole[i].average_speed;
                //an hour has passed:
                if (gap % 4 === 0) {
                    if (contoBikes !== 0) {
                        //I create one avg for hour
                        AVG_hourSpeed = parseFloat((AVGtotal / counter).toFixed(2));
                    }
                    //To create one history for every hour:
                    pole.history.push(Object.assign({}, { date: oneDay.split("/").join(""), hour: ora, count: contoBikes, AVG_hour_speed: AVG_hourSpeed }));
                    ora++;
                    contoBikes = 0;
                    counter = 0;
                    AVGtotal = 0;
                };   //finished 1 hour
            } else {
                //to check the next day:
                oneDay = historyPole[i];
                ora = 0;
                contoBikes = contoBikes + historyPole[i].count;
                AVGtotal = AVGtotal + historyPole[i].average_speed;
            }
        }
        pole.startDate = startDate;
        pole.endDate = endDate;
        return pole;
    });
    // result is a list of Promise{pending}, so I await to resolving every Promise
    const resultPromiseAll = await Promise.all(result);
    return resultPromiseAll;
}

/**
 *POSSIBILITY: sostituire il foreach con for OF
 * @param {Pole[]} poles
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns
 */
export async function fillLastHistoryForPoles3(poles, startDate, endDate) {
    for (const pole of poles) {
        const historyPole = await getHistory(pole.poleName, startDate, endDate);
        let oneDay = historyPole[0].count_date;          //"2022/05/29"
        let counter = 0;              // because I can have 'gaps' where no bike has passed, and these gaps are not stored
        let contoBikes = 0;
        let ora = 0;
        let AVGtotal = 0;
        let gap = 0;
        let AVG_hourSpeed = 0;
        for (let i = 0; i < historyPole.length; i++) {
            gap = historyPole[i].time_gap;
            counter++;
            if (oneDay === historyPole[i].count_date) {
                contoBikes = contoBikes + historyPole[i].count;
                if (historyPole[i].average_speed !== -1) { AVGtotal = AVGtotal + historyPole[i].average_speed; }
                //an hour has passed:
                if (gap % 4 === 0) {
                    if (contoBikes !== 0) {
                        //I create one avg for hour
                        AVG_hourSpeed = parseFloat((AVGtotal / counter).toFixed(2));
                    }
                    //To create one history for every hour:
                    pole.history.push(Object.assign({}, { date: oneDay.split("/").join(""), hour: ora, count: contoBikes, AVG_hour_speed: AVG_hourSpeed }));
                    ora++;
                    contoBikes = 0;
                    counter = 0;
                    AVGtotal = 0;
                };   //finished 1 hour
            } else {
                //to check the next day:
                oneDay = historyPole[i];
                ora = 0;
                contoBikes = contoBikes + historyPole[i].count;
                AVGtotal = AVGtotal + historyPole[i].average_speed;
            } //fine if-else
        }     //fine for
        pole.startDate = startDate;
        pole.endDate = endDate;
        //console.log("modifiche in for OF?: ", pole);
    }
    Promise.all(poles);
    //return poles;
}

