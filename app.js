const { app, BrowserWindow, dialog, shell } = require('electron');
const autoFormFilling = require('./autoFormFilling');
const pie = require("puppeteer-in-electron");

var mainWindow;
var loaded = false;
var baseUrl = "https://course-villain.herokuapp.com";
var mainUrl = baseUrl;
const singleInstanceLock = app.requestSingleInstanceLock();

if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

// Todo upon startup
function createWindow () {
    mainWindow = new BrowserWindow({
        title: "CourseVillain",
        autoHideMenuBar: true,
        useContentSize: true,
        show: false,
        titleBarStyle: 'hiddenInset', // Make Mac window pretty
        frame: true // Add frame around Windows window
    });
    mainWindow.loadURL(mainUrl); // Load the URL, whether it be app startup (home page) or protocol (email verification)

    var loadClosed = false;

    // Display loading screen
    var loadWindow = new BrowserWindow({
      frame: false,
      transparent: true,
      width: 250,
      height: 250,
      resizable: false
    });
    loadWindow.loadFile('appResources/loading.html');
    loadWindow.on('close', function(e) {
      loadClosed = true;
    });
    loadWindow.focus(); // Place load window on top

    // Check if content loaded succesfully
    mainWindow.webContents.on("did-finish-load", function() {
      loaded = true; // Set page as loaded so it doesn't get closed by an error later on
      mainWindow.maximize(); // Maximize window
      mainWindow.focus(); // Focus window for user
      mainWindow.show(); // Un-hide window

      if (!loadClosed) loadWindow.close(); // Close loading window
    });

    // Check if content failed loading
    mainWindow.webContents.on("did-fail-load", function() {
      if (!loaded) {
        dialog.showMessageBox({
          buttons: ["OK"],
          message: "CourseVillain appears to be down, so the app will not be able to load. Please try again later."
        });
        app.quit();
      }
    });

    // Catches external links being opened and redirects them to user's browser
    mainWindow.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      if (!url.includes(baseUrl)) shell.openExternal(url);
    });
}

// Protocol link catching on Mac
app.on('will-finish-launching', () => {
  // Mac
  app.on('open-url', function (event, link) {
    event.preventDefault();
    handleProtocolLink(link);
  });
});

function handleProtocolLink(link) {
  if (!link) return;
  
  link = link.replace('coursevillain://',''); // Remove protocol from link

  if (link.includes("autoFormFilling")) {
    var data = Object.fromEntries(new URLSearchParams(link.replace('/autoFormFilling?', ''))); // Turn link params into object

    // Initiate auto-form filling
    autoFormFilling.asyncPuppeteer(data.docURL, data.docName, data.docType, data.userName, data.userRelationship, data.userEmail, function (err) {
      if (err) {
        dialog.showMessageBox({
          buttons: ["OK"],
          message: "The form did not submit. The following error occurred while automatically filling out the form:\n\n" + err
        });
      } else {
        dialog.showMessageBox({
          buttons: ["OK"],
          message: "The form was submitted successfully."
        });
      }
    });
  } else {
    var tempUrl = baseUrl + link;
    if (mainWindow) mainWindow.loadURL(tempUrl);
    mainUrl = tempUrl;
  }
}

app.setAsDefaultProtocolClient('coursevillain'); // Set protocol link (coursevillain://)

// Initialize "puppeteer in electron" with app to be used later
pie.initialize(app);

if (!singleInstanceLock) {
  app.quit(); // Quit any additional instances opened. Below code catches additional instance.
} else {
  // Catch any additional instances of app that are created
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore() // Restore window if minimized
      mainWindow.focus() // Focus window

      var protocolLink = argv.find(arg => arg.includes("coursevillain:///"));

      if (process.platform == 'win32') handleProtocolLink(protocolLink); // Protocol link catching on Windows
    }
  });

  // On initial app startup, if there's a protocol link, use it!!
  var potentialProtocolLink = process.argv.find(arg => arg.includes("coursevillain://"));
  if (potentialProtocolLink) handleProtocolLink(potentialProtocolLink);

  app.whenReady().then(createWindow); // Start first instance of electron app
}

function handleSquirrelEvent(application) {
  if (process.argv.length == 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      application.quit();
      return true;
  }
};