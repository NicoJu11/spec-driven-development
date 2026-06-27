import { vi } from 'vitest'

// Mock the `electron` module so unit and integration tests run in plain Node.js
// without a real Electron process.
vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn().mockResolvedValue({ canceled: true, filePaths: [] }),
  },
  app: {
    getPath: vi.fn(() => '/tmp/test-photoalbums'),
    isPackaged: false,
    quit: vi.fn(),
    whenReady: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  },
  BrowserWindow: vi.fn(),
  ipcMain: { handle: vi.fn() },
  ipcRenderer: { invoke: vi.fn() },
  contextBridge: { exposeInMainWorld: vi.fn() },
}))
