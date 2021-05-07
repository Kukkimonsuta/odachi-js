/// <reference types="node" />

import * as webpack from 'webpack';
import * as path from 'path';

const ESLintWebpackPlugin = require('eslint-webpack-plugin');

function configure(): webpack.Configuration {
    const configuration: webpack.Configuration = {
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js',
            library: 'odachi_rpc_client',
            libraryTarget: 'umd'
        },
        module: {
            rules: [
                { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            new ESLintWebpackPlugin(),            
        ],
        externals: [
            function({ context, request }, callback) {
                if (request?.startsWith('.')) {
                    callback();
                } else {
                    callback(undefined, request);
                }
            },
        ],
    };

    return configuration;
}

module.exports = configure();