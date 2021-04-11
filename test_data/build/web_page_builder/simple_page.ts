import { execute } from "./base";
import "./environment";

let res = execute(10, 20) + 30;
if (ENVIRONMENT === "PROD") {
  throw new Error("Prod execute: " + res);
} else {
  throw new Error("Non-prod execute: " + res);
}
