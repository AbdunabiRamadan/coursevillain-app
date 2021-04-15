const {BrowserWindow, app, dialog} = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use the "Stealth Plugin" to bypass Incapsula. This is the page that says "Additional security check is required". Using this plugin disguises the browser so the website can't recognize that it's Puppeteer and Electron
puppeteer.use(StealthPlugin());

// Use existing Electron Chrome instance to load form in new page and automate submission.
module.exports.asyncPuppeteer = async function (docURL, docName, docType, userName, userRelationship, userEmail, callback) {
  // Connect "puppeteer in electron" to the running app
  const browser = await pie.connect(app, puppeteer);
 
  // Create new chrome window
  const window = new BrowserWindow();
  window.maximize();
 
  // Create new page in window using the connected browser and PIE window.
  const page = await pie.getPage(browser, window);

  await page.setViewport({
      width: 1366,
      height: 768
  });
    
  //Wrap everything in a try catch block so we can send the error to the user if there is one
  try {
      // CSS selectors generated from "Get Unique CSS Selector" chrome extension (https://chrome.google.com/webstore/detail/get-unique-css-selector/lkfaghhbdebclkklgjhhonadomejckai)
      // Load the CourseHero page
      await window.loadURL('https://www.coursehero.com/copyright-infringement/');
      // wait for 'submit takedown notice' button, and then click it
      await page.waitForSelector('.takedown-submit-button', {
        timeout: 500000
      });
      await page.click('.takedown-submit-button');
      // check box for 'has posted my copyrighted work without my permission'
      await page.click('div:nth-child(1) > .row .form-check-label');
      // click 'start request form' button
      await page.click('.mr-1');

      // check the box for my company
      await page.click('#impacted-radio-2');
      // enter name
      await page.type('.mt-3 > .row:nth-child(1) .form-control', userName);
      // university name
      await page.type('.mt-3 > .row:nth-child(2) .form-control', 'Embry-Riddle Aeronautical University');
      // relationship with university
      await page.type('.mt-3 > .row:nth-child(3) .form-control', userRelationship);
      // enter the URL of the assignment (CAN ADD MORE THAN 1 AT A TIME BUT ZAC SAID TO FLOOD THEM)
      await page.type('.row:nth-child(1) > .col-sm-8 > .form-control', docURL);
      // document name
      await page.type('.row:nth-child(2) > .col-sm-8 > .form-control', docName);
      // 'type of content' (either note, assessment, homework, lecture, essay, or other). Select 'other', and then enter the type of content that is found
      // first, click on dropdown
      await page.click('.hover-row > .ddi-input');
      // second, select 'other'
      await page.click('#downshift-0-item-5');
      // third, enter type
      await page.type('.col-sm-8 > .form-control:nth-child(1)', docType);

      // address
      await page.type('div:nth-child(1) > .row:nth-child(2) > .col > .form-control:nth-child(2)', '600 S Clyde Morris Blvd');
      // city
      await page.type('div:nth-child(1) > .row:nth-child(3) .form-control', 'Daytona Beach');
      // state
      await page.type('.row:nth-child(4) > .col > .form-control', 'Florida');
      // zip code
      await page.type('.row:nth-child(5) .form-control', '32114');
      // country is default
      // phone
      await page.type('.row:nth-child(2) > .col-sm-9 .form-control', '3862901836');
      // email
      await page.type('.row:nth-child(3) > .col-sm-9 .form-control', userEmail);

      // section4 checkboxes
      await page.click('div:nth-child(1) > .row .form-check-label');
      await page.click('div:nth-child(2) > .row .form-check-label');
      await page.click('div:nth-child(3) > .row .form-check-label');
      await page.click('div:nth-child(4) > .row > .col-sm-11 .form-check-label');

      // digital signature
      await page.type('.col-sm-9 > .form-group > .form-control', userName);

      // can't submit because of captcha -- click captcha button
      // Commented out because this doesn't work in Chromium. The alternative would be to disable security features in Chrome, but this causes the CourseHero website to fail to load because it thinks we are attackers
      // var iframeElement = await page.$('div:nth-child(1) > iframe:nth-child(1)');
      // var frame = await iframeElement.contentFrame();
      // await frame.click('.recaptcha-checkbox-border');

      // Scroll to bottom
      await page.evaluate( () => {
        window.scrollBy(0, window.innerHeight);
      });

      dialog.showMessageBox({
        buttons: ["OK"],
        message: "The form has been filled out. Click the button that says \"I'm not a robot\", complete the challenge, and click \"Submit\" to finish."
      });
  
      // wait for user for 10 minutes to do captcha, check over form, and click submit button
      await page.waitForSelector('.compliance-icon', {
          timeout: 600000
      }).then(() => {
          console.log("Form submitted successfully");
          window.destroy();
          return callback(null);
      });
  } catch (error) {
      console.log("An error occurred with filling out form with puppeteer:");
      console.log(error);
      window.destroy();
      return callback(error);
  }
}