# newstore-hq

[![Build Status](https://magnum.travis-ci.com/NewStore/newstore-hq.svg?token=HPjsSDyazFBuqzLQzqKe&branch=master)](https://magnum.travis-ci.com/NewStore/newstore-hq)

## Running HQ app locally (Mac OSX)

* Install nodejs

```
$ brew install nodejs
```

* Install all dependencies (both npm and bower packages):

```
$ npm install
```

* Run the local development server

```
$ npm run serve
```

Note: You'll also need running `ponydock`! Refer to this readme for help: https://github.com/NewStore/ponydock#ponydock

* Compile SASS (also included in the `serve` command)
```
$ [npm run] gulp sass [--watch]
```
