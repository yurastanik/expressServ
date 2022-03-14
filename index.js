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

    var binary_string = atob("MIIE4wIBAzCCBIAGCSqGSIb3DQEHAaCCBHEEggRtMIIEaTCCBGUGCSqGSIb3DQEHAaCCBFYEggRSMIIETjCCAfIGCyqGSIb3DQEMCgECoIIBrjCCAaowgbAGCSqGSIb3DQEFDTCBojBDBgkqhkiG9w0BBQwwNgQguKs8TPAr3jPkSFw7KI0g9hRhaefV+kewGgyTa7LbiUACAicQMA4GCiqGJAIBAQEBAQIFADBbBgsqhiQCAQEBAQEBAzBMBAgjwaT/+Y1iWgRAqdbrRfE8cIKAxJZ7Ix9erfZY66TANykdONlr8CXKThf46XINxhW0OiiXXwvB3qNkOLVk6iwXn9ASPm24+sV5BASB9C/SN4CnwnFm9oerBJqiJ7ksmqVSngnT5KDesqWjwO6/dhg6M24QrBiM0lLNXyDb9DpkVkY5HvP81voki1xYNpgQ4qk/7K4fLTPVv2hTPpnlZwzSSVZqlHbiZZOMU+nzWm11lEG8R1lzaKC5pU+wPY5BCHcUGXx5+1pS5JPWdYV5oU1Zeko+dmcCljwJTkp5QHUzeSZp0ODsqxvhHcXcAbHvIEomRJDDYRR9cwP7rBMTzSChAxmZodcoHbJaCmLziRvyv6IK8szRURMS4q6x58SAfJhJftpqfpU1Q3qiYbQ7zsonmrt5rpqxwLHrYdiQv9WbRZwxMTAvBgkqhkiG9w0BCRUxIgQgg1Ra5YOBHZ90qrDp44AQ7sIIbKloR93BdQhxQlt1lV8wggJUBgsqhkiG9w0BDAoBAqCCAhAwggIMMIGwBgkqhkiG9w0BBQ0wgaIwQwYJKoZIhvcNAQUMMDYEIIPTyIQWGHv+20SJ1RFS4pPma3F2zdnwry3tMZ4KN2qaAgInEDAOBgoqhiQCAQEBAQECBQAwWwYLKoYkAgEBAQEBAQMwTAQIxsD47sK/7OsEQKnW60XxPHCCgMSWeyMfXq32WOukwDcpHTjZa/Alyk4X+OlyDcYVtDool18Lwd6jZDi1ZOosF5/QEj5tuPrFeQQEggFVvLQFUaY1eHRpbWLXJJijQ07qrzYFILdDy9+5Cn0PIo3I7xq7X1mXKKUJCz3BI56tpavUFsC3QUCc8BLdaA3wzzH7DkUKdzogQMSPS1ZNkmj8rUFteFBmMD3xWiWMYk/jvvnEEGIoNMmleOuaPGEQyM8b9gjFOSP71ijwvaYabFC6/nsJ1hwQhg/il4sWw6R74mWJfcaKbXye9UhpEbMPnjCUbu4JrVEOIzy8Ku9dxO0p4E4oLbZ5pIiilWXZoNvwmClvHuNqacWb2JWyOfzWsKvbYFGwf9Szl7pNtaMGHntbxZe+IVEd5dpJWjmREmO6eox+Qx1EeqoltuZsoxFFVEhH85Mm3CcTgvsBQA8sGK3l0kQ1wIMT4LjU0bOlQRe/dPen8CtTd4YTHFZvEfjQcKcvhnzud9NtWiS2hhpTljqnqa4FpASMZjy+RittttC784NB614xMTAvBgkqhkiG9w0BCRUxIgQgH3yN+JCQFNxd4kPSdPYV6bZTbNYzuLkmiuBFct+wFMUwWjAyMA4GCiqGJAIBAQEBAgEFAAQgndvX89VXQzDEw38OfOqDbT3aEjvH+lujHUMCW9s1ljUEINSA8d41T4es/o/AlAez1SweeCzXSJXS4NjLvvJHX1UDAgInEA==");
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    fs.appendFileSync("Key-66.dat", Buffer.from(bytes.buffer));
    res.send({ message: 'It works' });
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