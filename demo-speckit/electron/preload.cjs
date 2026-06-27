'use strict'
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  albums: {
    list:    ()     => ipcRenderer.invoke('albums:list'),
    create:  (args) => ipcRenderer.invoke('albums:create',  args),
    rename:  (args) => ipcRenderer.invoke('albums:rename',  args),
    delete:  (args) => ipcRenderer.invoke('albums:delete',  args),
    reorder: (args) => ipcRenderer.invoke('albums:reorder', args),
  },
  photos: {
    list:   (args) => ipcRenderer.invoke('photos:list',   args),
    import: (args) => ipcRenderer.invoke('photos:import', args),
    remove: (args) => ipcRenderer.invoke('photos:remove', args),
  },
  dialog: {
    openPhotos: () => ipcRenderer.invoke('dialog:open-photos'),
  },
})
