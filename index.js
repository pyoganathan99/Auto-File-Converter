const systray = require('systray').default;
const chokidar = require('chokidar');
const Lame = require('node-lame').Lame;
const notifier = require('node-notifier');

const sendFile = require('./send-file');

const fs = require('fs');

const defaultIcon = fs.readFileSync('default-icon.bin').toString();
const syncIcon = fs.readFileSync('sync-icon.bin').toString();
const uploadIcon = fs.readFileSync('upload-icon.bin').toString();

defaultConfig = {
    icon: defaultIcon,
    title: "WAV to MP3",
    tooltip: "Watching for files",
    items: [],
}

let trayIcon = new systray({
    menu: defaultConfig,
});

function updateIconForSync(fileName) {
    trayIcon.sendAction({
        type: "update-menu",
        menu: {
            icon: syncIcon,
            title: "WAV to MP3",
            tooltip: "Converting " + fileName + "...",
            items: [],
        },
        seq_id: 1,
    })
}

function updateIconForUpload(fileName) {
    trayIcon.sendAction({
        type: "update-menu",
        menu: {
            icon: uploadIcon,
            title: "WAV to MP3",
            tooltip: "Uploading " + fileName + "...",
            items: [],
        },
        seq_id: 1,
    })
}

function updateIconToDefault() {
    trayIcon.sendAction({
        type: "update-menu",
        menu: defaultConfig,
        seq_id: 1,
    })
}

const sourceDirectory = 'E:\\Workspaces\\Trash\\CheckingAgain';
const outputDirectory = sourceDirectory + "\\Output";

function removeExtension(fullname) {
    return fullname.split(".")[0];
}

let currentContents = fs.readdirSync(outputDirectory).map(removeExtension);

console.log(currentContents);

let watcher = chokidar.watch(sourceDirectory);

watcher.on('add', fullFilePath => {

    let fullName = fullFilePath.split("\\").pop();
    let fileName = fullName.split('.')[0];
    let fileExtension = fullName.split('.').pop().toUpperCase();

    if (currentContents.includes(fileName)) return;

    if (fileExtension === 'WAV') {

        console.log("Converting " + fileName);

        notifier.notify({
            title: "Music automator",
            icon: "notification-icon.png",
            type: "info",
            message: 'Converting to MP3',
            appID: fullName,
        });

        let opFilePath = outputDirectory + "\\" + fileName + ".mp3";
        let enc = new Lame({
            output: opFilePath,
            bitrate: 192
        }).setFile(fullFilePath);
        enc.encode().then(() => {
            console.log('Completed');
            notifier.notify({
                title: "Music automator",
                icon: "notification-icon.png",
                type: "info",
                message: 'File converted successfully! Uploading to Telegram...',
                appID: fullName,
            });
            sendFile(opFilePath).then(e => {
                console.log('Uploaded');
                notifier.notify({
                    title: "Music automator",
                    icon: "notification-icon.png",
                    type: "info",
                    message: 'File uploaded successfully',
                    appID: fullName,
                });
            }).catch(() => {
                console.log(error);
                notifier.notify({
                    title: "Music automator",
                    icon: "notification-icon.png",
                    type: "error",
                    message: 'Error uploading',
                    appID: fullName,
                });
            })
        }).catch(error => {
            console.log(error);
            notifier.notify({
                title: "Music automator",
                icon: "notification-icon.png",
                type: "error",
                message: 'Error converting file',
                appID: fullName,
            });
        }).finally(() => {
            updateIconToDefault();
        });

        updateIconForSync(fileName);
    }
});