'use strict';

/*!
 * cleardep
 * Copyright (c) 2016 heyderpd <heyderpd@gmail.com>
 * ISC Licensed
 */

var listInstalledModules = function listInstalledModules() {
  var rawJson = fs.readFileSync('./package.json', 'utf8');

  var Pattern = new RegExp(patternDependencies, "gim");
  var result = null;
  if ((result = Pattern.exec(rawJson)) !== null) {
    return {
      'raw': rawJson,
      'pos': {
        'S': Pattern.lastIndex - result[1].length,
        'E': Pattern.lastIndex
      },
      'dep': JSON.parse(result[1])
    };
  } else {
    return undefined;
  }
};

var findCalledModules = function findCalledModules(installedDeps, extension, path) {
  return find({
    list: installedDeps,
    extension: extension,
    path: path,
    getResumeOf: 'NOT_FOUND',
    pattern: '(?:import[ \\t]*{?[ \\w,.\\[\\]{}]*}?[ \\t]+from[ \\t]+|import[ \\t]+|required\\()"(__LIST__)(?:\\.\\w+)?"\\)?'
  });
};

var clearDependencies = function clearDependencies(packageObj, notUsedModules) {
  console.log("removed's:");
  doEach(notUsedModules, function (module) {
    delete packageObj[module];
    console.log('\t' + module);
  });
  return packageObj;
};

var depStringify = function depStringify(dependencies) {
  var depStr = [];
  doEach(dependencies, function (version, module) {
    depStr.push('    "' + module + '": "' + version + '"');
  });
  return '{\n' + depStr.join(',\n') + '\n  }';
};

var margePackage = function margePackage(packageObj, dependencies) {
  var strDep = depStringify(dependencies);
  var raw = packageObj.raw;
  var pos = packageObj.pos;
  var dep = packageObj.dep;

  console.log(raw.length, pos, dep);
  var first = raw.slice(0, pos.S);
  var second = raw.slice(pos.E, raw.length);
  console.log(first + strDep + second);
  return first + strDep + second;
};

var main = function main(config) {
  if (config.path === undefined) {
    throw new Error('cleardep: param "path" is undefined');
  }
  config.path = typeof config.path === 'string' ? [config.path] : config.path;

  config.extension = config.extension !== undefined ? config.extension : ['js', 'jsx'];
  config.extension = typeof config.extension === 'string' ? [config.extension] : config.extension;

  var packageObj = listInstalledModules();
  if (packageObj === undefined) {
    console.log('cleardep: package.json don\'t have dependencies.');
  } else {
    var notFoundModules = findCalledModules(getKeys(packageObj.dep), config.extension, config.path);
    var newDependencies = clearDependencies(packageObj.dep, notFoundModules);
    var newPackage = margePackage(packageObj, newDependencies);
    fs.writeFileSync('./package.json', newPackage);
    console.log('cleardep: remove a ' + notFoundModules.length + ' itens');
  }
};

var getKeys = function getKeys(obj) {
  return Object.keys(obj);
};
var doEach = function doEach(obj, func) {
  return getKeys(obj).forEach(function (n) {
    return func(obj[n], n);
  });
};

var patternBase = '{[\\w\\W]+"__KEY__"[ \\t]*:[ \\t]*({["\\w-_.:^\\n \\t,]+})';
var patternScripts = patternBase.replace("__KEY__", "scripts");
var patternDependencies = patternBase.replace("__KEY__", "dependencies");

var fs = require('fs-extra');

var _require = require('regex-finder');

var find = _require.find;


module.exports = main;