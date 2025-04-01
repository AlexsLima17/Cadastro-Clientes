console.log("Electron - Processo principal");

//dialog: módulo electron para ativar caixa de mensagens
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main');
const path = require('node:path');
const { conectar, desconectar } = require('./database.js');

let win;
const createWindow = () => {
  nativeTheme.themeSource = 'light';
  win = new BrowserWindow({
    width: 1010,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  win.loadFile('./src/views/index.html');
};

// Janela Sobre
let about;
function aboutWindow() {
  nativeTheme.themeSource = 'light';
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    about = new BrowserWindow({
      width: 300,
      height: 250,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    });

    about.loadFile('./src/views/sobre.html');

    ipcMain.on('about-exit', () => {
      if (about && !about.isDestroyed()) {
        about.close();
      }
    });
  }
}

// Janela Notas
let note;
function noteWindow() {
  nativeTheme.themeSource = 'light';
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    note = new BrowserWindow({
      width: 400,
      height: 270,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    });

    note.loadFile('./src/views/notas.html'); // Arquivo correto para notas
  }
}

// Inicialização da aplicação
app.whenReady().then(() => {
  createWindow();

  ipcMain.on('db-connect', async (event) => {
    const conectado = await conectar();
    if (conectado) {
      setTimeout(() => {
        event.reply('db-status', "conectado");
      }, 500);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Encerrar a aplicação corretamente
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  await desconectar();
});

// Reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3');

// Template do menu
const template = [
  {
    label: 'Sair',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'Alt+F4',
        click: () => app.quit()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      { label: 'Aplicar zoom', role: 'zoomIn' },
      { label: 'Reduzir', role: 'zoomOut' },
      { label: 'Restaurar o zoom padrão', role: 'resetZoom' },
      { type: 'separator' },
      { label: 'Recarregar', role: 'reload' },
      { type: 'separator' },
      { label: 'DevTools', role: 'toggleDevTools' }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('https://github.com/AlexsLima17/Cadastro-Clientes')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
];

// Confirmação de cliente adicionado ao banco (uso do dialog)
async function adicionarCliente(newClient, event) {
  try {
    await newClient.save();
    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Cliente Adicionado com sucesso",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('resetForm');
      }
    });
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error);
  }
}
