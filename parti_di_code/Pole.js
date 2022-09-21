//constructor for a bike-pole (= device) ->          
/*
* id pole = device.namePole -> "device.".concat(namePole)
* name pole -> string             (?request=devices)
* addressEn -> in another request (?request=devices)
* start date -> Date              (?request=live)
* end date -> Date                new Date();
* count -> number                 (?request=live)
* AVG_speed -> number             now = 0   (?request=history)
*/
/*
history: {
  date: AAAAMMGG,
  hour: 0-23
  count: n°,
  AVG_hour_speed: n°,xx
}
*/
/**
 * Constructor for a bike-pole (= device + live + history)
 * @param {String} poleName
 * @param {string} addressNl
 * @param {String} addressFr
 * @param {String} addressEn
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {Number} count
 * @param {Number} AVG_speed
 */
 export function Pole(poleName, addressNl, addressFr, addressEn, startDate, endDate, count, AVG_speed) {
    this.poleID = "device".concat(poleName);  //PAY ATTENTION: TO CONTROL IN DB IF THE 'id' IS AUTO-INCREASED  !!!
    this.poleName = poleName;
    this.addresses = { nl: addressNl, fr: addressFr, en: addressEn };
    this.startDate = startDate;
    this.endDate = endDate;
    this.count = count;
    this.AVG_speed = AVG_speed;
    /**
     * @type {Object[]}
     */
    this.history = [];
    this.updateCountPole = function (/** @type {Number} */ conto) {
      this.count = conto;
    }
  };
  
  