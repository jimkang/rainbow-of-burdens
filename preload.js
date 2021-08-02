var { contextBridge } = require('electron');
var oknok = require('oknok');
var { exec } = require('child_process');

contextBridge.exposeInMainWorld('getTasks', getTasks);

window.addEventListener('DOMContentLoaded', onLoaded);

function onLoaded() {}

function getTasks(done) {
  exec(
    'task status:pending export rc.json.array=on',
    // Unscheduled tasks:
    //'task scheduled:"" status:pending export rc.json.array=on',
    oknok({ ok: passTasks, nok: done })
  );

  function passTasks(stdoutString) {
    var tasks = JSON.parse(stdoutString);
    console.log(tasks);
    done(null, tasks);
  }
}
