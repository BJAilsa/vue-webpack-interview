const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin'); //主要用于 打包之前 先清空 打包目录下的文件，防止文件混乱。

let getVueLoaderConfig = (env) => {
    return env === "dev" ?
        {
            loaders: {
                scss:
                    [
                        'vue-style-loader',
                        'css-loader',
                        'postcss-loader',
                        'sass-loader'
                    ],
                sass:
                    [
                        'vue-style-loader',
                        'css-loader',
                        'postcss-loader',
                        'sass-loader?indentedSyntax'
                    ],
                css:
                    [
                        'vue-style-loader',
                        'css-loader',
                        'postcss-loader',
                        'sass-loader?indentedSyntax'
                    ]
            }
        }
        :
        {
            loaders: {
                scss:
                    ExtractTextPlugin.extract({
                        use: ['css-loader', 'postcss-loader', 'sass-loader'],
                        fallback: 'vue-style-loader'
                    }),
                sass:
                    ExtractTextPlugin.extract({
                        use: ['css-loader', 'postcss-loader', 'sass-loader?indentedSyntax'],
                        fallback: 'vue-style-loader'
                    }),
                css:
                    ExtractTextPlugin.extract({
                        use: 'css-loader',
                        fallback: 'vue-style-loader'
                    }),
            },
            extractCSS: true
        }
};

let getRules = (env) => {
    let rules = [
        {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: getVueLoaderConfig(env)
        },
        {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        },
        {
            test: /\.css$/,
            use: env == "dev" ? [
                'style-loader',
                'css-loader',
                'postcss-loader'
            ] : ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: ['css-loader', 'postcss-loader']
            })
        },
        {
            test: /\.scss$/,
            use: env == "dev" ? [
                'style-loader',
                'css-loader',
                'postcss-loader',
                'sass-loader'
            ] : ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'postcss-loader', 'sass-loader']
            })
        },
        //图片配置
        /*
           *  limit=10000 ： 10kb
           *  图片大小小于10kb 采用内联的形式，否则输出图片
           * */
        {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: 'img/[name].[hash:7].[ext]'
                    }
                }
            ]
        }
    ]

    return rules;
};

let getPlugins = (env) => {
    let plugins = [
        new HtmlWebpackPlugin({
            template: 'index.html',//模板的路径。支持加载器，例如 html!./index.html。
            filename: 'index.html',//用于生成的HTML文件的名称，默认是index.html。你可以在这里指定子目录（例如:assets/admin.html）
            options: env === "build" ? {
                minify: true,
                removeComments: true,
                removeEmptyAttributes: true
            } : {}
        }),
        new webpack.optimize.CommonsChunkPlugin({ //防止如果入口 chunks 之间包含重复的模块(prevent duplication)
            name: "common",// 指定公共 bundle 的名称。
        }),
        new webpack.ProvidePlugin({
            "Vue": "vue",
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(env == "build" ? "production" : "development")
            },
            __DEV__: env != "build",
            serverDomain: JSON.stringify(env == "build" ? "api.m.jd.com" : "beta-api.m.jd.com")
            //serverDomain: JSON.stringify(env == "build" ? "beta-api.m.jd.com" : "beta-api.m.jd.com")
        })
    ];
    if (env === "build") {
        plugins.push(
            new ExtractTextPlugin({
                filename: "css/[name].css"
            }),
            new CleanWebpackPlugin(['dist', 'dist.zip']),
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    warnings: false,
                    drop_console: true
                }
            }))
    } else {
        plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
            new webpack.NoEmitOnErrorsPlugin())
    }
    return plugins;
}


module.exports = (env) => {
    let config = {
        entry: {
            vendor: ['babel-polyfill', './src/lib/rem.js'],
            app: ['./src/main.js']
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'js/[name].[hash].js',
            publicPath: '/',
            chunkFilename: 'js/chunk/[name].[hash].js'  // 配合 vue-router 做代码分割  按需加载使用
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],//不需要手动添加的文件扩展名
            alias: {
            }
        },
        module: {
            rules: getRules(env)
        },
        plugins: getPlugins(env)
    };
    if (env == "dev") {
        Object.assign(config,
            {
                devtool: 'cheap-module-eval-source-map',//original source (lines only)
                devServer: {
                    historyApiFallback: true,
                    hot: true,
                    contentBase: './',
                    compress: true,
                    host: 'zhj.jd.com',
                    port: '3000',
                    open: true,
                    publicPath: '/',
                    stats: {
                        colors: true
                    }
                }
            })
    }
    return config;
}