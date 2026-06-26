import * as analytics from "../analytics/service.js";

function requestAnalytics(req, res, next) {
  analytics.recordRequest();
  next();
}

export default requestAnalytics;
