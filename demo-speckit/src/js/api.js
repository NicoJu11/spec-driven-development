/** Thin Promise wrapper over the contextBridge API exposed by electron/preload.cjs. */
export const api = {
  albums: {
    list:    ()     => window.api.albums.list(),
    create:  (args) => window.api.albums.create(args),
    rename:  (args) => window.api.albums.rename(args),
    delete:  (args) => window.api.albums.delete(args),
    reorder: (args) => window.api.albums.reorder(args),
  },
  photos: {
    list:   (args) => window.api.photos.list(args),
    import: (args) => window.api.photos.import(args),
    remove: (args) => window.api.photos.remove(args),
  },
  dialog: {
    openPhotos: () => window.api.dialog.openPhotos(),
  },
}
