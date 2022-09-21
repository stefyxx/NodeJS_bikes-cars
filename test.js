//fare un constructor che prende in parameter un obj

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

//let obj = new poleObj({ nome, address, startDate, endDate, countOfNumberOfBikesForPole, average_speed });
function poleObj({ poleName, addressEn, startDate, endDate, count, AVG_speed }) {
    this.poleID = "device.".concat(poleName);   //PAY ATTENTION: TO CONTROL IN DB IF THE 'id' IS AUTO-INCREASED  !!!
    this.poleName = poleName;
    this.addressEn = addressEn;
    this.startDate = startDate;
    this.endDate = endDate;
    this.count = count;
    this.AVG_speed = AVG_speed;
};

let objQuery = {
    "CAT17": {
        "hour_cnt": 61,
        "day_cnt": 779,
        "year_cnt": 174392,
        "cnt_time": "2022/05/20 15:49:00"
    },
    "CB02411": {
        "hour_cnt": 104,
        "day_cnt": 1109,
        "year_cnt": 203616,
        "cnt_time": "2022/05/20 15:49:00"
    },
    "CB1142": {
        "hour_cnt": 65,
        "day_cnt": 1911,
        "year_cnt": 334142,
        "cnt_time": "2022/05/20 15:49:00"
    }
}


//objQuery.data.CAT17.hour_cnt;

/*let arrayQuery = Object.entries(objQuery);
console.log(arrayQuery);*/

let mapQuery = new Map(Object.entries(objQuery));
//console.log(mapQuery);

//console.log(mapQuery.data);
//console.log(mapQuery.get('data'));

