///////////////////////////////////////////////////////////////////////////////////////////

APIs := https://data.mobility.brussels/bike/api/counts/

//////////////////////////////////////////////////////////////////////////////////////////

You have the possibility to see all name of poles actives

with the func getPolesNames() in ./functions.js

that returns un array.

For creating the 'url' into fetch() the dates are in a particular format, AAAMMGG,

so we have a func dateInCorrectFormat(Date today) in ./functions.js

that converts a date, type Date, into a string;

the return is a string

To create ONE pole:

problem : to fetch the addresses of ONE pole,I use a request to the APIs (?request=devices)

to fetch the data 'count bikes' and 'startDate',I use another request (?request=live)

to fetch the data 'avg speed',I use another request -> NOT IMPLEMENTED (?request=history)

so I create an constructor for obtaining an object with type 'Pole' that has these properties:

the Constructor for a bike-pole is Pole(...) in ./constructors.js

ONE POLE :  id pole,                  -> poleID   (string:= device. + poleName) -> es : device.CAT17

name pole,                -> poleName   (string)

address pole en Dutch,    -> addressNl  (string)

address pole en French    -> addressFr  (string)

address pole en English   -> addressEn  (string)

date start for stats      -> startDate  (Date)

date end for stats        -> endDate    (Date)

total count of bikes in

the range to give        -> count      (number)

average speed, rounded to

2 decimal                -> AVG\_speed  (number)

NOTE: in APIs id pole is device. + poleName, so I thought I'd keep the same value!

Solved problem:

to fetch the addresses of ONE pole -> to use the function getPolesNamesPlusAddresses() in ./functions.js

to fetch the data 'count' and 'startDate' -> to use the function getCountPoles() in ./functions.js

to fetch the data 'avg speed' -> NOT IMPLEMENTED

If you want a list (es: [{...pole1..}, {...},{...}, ...])

that has every active pole with its stats, you call getConstructedPoles() in ./functions

///////////////////////////////////////////////////////////////
