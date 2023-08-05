import assert from 'assert';
import get from 'lodash.get';
import axios from 'axios';
import Joi from 'joi-strict';

export default (
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
            Joi.object().pattern(
              Joi.string().regex(/^0|[1-9]\d*$/),
              Joi.number().min(0)
            )
          ));
          Joi.assert(localTags, Joi.array().items(Joi.string()));
          queue.push({
            metric,
            points: Array.isArray(points)
              ? points.map((ts) => [ts / 1, [1]])
              : Object.entries(points).map(([ts, count]) => [ts / 1, [count]]),
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
          const r = await axios({
            method: 'post',
            headers: {
              'Content-type': 'application/json'
            },
            url: 'https://api.datadoghq.com/api/v1/distribution_points',
            params: {
              api_key: apiKey
            },
            data: {
              series: queue.splice(0)
            }
          });
          return get(r, 'data.status') === 'ok';
        }
      };
    })(),
    Logger: (() => ({
      uploadJsonArray: async (arr) => {
        assert(Array.isArray(arr));
        const r = await axios({
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'DD-API-KEY': apiKey
          },
          url: 'https://http-intake.logs.datadoghq.com/v1/input',
          data: JSON.stringify(arr)
        });
        return get(r, 'status') === 200;
      }
    }))()
  };
};
