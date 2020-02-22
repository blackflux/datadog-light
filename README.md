# datadog-light

[![Build Status](https://circleci.com/gh/blackflux/datadog-light.png?style=shield)](https://circleci.com/gh/blackflux/datadog-light)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/datadog-light/master.svg)](https://coveralls.io/github/blackflux/datadog-light?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/datadog-light)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/datadog-light/status.svg)](https://david-dm.org/blackflux/datadog-light)
[![NPM](https://img.shields.io/npm/v/datadog-light.svg)](https://www.npmjs.com/package/datadog-light)
[![Downloads](https://img.shields.io/npm/dt/datadog-light.svg)](https://www.npmjs.com/package/datadog-light)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Lightweight SDK to access Datadog API

## Install

Install with [npm](https://www.npmjs.com/):

    $ npm install --save datadog-light

## Usage

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const Datadog = require('datadog-light');

const dd = Datadog('DATADOG_API_KEY');

dd.DistributionMetric.enqueue('metric.name', [new Date() / 1]);
dd.DistributionMetric.flush();
```

## Functions

### Constructor (API_KEY, { tags: Array = [] })

Initialize this sdk with a Datadog api key. Provided tags are sent with all metrics without having to specify them again.

### DistributionMetric

#### enqueue(metric: String, Array[Unix] | Object(Unix: Count), { tags: Array = [] })

Enqueue distribution metric counts

#### flush()

Flush all metric events currently enqueued.

## Why does this package exist?

This package was built to be used in serverless environments where state is hard to come by. Convenient when e.g. tracking certain actions within an AWS Lambda function.
