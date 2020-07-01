const { app, BrowserWindow, dialog, shell } = require('electron');
const autoFormFilling = require('./autoFormFilling');

var mainWindow;
var loaded = false;
var baseUrl = "https://course-villain.herokuapp.com";
var mainUrl = baseUrl;
const singleInstanceLock = app.requestSingleInstanceLock();

// Todo upon startup
function createWindow () {
    mainWindow = new BrowserWindow({
        title: "CourseVillain",
        autoHideMenuBar: true,
        useContentSize: true,
        show: false, // Hide while loading content
        titleBarStyle: 'hiddenInset', // Make Mac window pretty
        frame: true // Add frame around Windows window
    });

    mainWindow.maximize(); // Maximize window
    mainWindow.loadURL(mainUrl); // Load the URL, whether it be app startup (home page) or protocol (email verification)

    // Check if content loaded succesfully
    mainWindow.webContents.on("did-finish-load", function() {
      loaded = true; // Set page as loaded so it doesn't get closed by an error later on
      mainWindow.focus(); // Focus window for user
      mainWindow.show(); // Un-hide window
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

if (!singleInstanceLock) {
  app.quit(); // Quit any additional instances opened. Below code catches additional instance.
} else {
  // Catch any additional instances of app that are created
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore() // Restore window if minimized
      mainWindow.focus() // Focus window

      if (process.platform == 'win32') handleProtocolLink(argv.filter(arg => arg.includes("coursevillain:///"))[0]); // Protocol link catching on Windows
    }
  });

  app.whenReady().then(createWindow); // Start first instance of electron app
}