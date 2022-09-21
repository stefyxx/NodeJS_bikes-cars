///////////////////////////////////////////////////////////////////////////////////////////

**Bike counts api**
URL := https://data.mobility.brussels/bike/api/counts/

**Traffic counts api**
URL: https://data.mobility.brussels/traffic/api/counts/

//////////////////////////////////////////////////////////////////////////////////////////

  **TO CREATE A LIST OF POLES : to store the bike count**

.........................................................................

To create **ONE pole**:

problem : 

    to fetch the addresses of ONE pole, we use a request to the APIs (?request=devices)

    to fetch the last history of ONE pole, we use a request to the APIs (?request=history...)

    to fetch the live data 'count bikes', we use another request (?request=live)

Solved problem:

    to fetch the addresses of ONE pole -> to use the function getPoles() in ./api-bikes.js

    to fetch the last history of ONE pole -> to use the function fetchHistory() in ./api-bikes.js

    to fetch the history of today for ONE pole -> to use the function fetchLiveCounts() in ./api-bikes.js

.........................................................................

There are three functions in _./api-bikes.js_ :for obtaining an array with a list of poles:

- first function **getParsedPoles** : that returns a list of poles with your

    name

    adresses      in three languages: nl (Dutch), fr(French) and en (English)

    history       an array void

- second function **fetchParsedHistory** : which allows you to fill in the 'history' of a pole starting from a start date, up to an end date. It fills my array 'history' with objects that have:

    date          in AAAAMMGG

    hour          0 to 23 

    count         count of bikes passed in that hour

In the reality the APIs, now, has no history for yesterday. For this reason, in Prod, end date is equal the day before yesterday. 

- third function **fetchLiveCounts** : which allows to return data_json from which to extrapolate, in _./index.js_, the 'live' count of bikes

NOTE:

  - In APIs id_Pole is equal 'device. + poleName'

  - The APIs for certain requests wants the dates written in the format YYYYMMDD, in this regard there is the function **dateToYYYYMMDD(day)** in _./helpers.js_ which converts a date, type Date, into a string **YYYYMMDD**

    .

//////////////////////////////////////////////////////////////////////////////////////////

  **TO CREATE A LIST OF TRAVERSES : to store the cars count**

.........................................................................

There are two functions in _./api-traffic.js_ :for obtaining an array with a list of traverses:

- first function **getParsedTraverses** : that returns a list of traverses with your

    name

    location      because there isn't an address, but a LOCATION. It is in three languages: nl (Dutch), fr(French) and en (English)

    history       an array void

- second function **fetchLiveCarCounts** : which allows to return data_json from which to extrapolate, in _./index.js_, the 'live' count of bikes

NOTE:

  - In APIs there isn't last history.
  
//////////////////////////////////////////////////////////////////////////////////////////
