
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
                list: keys(dependencies),
                extension: extension,
                path: path,
                getResumeOf: 'NOT_FOUND',
                pattern: importPattern
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
  eachVal(notFound.dependencies, module => {
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

const main = (...args) => {
  // console.log('args:', args) //---!!
  data = {}
  data.path = args[0].split(';')

  args[1] = args[1] ? args[1].split('--ext=')[1] : undefined
  args[1] = args[1] ? args[1].split(';') : []
  data.extension = args[1].length ? args[1] : ['js', 'jsx']
  
  if (data.path === undefined) {
    throw new Error('cleardep: param "path" is undefined')
  }
  // console.log('data:', data) //---!!

  data.jsonPkt = listInstalledModules()

  if (data.jsonPkt.dependencies === {}) {
    throw new Error(`cleardep: package.json don\'t have dependencies.`)

  } else {
    data.notFound = findCalledModules()
    data.newRawPkt = jsonis( clearAllDependencies() )
    fs.writeFileSync(
                      './package.json',
                      data.newRawPkt)

    const totalRemoved = data.notFound.dependencies.length //) + length(data.notFound.devDependencies)
    console.log(`cleardep: remove a ${totalRemoved} itens`)
  }
}

const importPattern = '(?:import[ \\t]*{?[ \\w,.\\[\\]{}]*}?[ \\t]+from[ \\t]+|import[ \\t]+|required\\()"(__LIST__)(?:\\.\\w+)?"\\)?'
let data = {}

const { copy, length, keys, eachVal } = require('pytils')
const fs = require('fs-extra')
const { find } = require('regex-finder')
const jsonis = require('jsonis')

module.exports = main
