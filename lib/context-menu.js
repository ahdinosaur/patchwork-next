var electron = require('electron')
var Menu = electron.remote.Menu
var MenuItem = electron.remote.MenuItem
var BrowserWindow = electron.remote.BrowserWindow

window.addEventListener('contextmenu', function (e) {
  module.exports(null, e)
}, false)

module.exports = function (item, ev) {
  ev.preventDefault()
  ev.stopPropagation()
  var menu = new Menu()
  menu.append(new MenuItem({
    label: 'Reload',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.reload()
      }
    }
  }))
  menu.append(new MenuItem({
    type: 'separator'
  }))
  menu.append(new MenuItem({
    label: 'Inspect Element',
    click: function () {
      var x = ev.clientX
      var y = ev.clientY
      BrowserWindow.getFocusedWindow().inspectElement(x, y)
    }
  }))
  menu.append(new MenuItem({
    label: 'Inspect Server Process',
    click: function () {
      electron.ipcRenderer.send('open-background-devtools')
    }
  }))
  if (item && item.key) {
    menu.append(new MenuItem({
      type: 'separator'
    }))
    menu.append(new MenuItem({
      label: 'Copy Message ID',
      click: function () {
        electron.clipboard.writeText(item.key)
      }
    }))
  }

  menu.popup(electron.remote.getCurrentWindow())
}
