const jkurwa = require("jkurwa");
const gost89 = require("gost89");
const http = require("http");
const url = require("url");
require('./rand-shim.js');
const fs = require("fs");
const https = require("https");
const algos = gost89.compat.algos;

var query = function(method, toUrl, headers, payload, cb) {
    var parsed = url.parse(toUrl);
    var module = {'http:': http, 'https:': https}[parsed.protocol];
    var req = module.request({
        host:  parsed.host,
        path: parsed.path,
        headers: headers,
        method: method,
    }, function (res) {
        var chunks = [];
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
        res.on('end', function () {
            cb(Buffer.concat(chunks), res.statusCode);
        });
    });
    req.on('error', function(e) {
        cb(null, 599);
    });
    req.write(payload);
    req.end();
};

function key_param_parse(key) {
    let pw;
    if (key.indexOf(":") !== -1) {
        pw = key.substr(key.indexOf(":") + 1);
        key = key.substr(0, key.indexOf(":"));
    }
    return {
        path: key,
        pw: pw,
    };
}

function listOf(value) {
    if (!value) {
        return [];
    }
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
}

class ReadFileError extends Error {}

function readFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                console.log(`error to read file: ${err.toString()}`);
                reject(new ReadFileError());
            } else {
                resolve(data);
            }
        });
    });
}

class ReqSigner {
    constructor(pass, role, keyPath) {
        this.pass = pass;
        this.role = role;
        this.keyPath = keyPath
        this.box = null;
    }

    async getLocalBox(key) {
        const box = new jkurwa.Box({ algo: algos(), query: query });
        const keyInfo = listOf(key).map(key_param_parse);
        for (let { path, pw } of keyInfo) {
            let buf = await readFile(path);
            box.load({ keyBuffers: [buf], password: pw });
        }
        return box;
    }

    async signText(content) {
        //let content = Buffer.from(data, 'utf8');
        if (!this.box)
            this.box = await this.getLocalBox(`${this.keyPath}:${this.pass}`);
        await this.box.findCertsCmp(["http://acskidd.gov.ua/services/cmp/"])
        let headers = null;
        let pipe = [];
        pipe.push({
            op: 'sign',
            tax: false,
            detached: false,
            role: this.role,
            tsp: false,
        });
        return await this.box.pipe(content, pipe, headers);
    }
}

module.exports = ReqSigner