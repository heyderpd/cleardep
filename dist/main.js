'use strict';

/*!
 * cleardep
 * Copyright (c) 2016 heyderpd <heyderpd@gmail.com>
 * ISC Licensed
 */

var listInstalledModules = function listInstalledModules() {
  var rawPkt = fs.readFileSync('./package.json', 'utf8');

  var jsonPkt = JSON.parse(rawPkt);
  jsonPkt.dependencies = jsonPkt.dependencies ? jsonPkt.dependencies : {};
  jsonPkt.devDependencies = jsonPkt.devDependencies ? jsonPkt.devDependencies : {};
  jsonPkt.dependenciesRemoveds = jsonPkt.dependenciesRemoveds ? jsonPkt.dependenciesRemoveds : {};
  jsonPkt.devDependenciesRemoveds = jsonPkt.devDependenciesRemoveds ? jsonPkt.devDependenciesRemoveds : {};

  return jsonPkt;
};

var findCalledModules = function findCalledModules() {
  var _data = data;
  var jsonPkt = _data.jsonPkt;
  var extension = _data.extension;
  var path = _data.path;
  var dependencies = jsonPkt.dependencies;


  var notFound = find({
    list: keys(dependencies),
    extension: extension,
    path: path,
    getResumeOf: 'NOT_FOUND',
    pattern: '(?:import[ \\t]*{?[ \\w,.\\[\\]{}]*}?[ \\t]+from[ \\t]+|import[ \\t]+|required\\()"(__LIST__)(?:\\.\\w+)?"\\)?'
  });
  return {
    dependencies: notFound,
    devDependencies: {}
  };
};

var clearAllDependencies = function clearAllDependencies() {
  var _data2 = data;
  var jsonPkt = _data2.jsonPkt;
  var notFound = _data2.notFound;

  var newJsonPkt = copy(jsonPkt);
  var dependencies = newJsonPkt.dependencies;
  var dependenciesRemoveds = newJsonPkt.dependenciesRemoveds;
  var devDependencies = newJsonPkt.devDependencies;
  var devDependenciesRemoveds = newJsonPkt.devDependenciesRemoveds;


  console.log("removed's:");
  each(notFound.dependencies, function (_, module) {
    if (module !== 'cleardep') {
      dependenciesRemoveds[module] = dependencies[module];
      delete dependencies[module];
      console.log('\t' + module);
    }
  });

  newJsonPkt.dependencies = dependencies;
  newJsonPkt.dependenciesRemoveds = dependenciesRemoveds;
  return newJsonPkt;
};

var main = function main(config) {
  // (...args)
  if (config.path === undefined) {
    throw new Error('cleardep: param "path" is undefined');
  }

  data = {};

  data.path = typeof config.path === 'string' ? [config.path] : config.path;

  config.extension = config.extension !== undefined ? config.extension : ['js', 'jsx'];
  data.extension = typeof config.extension === 'string' ? [config.extension] : config.extension;

  data.jsonPkt = listInstalledModules();

  if (data.jsonPkt.dependencies === {}) {
    throw new Error('cleardep: package.json don\'t have dependencies.');
  } else {
    data.notFound = findCalledModules();
    data.newRawPkt = jsonis(clearAllDependencies());
    fs.writeFileSync('./package.json', data.newRawPkt);

    var totalRemoved = data.notFound.dependencies.length; //) + length(data.notFound.devDependencies)
    console.log('cleardep: remove a ' + totalRemoved + ' itens');
  }
};

var data = {};

var _require = require('pytils');

var copy = _require.copy;
var length = _require.length;
var keys = _require.keys;
var each = _require.each;


var fs = require('fs-extra');

var _require2 = require('regex-finder');

var find = _require2.find;

var jsonis = require('jsonis');

module.exports = main;