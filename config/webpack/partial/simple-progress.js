"use strict";

const webpack = require("webpack");

let lastPct;

module.exports = function () {
  return {
    plugins: [
      new webpack.ProgressPlugin((pct, msg) => {
        pct = Math.ceil(pct * 100);
        if (lastPct === pct) {
          return;
        }
        if (pct === 0) {
          process.stdout.write(`\nwebpack ${msg}: `);
        }
        process.stdout.write(".");
        if (pct > 0 && pct % 20 === 0) {
          process.stdout.write("\n");
          if (msg && pct < 100) {
            process.stdout.write(`  ${msg}: `);
          }
        }
        if (pct === 100) {
          lastPct = undefined;
        } else {
          lastPct = pct;
        }
      })
    ]
  };
};
