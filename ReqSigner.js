const jkurwa = require("jkurwa");
const gost89 = require("gost89");
const http = require("http");
const url = require("url");
require('./rand-shim.js');

let query = function (method, toUrl, headers, payload, cb) {
    var parsed = url.parse(toUrl);
    var req = http.request({
        host: parsed.host,
        path: parsed.path,
        headers: headers,
        method: method,
    }, function (res) {
        var chunks = [];
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
        res.on('end', function () {
            cb(Buffer.concat(chunks));
        });
    });
    req.on('error', function (e) {
        cb(null);
    });
    req.write(payload);
    req.end();
};

class ReqSigner {
    constructor(pass, role, keyPath, certPath) {
        this.pass = pass;
        this.role = role;
        this.keyPath = keyPath;
        this.certPath = certPath;
        this.box = null;
    }

    async getLocalBox() {
        const param = {
            algo: gost89.compat.algos(),
            query: query,
            keys: []
        };
        console.log(param.query)
        param.keys[0] = {
            privPath: this.keyPath,
            password: this.pass
            // certPath: this.certPath
        };
        return new jkurwa.Box(param);
    }

    async signText(data) {
        let content = Buffer.from(data, 'utf8');
        if (!this.box)
            this.box = await this.getLocalBox();
        var dt = await this.box.findCertsCmp(["http://acskidd.gov.ua/services/cmp/"])
        console.log(`${dt} datta`)
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