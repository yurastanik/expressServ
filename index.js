const express = require('express')
const bodyParser = require("body-parser");
const agent = require("dstucrypt-agent/agent");
const jkurwa = require('jkurwa')
const ReqSigner = require("./ReqSigner");
const app = express()
const fs = require("fs")
const CommandHandler = require('./CommandsHandler')




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());

app.get('/', (req, res) => {
    res.send("Такий тип запиту не підтримується");
});

app.post('/', async (req, res) => {
    var type = req.headers['request-type']
    if (type == "Command") {
        var data = {}
        var resp = {}
        try {
            var message = new jkurwa.models.Message(req.body)
            data = JSON.parse(message.info.contentInfo.content.toString())
            resp = await CommandHandler.parseData(data)
        } catch (e) {
            resp.data = "No Content"
            resp.code = 204
            resp.type = "application/text"
            if (JSON.parse(req.body?.toString()).Command == "ServerState") {
                data = JSON.parse(req.body.toString())
                resp = await CommandHandler.parseData(data)
            }
        }
        res.status(resp.code)
        res.contentType(resp.type)
        res.send(resp.data)
    }
})


app.listen(8609, () => {
    console.log('Application listening on port 8609!');
});