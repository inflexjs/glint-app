// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
import Size = Electron.Size;

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')


import {app, BrowserWindow, shell, ipcMain, Tray, Menu, screen, globalShortcut, desktopCapturer } from 'electron'
import { release } from 'os'
import { join } from 'path'
import * as os from "os";
import Display = Electron.Display;
import * as url from "url";

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let mainWindow: BrowserWindow | null
let captureWins: BrowserWindow[] | null
let settingsWindow: BrowserWindow | null
let screenshotWindow: BrowserWindow | null
let tray: Tray | null
let displays: Display[] | null
let currentScreen: Size | null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const serverUrl = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')
const settingsHtml = join(process.env.DIST, 'index.html#/settings')

console.log({indexHtml})
console.log({ isElectron: process.env.IS_ELECTRON })

function createTray() {
  tray = new Tray(join(process.env.PUBLIC, 'logo150x150.png'))
  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Glint',
      type: 'normal',
      icon: join(process.env.PUBLIC, 'logo12x12.png'),
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Сделать скриншот',
      type: 'normal',
      async click() {
        await takeScreenshots()
      }
    },
    {
      label: 'Devtools',
      type: 'normal',
      role: 'toggleDevTools'
    },
    {
      label: 'Настройки',
      type: 'normal',
      click() {
        settingsWindow.show()}
      },
    {
      type: 'separator'
    },
    {
      label: 'Выход',
      type: 'normal',
      click() {
        app.quit()
        process.exit(0)
      }
    },
  ])
  tray.setToolTip('Glint')
  tray.setContextMenu(trayMenu)
}

function registerShortcuts() {
  const takeScreenshot = globalShortcut.register('PageUp', async () => {
    console.log('PageUp is pressed')
    await takeScreenshots()
  })
  const exit = globalShortcut.register('Esc', async () => {
    if (!captureWins.length) return
    captureWins.forEach(window => window.hide())
    console.log('Esc is pressed')
  })
  if (!takeScreenshot && !exit) console.log('Shortcuts registration error')

  console.log(globalShortcut.isRegistered('PageUp'))
  console.log(globalShortcut.isRegistered('Esc'))
}

function getDisplays() {
  displays = screen.getAllDisplays()
}

function takeScreenshots() {
  captureWins.forEach(async (window, index) => {
    const display = displays[index]

    await desktopCapturer.getSources(({
      types: ['screen'],
      thumbnailSize: {
        width: display.bounds.width,
        height: display.bounds.height
      }})).then(sources => {
      let image = sources.find(screen => screen.display_id === display.id.toString()).thumbnail.toDataURL()
      window.webContents.send('screenshot:capture', image)
    })

    // window.setMinimumSize(display.bounds.width, display.bounds.height)
    // window.setAlwaysOnTop(true, 'screen-saver')
    window.show()
    window.setFullScreenable(false)
  })
}

async function createScreenshotWindows() {
  // console.log({captureWins})
  if (captureWins && captureWins.length) return
  // console.log('working')

  //Cycle to create a screen capture window
  captureWins = displays.map((display, index) => {
    // console.log({display})
    // console.log({index})
    let captureWin = new BrowserWindow({
      // window uses fullscreen, mac is set to undefined, not false
      fullscreen: os.platform() === 'win32' || undefined,
      width: display.bounds.width,
      height: display.bounds.height,
      x: display.bounds.x,
      y: display.bounds.y,
      skipTaskbar: true,
      frame: false,
      kiosk: true,
      movable: false,
      show: false,
      resizable: false,
      autoHideMenuBar: true,
      enableLargerThanScreen: true,
      hasShadow: false,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        preload,
      },
    })

    if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
      captureWin.loadURL(serverUrl)
      // Open devTool if the app is not packaged
      // screenshotWindow.webContents.openDevTools()
    } else {
      captureWin.loadFile(indexHtml)
    }

    // Debugging
    // captureWin.openDevTools()

    // Close all windows when one window is closed
    captureWin.on('closed', () => {
      let index = captureWins.indexOf(captureWin)
      if (index !== -1) {
        captureWins.splice(index, 1)
      }
      captureWins.forEach(win => win.hide())
    })
    // captureWin.on('blur', () => {
    //   console.log('blur')
    //   captureWin.show()
    //   captureWin.focus()
    // })
    return captureWin
  })
}

async function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    title: 'Настройки',
    width: 700,
    height: 300,
    center: true,
    show: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    await settingsWindow.loadURL(serverUrl + 'settings')
    // Open devTool if the app is not packaged
    // settingsWindow.webContents.openDevTools()
  } else {
    await settingsWindow.loadFile(indexHtml)
  }

  // Make all links open with the browser, not with the application
  settingsWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  settingsWindow.on('close', (event) => {
    event.preventDefault()
    settingsWindow.hide()
  })
}

app.whenReady().then(createTray).then(getDisplays).then(createScreenshotWindows).then(createSettingsWindow).then(registerShortcuts)

app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (mainWindow) {
    // Focus on the main window if the user tried to open another
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('activate', async () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    await createSettingsWindow()
  }
})

app.on('will-quit', () => {
  // Отменяем регистрацию всех сочетаний.
  globalShortcut.unregisterAll()
})

// new window example arg: new windows url
ipcMain.handle('open-win', async (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) {
    await childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    await childWindow.loadURL(`${serverUrl}#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
