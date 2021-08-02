//var { select } = require('d3-select');

window.getTasks(renderTasks);

function renderTasks(error, tasks) {
  if (error) {
    console.error(error);
    return;
  }

  document.body.innerHTML =
    '<ul>\n' +
    tasks.map((task) => `<li>${task.description}</li>`).join('\n') +
    '</ul>';
}
