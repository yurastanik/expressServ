const fs = require("fs")
const ReqSigner = require("./ReqSigner");

class CommandsHandler{
    data;
    constructor(value){
        this.data = value
    }

     static async parseData(data) {
        switch (data.Command) {
            case "ZRep": return await new CommandsHandler(data).docCommand("ZReport")
            case "Shifts": return new CommandsHandler(data).shiftsCommand()
            case "Documents": return new CommandsHandler(data).jsonDocCommand("Documents")
            case "Check": return new CommandsHandler(data).docCommand("Receipt")
            case "DocumentInfoByLocalNum": return new CommandsHandler(data).jsonDocCommand("Receipt")
            case "TransactionsRegistrarState": return new CommandsHandler(data).jsonDocCommand("States")
            case "LastShiftTotals": return new CommandsHandler(data).jsonDocCommand("LastShiftTotals")
            case "Objects": return new CommandsHandler(data).objectsCommand()
            case "ServerState": return new CommandsHandler(data).servStateCommand()
            default: return {"data": "No Content", "code": 200, "type": "application/text"}
        }
    }

    servStateCommand() {
        var res = {}
        res.data = {"Timestamp": new Date(Date.now()).toISOString()}
        res.code = 200
        res.type = "application/json"
        return res
    }

    objectsCommand() {
        var path = `Objects\\data.json`
        var res = {}
        try {
            res.data = fs.readFileSync(path, "utf8")
            res.code = 200
            res.type = "application/octet-stream"
        } catch (e) {
            res.data = "No Content"
            res.code = 204
            res.type = "application/text"
        }
        return res
    }


    async docCommand(type) {
        var path = `${this.data.RegistrarNumFiscal}\\${type}\\${this.data.NumFiscal}.xml`
        var res = {}
        try {
            var signer = new ReqSigner("checkonline", false, "Key-66.dat")
            res.data = await signer.signText(fs.readFileSync(path, "utf8"))
            res.code = 200
            res.type = "application/octet-stream"
        } catch (e) {
            console.log(e)
            res.data = "No Content"
            res.code = 204
            res.type = "application/text"
        }
        return res
    }

    shiftsCommand() {
        var res = {}
        try {
            var jsData = fs.readFileSync(`${this.data.NumFiscal}\\shifts.json`, "utf8")
            var json = JSON.parse(jsData)
            res.data = {}
            res.data.UID = json.UID
            res.data.Shifts = []
            var shifts = json.Shifts
            for (var i = 0; i < shifts.length; i++) {
                if (this.dateComparsion(shifts[i].Opened, this.data.From)
                    && this.dateComparsion(this.data.To, shifts[i].Opened)) {
                    res.data.Shifts.push(shifts[i])
                }
            }
            res.code = 200
            res.type = "application/json"
        } catch (e) {
            res.data = "No Content"
            res.code = 204
            res.type = "application/text"
        }
        return res
    }

    jsonDocCommand(type) {
        var res = {}
        var path = `${this.data.NumFiscal}\\${type}`
        try {
            var files = fs.readdirSync(path)
            var fName = this.data.ShiftId ?? this.data.OpenShiftFiscalNum
            fName = fName ?? this.data.NumLocal
            fName = fName ?? "data"
            for (var i = 0; i < files.length; i++) {
                if (files[i].includes(fName)) {
                    path += `\\${files[i]}`
                }
            }
            res.data = fs.readFileSync(path, "utf8")
            res.code = 200
            res.type = "application/json"
        } catch (e) {
            console.log(e)
            res.data = "No Content"
            res.code = 204
            res.type = "application/text"
        }
        return res
    }

    dateComparsion(stringDate1, stringDate2) {
        var d1 = new Date(stringDate1)
        var d2 = new Date(stringDate2)
        return (d1 - d2) > 0
    }
}

module.exports = CommandsHandler