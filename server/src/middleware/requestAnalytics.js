import * as analytics from "../analytics/service.js";

function requestAnalytics(req, res, next) {
  analytics.recordRequest(req);
  next();
}

export default requestAnalytics;
