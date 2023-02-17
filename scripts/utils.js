/*
 * @Description: 
 * @Date: 2023-01-05 11:15:40
 * @LastEditTime: 2023-01-05 11:15:57
 * @Author: xinyanhui@haier.com
 */
const fs = require('fs')

const targets = (exports.targets = fs.readdirSync('packages').filter(f => {
  if (!fs.statSync(`packages/${f}`).isDirectory() || !fs.existsSync(`packages/${f}/package.json`)) {
    return false
  }
  return true
}))

exports.matchTarget = (partialTargets, includeAllMatching) => {
    const matched = []
    partialTargets.forEach(partialTarget => {
      for (const target of targets) {
        if (target.match(partialTarget)) {
          matched.push(target)
          if (!includeAllMatching) {
            break
          }
        }
      }
    })
    if (matched.length) {
      return matched
    } else {
      console.log()
      console.error(
        `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
          `Target ${chalk.underline(partialTargets)} not found!`
        )}`
      )
      console.log()
      process.exit(1)
    }
  }
