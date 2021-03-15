// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    config.plugins[1].skipSelf = true;
    config.plugins[1].custom = { 'node-resolve': { isRequire: true } };
    console.log(config.plugins[1]);
    return config; // always return a config.
  },
};
