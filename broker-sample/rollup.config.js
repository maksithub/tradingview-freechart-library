/* globals process */

var buble = require('rollup-plugin-buble');
var uglify = require('rollup-plugin-uglify');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

var environment = process.env.ENV || 'development';
var isDevelopmentEnv = (environment === 'development');

module.exports = [
	{
		input: 'lib/broker.js',
		name: 'Brokers',
		sourceMap: false,
		output: {
			format: 'umd',
			file: 'dist/bundle.js',
		},
		plugins: [
			nodeResolve({ jsnext: true, main: true }),
			buble(),
			!isDevelopmentEnv && uglify({ output: { inline_script: true } }),
		],
	},
	{
		input: 'src/polyfills.js',
		sourceMap: false,
		context: 'window',
		name: 'BrokersPolyfills',
		output: {
			format: 'iife',
			file: 'dist/polyfills.js',
		},
		plugins: [
			nodeResolve({ jsnext: true, main: true }),
			commonjs(),
			buble(),
			uglify({ output: { inline_script: true } }),
		],
	},
];
