import { foo } from "./two_file";
import { StdError } from "@selfage/nested_error";

let c = 20;
console.log(c + foo());
