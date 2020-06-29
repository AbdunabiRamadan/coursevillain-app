const { app, BrowserWindow, dialog } = require('electron');
const autoFormFilling = require('./autoFormFilling');

var win;
var loaded = false;
var baseUrl = "https://course-villain.herokuapp.com";
var mainUrl = baseUrl;

// Todo upon startup
function createWindow () {
    win = new BrowserWindow({
        title: "CourseVillain",
        autoHideMenuBar: true,
        useContentSize: true,
        show: false, // Hide while loading content
        titleBarStyle: 'hiddenInset', // Make Mac window pretty
        frame: false // Make Windows window pretty
    });

    win.maximize(); // Maximize window
    win.loadURL(mainUrl); // Load the URL, whether it be app startup (home page) or protocol (email verification)

    // Check if content loaded succesfully
    win.webContents.on("did-finish-load", function() {
      loaded = true; // Set page as loaded so it doesn't get closed by an error later on
      win.focus(); // Focus window for user
      win.show(); // Un-hide window
    });

    // Check if content failed loading
    win.webContents.on("did-fail-load", function() {
      if (!loaded) {
        dialog.showMessageBox({
          buttons: ["OK"],
          message: "CourseVillain appears to be down, so the app will not be able to load. Please try again later."
        });
        app.quit();
      }
    });
}

// Protocol link catching (coursevillain:// URLs)
app.on('will-finish-launching', () => {
  // Mac
  app.on('open-url', function (event, link) {
    event.preventDefault();
    handleProtocolLink(link);
  });
  // Windows
  process.argv.forEach(arg => {
    if (/coursevillain:\/\//.test(arg)) handleProtocolLink(arg);
  })
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
    if (win) win.loadURL(tempUrl);
    mainUrl = tempUrl;
  }
}

app.setAsDefaultProtocolClient('coursevillain');

app.whenReady().then(createWindow); // Start electron app