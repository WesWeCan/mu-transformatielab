import { app, BrowserWindow, Menu, session } from 'electron';
import path from 'path';




import { registerInternalProcesses } from './internal-processes/internal-processes';
import { build } from 'vite';
import { buildMenu } from './menu/build-menu';



import { initStorage, openInternalStorageFolder } from './internal-processes/internal-storage';


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const cloudWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });


  buildMenu(mainWindow);
  buildMenu(cloudWindow);


  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    cloudWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    // cloudWindow.webContents.openDevTools();

    // openInternalStorageFolder();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    cloudWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }


  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('become-main');
  });

  cloudWindow.webContents.on('did-finish-load', async () => {
  cloudWindow.webContents.send('become-cloud');
  });


   // Check for available displays
   const { screen } = require('electron');
   const displays = screen.getAllDisplays();
 
   if (displays.length > 1) {

    const firstDisplay = displays[0];
    mainWindow.setBounds(firstDisplay.bounds);

     // Move the window to the second display
     const secondDisplay = displays[1];
     cloudWindow.setBounds(secondDisplay.bounds);
   }
 
   setTimeout(() => {

    setTimeout(() => {
      mainWindow.setFullScreen(true);
      mainWindow.maximize();
      mainWindow.webContents.reload();
    }, 1500);
    
 
     cloudWindow.setFullScreen(true);
    cloudWindow.maximize();

    // reload both windows
     
     cloudWindow.webContents.reload();
     
   }, 1500);
   // Enter fullscreen mode (green dot)

};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': [
  //         "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:"
  //       ]
  //     }
  //   })
  // })
  
  createWindow();


  initStorage();  
  registerInternalProcesses();
});

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
