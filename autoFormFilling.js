// Temporary FireFox Puppeteer copyright infringement form filling fix -- Originally built in Selenium, but submit button on form quit working for unknown reason (assuming anti-bot protection on site) so switched to this version and it worked
module.exports.asyncPuppeteer = async function (docURL, docName, docType, userName, userRelationship, userEmail, callback) {
    try {
        const puppeteerFirefox = require('puppeteer-firefox');
        const browser = await puppeteerFirefox.launch({
            headless: false,
        });
        let page = await browser.newPage();
        await page.setViewport({
            width: 1366,
            height: 768
        });
    
        //Wrap everything in a try catch block so we can send the error to the user if there is one
        try {
            // CSS selectors generated from "Get Unique CSS Selector" chrome extension (https://chrome.google.com/webstore/detail/get-unique-css-selector/lkfaghhbdebclkklgjhhonadomejckai)
            // Load the CourseHero page
            await page.goto('https://www.coursehero.com/copyright-infringement/');
            // wait for 'submit takedown notice' button, and then click it
            await page.waitForSelector('.takedown-submit-button')
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
            var iframeElement = await page.$('div:nth-child(1) > iframe:nth-child(1)');
            var frame = await iframeElement.contentFrame();
            await frame.click('.recaptcha-checkbox-border');
        
            // wait for user for 10 minutes to do captcha, check over form, and click submit button
            await page.waitForSelector('.compliance-icon', {
                timeout: 600000
            }).then(() => {
                console.log("Form submitted successfully");
                browser.close();
                return callback(null);
            });
        } catch (error) {
            console.log("An error occurred with filling out form with puppeteer:");
            console.log(error);
            browser.close();
            return callback(error);
        }
    } catch (error) {
        console.log("An error occurred with setting up puppeteer:");
        console.log(error);
        return callback(error);
    }
}

// Original Selenium copyright infringement form filling -- still works, just submit button broke. See comment above
// async function asyncSelenium(docURL, docName, docType, userName, userRelationship, userEmail, callback) {
//     // Imports and Await statements and all your code here 
//     try {
//         require('chromedriver');
//         const {Builder, Key, By, until} = require('selenium-webdriver');
//         const chrome = require('selenium-webdriver/chrome');
//         let driver = await new Builder().forBrowser('chrome')
//             .setChromeOptions(new chrome.Options().headless())
//             .build();
    
//         //Wrap everything in a try catch block so we can send the error to the user if there is one
//         try {
//             // Load the CourseHero page
//             await driver.get('https://www.coursehero.com/copyright-infringement/');
//             // wait for 'submit takedown notice' button for 2 minutes, and then click it
//             await driver.wait(until.elementLocated(By.css('.takedown-submit-button'), 120000)).click();
//             // check box for 'has posted my copyrighted work without my permission'
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div/div/div/div[1]/div/div/div/label')).click();
//             // click 'start request form' button
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div/div/button')).click();

//             // check the box for my company
//             await driver.findElement(By.css('.form-check-label[for=impacted-radio-2]')).click();
//             // enter name
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][1]/div/div/div/div[@class="form-group form-check mt-3"][1]/div/div[1]/div/input')).sendKeys(userName);
//             // university name
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][1]/div/div/div/div[@class="form-group form-check mt-3"][1]/div/div[2]/div/input')).sendKeys('Embry-Riddle Aeronautical University');
//             // relationship with university?
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][1]/div/div/div/div[@class="form-group form-check mt-3"][1]/div/div[3]/div/input')).sendKeys(userRelationship);
//             // enter the URL of the assignment (CAN ADD MORE THAN 1 AT A TIME BUT ZAC SAID TO FLOOD THEM)
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][2]/div/div/div/div/div/div[1]/div/input')).sendKeys(docURL);
//             // document name
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][2]/div/div/div/div/div/div[2]/div/input')).sendKeys(docName);
//             // 'type of content' (either note, assessment, homework, lecture, essay, or other). Select 'other', and then enter the type of content that is found
//             // first, click on dropdown
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][2]/div/div/div/div/div/div[3]/div/div/button')).click();
//             // second, select 'other'
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][2]/div/div/div/div/div/div[3]/div/div/div/div/div[6]')).click();
//             // third, enter type
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][2]/div/div/div/div/div/div[4]/div/textarea')).sendKeys(docType);

//             // address
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][3]/div/div/div/div[1]/div/div/div/div[2]/div/input')).sendKeys('600 S Clyde Morris Blvd');
//             // city
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][3]/div/div/div/div[1]/div/div/div/div[3]/div/input')).sendKeys('Daytona Beach');
//             // state
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][3]/div/div/div/div[1]/div/div/div/div[4]/div/input')).sendKeys('Florida');
//             // zip code
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][3]/div/div/div/div[1]/div/div/div/div[5]/div/input')).sendKeys('32114');
//             // country is default
//             // phone
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][3]/div/div/div/div[2]/div/div/div/div[2]/div/input')).sendKeys('3862901836');
//             // email
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][3]/div/div/div/div[3]/div/div/div/div[2]/div/input')).sendKeys(userEmail);

//             // section4 checkboxes
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][4]/div/div/div/div[1]/div/div/div/label')).click();
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][4]/div/div/div/div[2]/div/div/div/label')).click();
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][4]/div/div/div/div[3]/div/div/div/label')).click();
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][4]/div/div/div/div[4]/div/div/div/label')).click();

//             // digital signature
//             await driver.findElement(By.xpath('/html/body/div/div/div/div/div[3]/div[@class="row"][5]/div/div/div/div/div/div/input')).sendKeys(userName);

//             // can't submit because of captcha -- click captcha button
//             var iframeElement = await driver.findElement(By.xpath('/html/body/div/div/div/div/div[@class="row"][2]/div/div/div/div/div/div/div/iframe'));
//             await driver.switchTo().frame(iframeElement); //5th iframe on the page
//             await driver.findElement(By.css('.recaptcha-checkbox-border')).click();

//             await driver.switchTo().defaultContent();
        
//             // wait for user for 10 minutes to do captcha, check over form, and click submit button
//             await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div/div/h2')), 600000).then(el => {
//                 console.log("Form submitted successfully");
//                 driver.quit();
//                 return callback(true);
//             });
//         } catch (error) {
//             console.log("An error occurred with filling out form with selenium:");
//             console.log(error);
//             driver.quit();
//             return callback(false);
//         }
//     } catch (error) {
//         console.log("An error occurred with setting up selenium:");
//         console.log(error);
//         return callback(false);
//     }
// }