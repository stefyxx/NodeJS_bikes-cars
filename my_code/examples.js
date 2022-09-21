export function myNamedfunction() { console.log('Hello Word!'); };

function myDefaultFunction() {
  console.log('Halloo for default function');
}

export default myDefaultFunction;

////////////////////////////////////////////
// index.js ->
//import ex, { myNamedfunction } from "./example";
/*
const main = async (app) => {

  //ex(); myNamedfunction();
}
*/
