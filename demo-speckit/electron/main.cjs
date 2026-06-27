'use strict'
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

let mainWindow

async function createWindow() {
  const { createDb } = await import('./db.js')
  const { registerHandlers } = await import('./ipc-handlers.js')

  const db = createDb(path.join(app.getPath('userData'), 'photoalbums.db'))
  registerHandlers(ipcMain, db, { dialog })

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
