// requided's

const assert = require('assert')
const fs = require('fs')

const cleardep = require('../npm/index')


// start test

const resetPackage = () => {
  fs.writeFileSync(
    './package.json',
    fs.readFileSync(
      './test/package-BASE.json',
      'utf8'))
}

const jsonObj = () => {
  return JSON.parse(fs.readFileSync(
    './package.json',
    'utf8'))
}

const jsonObjSpec = version => {
  return JSON.parse(fs.readFileSync(
    `./test/package-SPEC-${version}.json`,
    'utf8'))
}

describe('cleardep', function() {
  it('default ext', function() {
    resetPackage()
    cleardep('./test/dir-test')
    assert.deepEqual(
      jsonObj(),
      jsonObjSpec('01')
    )
  })

  it('invalid ext', function() {
    resetPackage()
    cleardep('./test/dir-test', '--ext=na')
    assert.deepEqual(
      jsonObj(),
      jsonObjSpec('02')
    )
  })  

  it('--ext=js;jsa', function() {
    resetPackage()
    cleardep('./test/dir-test', '--ext=js;jsa')
    assert.deepEqual(
      jsonObj(),
      jsonObjSpec('03')
    )
  })

  it('--ext=js;jsx;jsa', function() {
    resetPackage()
    cleardep('./test/dir-test', '--ext=js;jsx;jsa')
    assert.deepEqual(
      jsonObj(),
      jsonObjSpec('01')
    )
  })
})
