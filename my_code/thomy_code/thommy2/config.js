import { NODE_ENV } from "../../config";
import { dateToYYYYMMDD } from "./helpers";

// =================================================================================================
// CONFIG
// =================================================================================================

export const moduleName = "traffic-bikepole-brussels";
export let POLES_LIST_REFRESH_INTERVAL = 10000;
export const POLES_COUNT_REFRESH_INTERVAL = 3000;
export const POLES_HISTORY_START_DATE = 20211205; //05/12/2021
export let POLE_HISTORY_END_DATE = 20211206; // 06/12/2021

//TODO: It should be yesterday in Production, and 20211206 in development (so we only fetch 2 days while developing)
if (NODE_ENV === "development") {
  POLES_LIST_REFRESH_INTERVAL = 10000;
  //minimum possible for APIs = 20181205
  POLE_HISTORY_END_DATE = 20211206;
} else {
  POLES_LIST_REFRESH_INTERVAL = 43200000;
  POLE_HISTORY_END_DATE = parseInt(dateToYYYYMMDD(new Date())) - 1;
}
