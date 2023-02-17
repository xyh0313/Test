/*
 * @Description: 
 * @Date: 2023-01-05 11:39:03
 * @LastEditTime: 2023-02-17 10:31:54
 * @Author: xinyanhui@haier.com
 */
const path = require('path');

const isProd = process.env.PROD_ONLY;

const distresolve = p => __resovle(p, 'dist');
// const uitestresolve = p => __resovle(p, 'ui-test');

function __resovle(p, subp){
  const packagesDist = path.resolve(__dirname, `../${subp}`);
  const packageDist = path.resolve(packagesDist, process.env.TARGET);
  return path.resolve(packageDist, p)
}

function getOutputConfigs(){
    let config = getOutputFilename();
    return {
        'esm-bundler': {
            file: distresolve(config['esm-bundler']),
        
        //   file: isProd ? distresolve(config['esm-bundler']) : uitestresolve(`iot-lib/${config['esm-bundler']}`),
            format: `es`
        },
        'esm-browser': {
            file: distresolve(config['esm-browser']),
        //   file: isProd ? distresolve(config['esm-browser']) : uitestresolve(`iot-lib/${config['esm-browser']}`),
            format: `es`
        },
        cjs: {
            file: distresolve(config['cjs']),
        //   file: isProd ? distresolve(config['cjs']): uitestresolve(`iot-lib/${config['cjs']}`),
          format: `cjs`
        },
        global: {
            file: distresolve(config['global']),
        //   file: isProd ? distresolve(config['global']) : uitestresolve(`iot-lib/${config['global']}`),
          format: `iife`
        }
    }
}

function getOutputFilename() {
  const name = process.env.TARGET;
  return {
    'esm-bundler': `${name}.${getSuffix('esm-bundler')}`,
    'esm-browser': `${name}.${getSuffix('esm-browser')}`,
    cjs: `${name}.${getSuffix('cjs')}`,
    global: `${name}.${getSuffix('global')}`
  }
}

function getSuffix(format) {
  const version = process.env.VERSION;
  return isProd ? 
  version ? `${format}-${version}.min.js` : `${format}.min.js`
  : `${format}.js`;
}

exports.getOutputConfigs = getOutputConfigs
exports.getOutputFilename = getOutputFilename
