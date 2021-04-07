const electronInstaller = require('electron-winstaller');

// NB: Use this syntax within an async function, Node does not have support for
//     top-level await as of Node 12.
async function go() {
try {
    console.log("Creating windows installer, wait a few mins...");
    await electronInstaller.createWindowsInstaller({
      appDirectory: '../CVDist/CourseVillain-win32-x64',
      outputDirectory: '../CVDist/out',
      exe: 'coursevillain.exe',
      loadingGif: "./buildResources/win/loading.gif",
      name: "CourseVillain",
      iconUrl: "https://raw.githubusercontent.com/CourseVillain/coursevillain-app/master/buildResources/win/icon.ico",
      setupIcon: "./buildResources/win/icon.ico",
      setupExe: "coursevillain-setup.exe",
      setupMsi: "coursevillain-setup.msi"
    });
    console.log('It worked!');
  } catch (e) {
    console.log(`No dice: ${e.message}`);
    console.log(e);
  }
}

go();