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
    pattern: importPattern
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
  eachVal(notFound.dependencies, function (module) {
    if (module !== 'cleardep') {
      var version = dependencies[module];
      dependenciesRemoveds[module] = version;
      delete dependencies[module];
      console.log('\t' + version + ' ' + module);
    }
  });

  newJsonPkt.dependencies = dependencies;
  newJsonPkt.dependenciesRemoveds = dependenciesRemoveds;
  return newJsonPkt;
};

var main = function main() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  data = {};
  data.path = args[0]; //.split(';') TODO multiple dir

  args[1] = args[1] ? args[1].split('--ext=')[1] : undefined;
  args[1] = args[1] ? args[1].split(';') : [];
  data.extension = args[1].length ? args[1] : ['js', 'jsx'];

  if (data.path === undefined) {
    throw new Error('cleardep: param "path" is undefined');
  }

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

var importPattern = '(?:import[ \\t]*{?[ \\w,.\\[\\]{}]*}?[ \\t]+from[ \\t]+|import[ \\t]+|required\\()"(__LIST__)(?:\\.\\w+)?"\\)?';
var data = {};

var _require = require('pytils');

var copy = _require.copy;
var length = _require.length;
var keys = _require.keys;
var eachVal = _require.eachVal;

var fs = require('fs-extra');

var _require2 = require('regex-finder');

var find = _require2.find;

var jsonis = require('jsonis');

module.exports = main;
