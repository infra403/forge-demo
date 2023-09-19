import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const CopyPlugin = require('copy-webpack-plugin');

import * as webpack from 'webpack'
const assets = ['data'];
const copyPlugins = assets.map(asset => {
  return new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src', asset),
        to: asset,
        transform(content:any, path:any) {
          return content; // 直接返回内容，不做任何变换
        }
      }
    ]
  });
});

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  ...copyPlugins
];
