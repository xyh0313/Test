/*
 * @Description: 
 * @Date: 2023-01-04 18:42:53
 * @LastEditTime: 2023-02-17 10:22:56
 * @Author: xinyanhui@haier.com
 */
const execa = require('execa');
const chalk = require('chalk');
const path = require('path');
const args = require('minimist')(process.argv.slice(2));
const {targets: allTargets} = require('./utils');

// 要打包的模块
const pack_module = process.env.npm_config_module || '';

if (!pack_module) {
  console.log(chalk.redBright('error: 运行命令后加要打包的模块名,  比如--module=Utils'));
  return;
}

if (allTargets.indexOf(pack_module) < 0) {
  console.log(chalk.redBright('error: 要发布的模块不存在'));
  return;
}


// 要发布的版本号
const pack_version = process.env.npm_config_pubversion || '';
// 要打包的源文件目录
// const pack_source_pkg_dir = path.join(__dirname, `../packages/${pack_module}`);

// 开发环境打包路径
// const dev_desc_pkg_dir = path.join(__dirname, '../ui-test');
// 生产环境打包路径
// const prod_desc_pkg_dir = path.join(__dirname, `../dist/${pack_module}`);
// 是否开发环境
// const isDev = args.uitest || false;
const isDev = args.dev || false;
// 环境变量
const ENV = isDev ? 'development' : 'production';


build(pack_module, ENV, options = {
  formats: args.formats,
  platform: args.platform || 'wx',
  pubversion: pack_version
})
/**
 * 
 * @param {*} moduleName 要打包的模块名
 * @param {*} env 构建的的环境，development: 开发环境， production：生产环境
 * @param {*} options 
 * options参数 
 * {
 *  formats: 打包格式, 
 *  platform：打包的支持的平台, 
 *  publish_version：打包的版本, 
 *  sourceMap：是否启动sourceMap
 * }
 */
async function build(moduleName, env, options = {}) {
    await execa(
      'rollup',
      [
        '-c',
        'rollup.config.js',
        '--environment',
        [
          `NODE_ENV:${env}`,
          `TARGET:${moduleName}`,
          options.formats ? `FORMATS:${options.formats}` : ``,
          options.platform ? `APPTYPE:${options.platform}` : ``,
          options.pubversion ? `VERSION:${options.pubversion}` : ``,
          env === 'production' ? `PROD_ONLY:true` : ``,
          options.sourceMap ? `SOURCE_MAP:true` : ``
        ]
          .filter(Boolean)
          .join(',')
      ],
      { stdio: 'inherit' }
    )
    console.log(chalk.blueBright(`success: build success`));
}
