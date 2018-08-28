import {app, BrowserWindow, ipcMain, dialog, shell} from 'electron'
const windowStateKeeper = require('electron-window-state')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit()
}

// This SHOULD be removed in the make process
// This enabled automatic reload for dev convenience
require('electron-reload')(__dirname, {
  // uncomment for hard resets
  // electron: require(`${__dirname}/../node_modules/electron`)
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const createWindow = () => {
  // get previous window state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 720,
    defaultHeight: 720,
  })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 500,
    minHeight: 300,
  })

  // register 'resize' and move listeners on the window
  mainWindowState.manage(mainWindow)

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // if a user clicks a link, make it open externally
  mainWindow.webContents.on('will-navigate', handleRedirect)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// open a file-chooser dialog when asked to
function openFileDialog(event) {
  dialog.showOpenDialog({
      properties: ['openFile'],
    },
    function(files) {
      if (files) {
        event.sender.send('selected-file', files)
      }
    }
  )
}
ipcMain.on('open-file-dialog', openFileDialog)

// helper for opening links in a new window (used by `.webContents.on('will-navigate', handleRedirect)`)
function handleRedirect(event, url) {
  // opens certain URLs in user's default browser
  if (url !== event.sender.getURL()) {
    event.preventDefault()
    shell.openExternal(url)
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
