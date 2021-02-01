const process = require('process')
const { exec } = require('child_process')
const si = require('systeminformation')
var winston = require('./winstonconfig')(module)

function getConfig (callback) {
//  TODO
}

function setConfig (callback) {
//  TODO
}

function getMavMode (callback) {
//  TODO
}

function setMavMode (mode, callback) {
//  TODO
}

function setManualControl (x,y,z,y, callback) {
//  TODO
}

module.exports = { getConfig, setConfig, getMavMode, setMavMode, setManualControl }
