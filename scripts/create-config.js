/*
 * @description: 动态构建打包规则
 * @date: 2021-09-30
*/
const path = require('path')
const json = require('@rollup/plugin-json')
const replace = require('@rollup/plugin-replace')
// const alias = require('@rollup/plugin-alias');
const nodeResolve = require('@rollup/plugin-node-resolve')
const chalk = require('chalk')
// const aliasConfig = require('../scripts/config/alias')
const { terser } = require('rollup-plugin-terser')

const { getOutputConfigs } = require("./output-config")

const packagesDir = path.resolve(__dirname, '../packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET);


const myresolve = p => path.resolve(packageDir, p);
const pkg = require(myresolve(`package.json`));

const masterVersion = require('../package.json').version

function createReplacePlugin(
  isProduction,
  isBundlerESMBuild,
  isBrowserESMBuild,
  isBrowserBuild,
  isGlobalBuild,
  isNodeBuild
) {
  //此处用于动态替换
  const replacements = {
    // export * from './__ADAPTER__' example
    // __ADAPTER__: `${process.env.APPTYPE || 'wx'}.js`,   //适配器动态注入，参数来源于 src/app-adapter目录下
    __ADAPTER__: `${process.env.APPTYPE || 'wx'}`,
    __COMMIT__: `"${process.env.COMMIT}"`,
    __VERSION__: `"${process.env.VERSION || masterVersion}"`,
    __DEV__: isBundlerESMBuild
      ?
        `(process.env.NODE_ENV !== 'production')`
      :
        !isProduction,
    __BROWSER__: isBrowserBuild,
    __GLOBAL__: isGlobalBuild,
    __ESM_BUNDLER__: isBundlerESMBuild,
    __ESM_BROWSER__: isBrowserESMBuild,
    __NODE_JS__: isNodeBuild
  }
  Object.keys(replacements).forEach(key => {
    if (key in process.env) {
      replacements[key] = process.env[key]
    }
  })
  return replace({
    values: replacements,
    preventAssignment: true
  })
}

function createConfig(format, output, plugins = []) {
    if (!output) {
      console.log(chalk.yellow(`invalid format: "${format}"`))
      process.exit(1)
    }
    const packageOptions = pkg.buildOptions || {}

    output.exports = 'named'
    output.sourcemap = !!process.env.SOURCE_MAP
    output.externalLiveBindings = false

    const isProductionBuild = process.env.__DEV__ === 'false' || /\.min\.js$/.test(output.file)
    const isBundlerESMBuild = /esm-bundler/.test(format)
    const isBrowserESMBuild = /esm-browser/.test(format)
    const isNodeBuild = format === 'cjs'
    const isGlobalBuild = /global/.test(format)

    if (isGlobalBuild) {
      output.name = packageOptions.name || process.env.TARGET
    }

    let external = []
    if (isGlobalBuild || isBrowserESMBuild) {
        external = ['source-map', '@babel/parser', 'estree-walker']
    } 
    
    else {
      let sets = []
      if(pkg.depends_modules && pkg.depends_modules.length > 0) {
        pkg.depends_modules.forEach(m => {
          const packageDir = path.resolve(packagesDir, m)
          const thepkg = require(path.resolve(packageDir,'package.json'))
          sets.push(...Object.keys(thepkg.dependencies || {}))
        })

      }
      external = [
        ...sets,
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ]
    }
    const nodePlugins =
      packageOptions.enableNonBrowserBranches && format !== 'cjs'
        ? [
            require('@rollup/plugin-commonjs')({
              sourceMap: false
            }),
            require('rollup-plugin-polyfill-node')(),
            nodeResolve.nodeResolve()
          ]
        : [nodeResolve.nodeResolve()]

    let configOptions = {
        external,
        plugins: [
          json({
            namedExports: false
          }),
          createReplacePlugin(
            isProductionBuild,
            isBundlerESMBuild,
            isBrowserESMBuild,
            (isGlobalBuild || isBrowserESMBuild || isBundlerESMBuild) &&
              !packageOptions.enableNonBrowserBranches,
            isGlobalBuild,
            isNodeBuild
          ),
          ...nodePlugins,
          ...plugins,
        ],
        treeshake: {
            moduleSideEffects: false
        }
    }
    return {
        // 默认打包入口是index.js
        input: myresolve('index.js'),
        output,
        ...configOptions
    }
}






function createProductionConfig(format) {
    const outputConfigs = getOutputConfigs()

    return createConfig(format, {
            file: outputConfigs[format].file,
            format: outputConfigs[format].format
        },
        [
            getTerser(format),
            // alias(aliasConfig.alias)
        ]
    )
}

function createDevelopConfig(format) {
    const outputConfigs = getOutputConfigs()

    return createConfig(format, {
            file: outputConfigs[format].file,
            format: outputConfigs[format].format
        },
        // [
        //     alias(aliasConfig.alias)
        // ]
    )
}



function getTerser(format){
  return terser({
    module: /^esm/.test(format),
    compress: {
      ecma: 2015,
      pure_getters: true,
      drop_console: true
    }
  })
}

exports.createConfig = createConfig
exports.createDevelopConfig = createDevelopConfig
exports.createProductionConfig = createProductionConfig
