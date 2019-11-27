const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function sendFile(filePath) {
    let fd = new FormData();

    fd.append('chat_id', '770488077');
    fd.append('document', fs.createReadStream(filePath));

    return await axios.post('https://api.telegram.org/' + fs.readFileSync('.env').toString() + '/sendDocument', fd, {
        headers: fd.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    })
}

module.exports = sendFile;