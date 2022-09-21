import { init } from "echarts";
import { result } from "lodash";

function sleep(ms) {
  console.log("init sleep", ms);
  return new Promise((resolve, reject) => {
    setTimeout((ms) => {
      resolve(ms);
      console.log("resolve in function", ms);
    }, ms, ms);
  })
}

function sleepAndFaile(ms) {
  console.log("init sleepAndFaile", ms);
  return new Promise((resolve, reject) => {
    setTimeout((ms) => {
      reject(new Error(ms));
      console.log("reject in function", ms);
    }, ms, ms);
  })
}
function faileImmediately() {
  throw new Error("faile immediately");
}


async function main() {

  console.log("new main");

  //const a = Promise.all([faileImmediately(), sleep(100), sleep(800), sleep(200), sleepAndFaile(1000)])
  /*.catch(err=>{
    console.log("error:",err);
    return "errore preso";
});*/

  //const c = await Promise.allSettled([sleep(100), sleepAndFaile(200)]);
  //console.log("all result of a: ", a);
  try {

    const b = Promise.allSettled([sleep(300),sleep(100), sleepAndFaile(300), await faileImmediately()])
    .catch(err => {
      console.log("error:", err);
      return "errore preso";});

    console.log("race result of b: ", b);
    const d = await b;
    console.log("race result of D: ", d);
  } catch (error) {
    console.log("error catturato in modo sincrono ",error);
  }


}
export default main;
