# cleardep: clear unnecessary installed modules
Fin with a directory give all modules call's and remove from package.json unnecessary dependencies

## I will help if you have any difficulty =)
Contact me by [github:heyderpd](https://github.com/heyderpd). I'll be glad to help you.

## Thanks for [npm~lucasmreis](https://www.npmjs.com/~lucasmreis)
```javascript
npm install --save-dev cleardep
```

## Example:
```terminal
const cleardep = require('cleardep')

cleardep('./APP')

cleardep('./APP', '--ext=js;jsa')

cleardep('./APP;./CONFIG', '--ext=js;jsx;jsa')
```

And use:
```terminal
npm prune
```

INCOMPLETE!!!
I'm working on that works directly as args on terminal, coming soon...
