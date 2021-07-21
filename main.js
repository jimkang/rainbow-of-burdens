/* global process, __dirname */

var { app, BrowserWindow } = require('electron');
var path = require('path');
var oknok = require('oknok');
var { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  getTasks();
});

function getTasks() {
  exec(
    'task status:pending export rc.json.array=on',
    // Unscheduled tasks:
    //'task scheduled:"" status:pending export rc.json.array=on',
    oknok({ ok: useTasks, nok: (error) => console.error(error) })
  );
}

function useTasks(stdoutString) {
  var tasks = JSON.parse(stdoutString);
  console.log(tasks);
}
