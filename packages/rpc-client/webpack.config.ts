import * as webpack from 'webpack';
import * as path from 'path';

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
                { test: /\.tsx?$/, use: 'eslint-loader', exclude: /node_modules/, enforce: 'pre' },
                { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        externals: [
            function (context: string, request: string, callback: (error?: unknown, result?: string | null) => void): void {
                if (request.startsWith('.')) {
                    callback();
                } else {
                    callback(null, request);
                }
            },
        ],
    };

    return configuration;
}

module.exports = configure();