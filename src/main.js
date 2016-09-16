
/*!
 * cleardep
 * Copyright (c) 2016 heyderpd <heyderpd@gmail.com>
 * ISC Licensed
 */

const listInstalledModules = () => {
  const rawJson = fs.readFileSync(
                                  './package.json',
                                  'utf8')

  const Pattern = new RegExp(patternDependencies, "gim")
  let result = null
  if ((result = Pattern.exec(rawJson)) !== null) {
    return {
      'raw': rawJson,
      'pos': {
        'S': Pattern.lastIndex -result[1].length,
        'E': Pattern.lastIndex
      },
      'dep': JSON.parse(result[1])
    }
  } else {
    return undefined
  }
}

const findCalledModules = (installedDeps, extension, path) => {
  return find({
                list: installedDeps,
                extension: extension,
                path: path,
                getResumeOf: 'NOT_FOUND',
                pattern: '(?:import[ \\t]*{?[ \\w,.\\[\\]{}]*}?[ \\t]+from[ \\t]+|import[ \\t]+|required\\()"(__LIST__)(?:\\.\\w+)?"\\)?'
              })
}

const clearDependencies = (packageObj, notUsedModules) => {
  console.log("removed's:")
  doEach(notUsedModules, module => {
    delete packageObj[module]
    console.log(`\t${module}`)
  })
  return packageObj
}

const depStringify = (dependencies) => {
  let depStr = []
  doEach(dependencies, (version, module) => {
    depStr.push(`    "${module}": "${version}"`)
  })
  return `{\n${depStr.join(',\n')}\n  }`
}

const margePackage = (packageObj, dependencies) => {
  const strDep = depStringify(dependencies)
  const { raw, pos, dep } = packageObj
  console.log(raw.length, pos, dep)
  const first  = raw.slice(0, pos.S)
  const second = raw.slice(pos.E, raw.length)
  console.log( first + strDep + second )
  return first + strDep + second
}

const main = (config) => {
  if (config.path === undefined) {
    throw new Error('cleardep: param "path" is undefined')
  }
  config.path = typeof(config.path) === 'string' ? [config.path] : config.path
  
  config.extension = config.extension !== undefined ? config.extension : ['js', 'jsx']
  config.extension = typeof(config.extension) === 'string' ? [config.extension] : config.extension

  const packageObj = listInstalledModules()
  if (packageObj === undefined) {
    console.log(`cleardep: package.json don\'t have dependencies.`)
  } else {
    const notFoundModules = findCalledModules(
                                              getKeys(packageObj.dep),
                                              config.extension,
                                              config.path)
    const newDependencies = clearDependencies(
                                              packageObj.dep,
                                              notFoundModules)
    const newPackage = margePackage(
                                    packageObj,
                                    newDependencies)    
    fs.writeFileSync(
                      './package.json',
                      newPackage)
    console.log(`cleardep: remove a ${notFoundModules.length} itens`)
  }
}

const getKeys = obj => Object.keys(obj)
const doEach = (obj, func) => getKeys(obj).forEach(n => func(obj[n], n))

const patternDependencies = '{[\\w\\W]+"dependencies"[ \\t]*:[ \\t]*({["\\w-_.:^\\n \\t,]+})'

const fs = require('fs-extra')
const { find } = require('regex-finder')

module.exports = main
