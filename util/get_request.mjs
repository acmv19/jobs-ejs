// util/get_request.mjs
import { use } from "chai";
import chaiHttp from "chai-http";

let request = null;

export const get_request = () => {
  if (!request) {
    // Inicializa chai-http solo una vez
    request = use(chaiHttp).request.execute;
  }
  return request;
};
