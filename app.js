const { app, BrowserWindow } = require('electron');

var win;
var baseUrl = "http://course-villain.herokuapp.com";
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
    win.focus(); // Focus window for user
    win.show(); // Un-hide window
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
  var tempUrl = baseUrl + link.replace('coursevillain://','');
  if (win) win.loadURL(tempUrl);
  mainUrl = tempUrl;
}

app.setAsDefaultProtocolClient('coursevillain');

app.whenReady().then(createWindow); // Start electron app