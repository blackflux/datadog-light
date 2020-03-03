const get = require('lodash.get');
const request = require('request-promise-native');
const Joi = require('joi-strict');


module.exports = (
  apiKey,
  { tags: globalTags = [] } = {}
) => {
  Joi.assert(apiKey, Joi.string().optional());
  Joi.assert(globalTags, Joi.array().items(Joi.string()));

  return {
    DistributionMetric: (() => {
      const queue = [];

      return {
        enqueue: (
          metric,
          points,
          { tags: localTags = [] } = {}
        ) => {
          Joi.assert(apiKey, Joi.string());
          Joi.assert(metric, Joi.string());
          Joi.assert(points, Joi.alternatives(
            Joi.array().items(Joi.number().integer().min(0)),
            Joi.object().pattern(Joi.number().integer().min(0), Joi.number().min(0))
          ));
          Joi.assert(localTags, Joi.array().items(Joi.string()));
          queue.push({
            metric,
            points: Object.entries(
              Array.isArray(points)
                ? points
                  .map((e) => String(e))
                  .reduce((p, ts) => Object.assign(p, { [ts]: (p[ts] || 0) + 1 }), {})
                : points
            ).map(([ts, count]) => [ts / 1, [count]]),
            type: 'distribution',
            tags: [...new Set([
              ...globalTags,
              ...localTags
            ])]
          });
        },
        flush: async () => {
          if (queue.length === 0) {
            return true;
          }
          const r = await request({
            method: 'POST',
            headers: {
              'Content-type': 'application/json'
            },
            uri: 'https://api.datadoghq.com/api/v1/distribution_points',
            qs: {
              api_key: apiKey
            },
            json: true,
            body: {
              series: queue.splice(0)
            }
          });
          return get(r, 'status') === 'ok';
        }
      };
    })()
  };
};
