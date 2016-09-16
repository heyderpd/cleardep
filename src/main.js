
/*!
 * cleardep
 * Copyright (c) 2016 heyderpd <heyderpd@gmail.com>
 * ISC Licensed
 */

const listInstalledModules = () => {
  const rawPkt = fs.readFileSync(
                                  './package.json',
                                  'utf8')

  const jsonPkt = JSON.parse(rawPkt)
  jsonPkt.dependencies = jsonPkt.dependencies ? jsonPkt.dependencies : {}
  jsonPkt.devDependencies = jsonPkt.devDependencies ? jsonPkt.devDependencies : {}
  jsonPkt.dependenciesRemoveds = jsonPkt.dependenciesRemoveds ? jsonPkt.dependenciesRemoveds : {}
  jsonPkt.devDependenciesRemoveds = jsonPkt.devDependenciesRemoveds ? jsonPkt.devDependenciesRemoveds : {}

  return jsonPkt
}

const findCalledModules = () => {
  const { jsonPkt, extension, path } = data
  const { dependencies } = jsonPkt

  const notFound = find({
                list: getKeys(dependencies),
                extension: extension,
                path: path,
                getResumeOf: 'NOT_FOUND',
                pattern: '(?:import[ \\t]*{?[ \\w,.\\[\\]{}]*}?[ \\t]+from[ \\t]+|import[ \\t]+|required\\()"(__LIST__)(?:\\.\\w+)?"\\)?'
              })
  return {
      dependencies: notFound,
      devDependencies: {}
    }
}

const clearAllDependencies = () => {
  const { jsonPkt, notFound } = data
  const newJsonPkt = copy(jsonPkt)
  const { dependencies, dependenciesRemoveds, devDependencies, devDependenciesRemoveds } = newJsonPkt

  console.log("removed's:")
  doEach(notFound.dependencies, (_, module) => {
    if (module !== 'cleardep') {
      dependenciesRemoveds[module] = dependencies[module]
      delete dependencies[module]
      console.log(`\t${module}`)
    }
  })

  newJsonPkt.dependencies = dependencies
  newJsonPkt.dependenciesRemoveds = dependenciesRemoveds
  return newJsonPkt
}

const main = (config) => { // (...args)
  if (config.path === undefined) {
    throw new Error('cleardep: param "path" is undefined')
  }

  data = {}

  data.path = typeof(config.path) === 'string' ? [config.path] : config.path

  config.extension = config.extension !== undefined ? config.extension : ['js', 'jsx']
  data.extension = typeof(config.extension) === 'string' ? [config.extension] : config.extension

  data.jsonPkt = listInstalledModules()

  if (data.jsonPkt.dependencies === {}) {
    throw new Error(`cleardep: package.json don\'t have dependencies.`)

  } else {
    data.notFound = findCalledModules()
    data.newRawPkt = jsonis( clearAllDependencies() )
    fs.writeFileSync(
                      './package.json',
                      data.newRawPkt)
    const totalRemoved = length(data.notFound.dependencies) + length(data.notFound.devDependencies)
    console.log(`cleardep: remove a ${totalRemoved} itens`)
  }
}

let data = {}

const copy = obj => Object.assign(obj)
const length = obj => getKeys(obj).length
const getKeys = obj => Object.keys(obj)
const doEach = (obj, func) => getKeys(obj).forEach(n => func(n, obj[n]))

const fs = require('fs-extra')
const { find } = require('regex-finder')
const jsonis = require('jsonis')

module.exports = main
