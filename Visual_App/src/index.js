const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const main = require ("./main")
const Store = require('electron-store');
const store = new Store();
require('electron-reload')(__dirname);


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindowStateKeeper = windowStateKeeper('main');
  const mainWindow = new BrowserWindow({
    x: mainWindowStateKeeper.x,
    y: mainWindowStateKeeper.y,
    minWidth : 550,
    minHeight: 350,
    backgroundColor: '#24292e',

    width: mainWindowStateKeeper.width,
    height: mainWindowStateKeeper.height,
    webPreferences:{
      nodeIntegration : true 
    }
  });
  mainWindowStateKeeper.track(mainWindow);
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  ipcMain.on('initialized',()=>{
    main(mainWindow);
  })

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
function windowStateKeeper(windowName) {
  let window, windowState;  function setBounds() {
    // Restore from appConfig
    if (store.get(`windowState.${windowName}`) != undefined) {
      windowState = store.get(`windowState.${windowName}`);
      return;
    }
    // Default
    windowState = {
      x: undefined,
      y: undefined,
      width: 550,
      height: 800,
    };
  }  function saveState() {
    if (!windowState.isMaximized) {
      windowState = window.getBounds();
    }
    windowState.isMaximized = window.isMaximized();
    store.set(`windowState.${windowName}`, windowState);
  }  function track(win) {
    window = win;
    ['resize', 'move', 'close'].forEach(event => {
      win.on(event, saveState);
    });
  }  setBounds();  return({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    isMaximized: windowState.isMaximized,
    track,
  });
}