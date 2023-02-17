/*
 * @Description: 
 * @Date: 2023-02-17 09:57:26
 * @LastEditTime: 2023-02-17 09:57:36
 * @Author: xinyanhui@haier.com
 */
const { createDevelopConfig, createProductionConfig } = require("./scripts/create-config")

let format = process.env.FORMATS;

let ret = process.env.PROD_ONLY ? createProductionConfig(format) : createDevelopConfig(format);

export default ret

