
/*let intervallo = setInterval(myFunc, 2000); //ogni 2 secondi
let contatore = 5;
function myFunc() {
    let ary = [2, 3, 4];
    if (contatore > 0) {
        contatore = contatore - 1;
        console.log("cont ", contatore);
    }
    console.log("cont fuori if ", contatore);

    if (contatore == 0) {
        console.log("BOOOOUUUUUMMMMM!!!!!");
        clearInterval(intervallo);
    }
    console.log("array dentro ", ary.map(el => { return el * 2 }));
    return ary.map(el => { return el * 2 });
}
let aryFuori = myFunc();
console.log("array fuori", aryFuori);
console.log("intervallo", intervallo);*/

///array resta nell'intervallo

let allPoles = [2, 3, 4];
let counter = 5

const intervallo = setInterval( function myFunc() {
    allPoles = allPoles.map(el => {return el*2;});
    if (true){counter -= 1;}
    if (counter === 0) {
        clearInterval(intervallo);
        console.log("BOOMMM!!!");
    }
    console.log("list inside", allPoles);
    console.log("cont",counter);
    //return allPoles;
}, 1000);

console.log("list outside", allPoles);

setInterval(()=>{
console.log("list outside in interval", allPoles);
},6000);
