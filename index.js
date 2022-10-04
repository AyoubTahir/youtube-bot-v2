import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer";

const testMode = true;

const accountEmail = "";
const accountPassword = "";

const videosLinks = [
  "https://www.youtube.com/watch?v=QHLPZgezlhg",
  "https://www.youtube.com/watch?v=P92H2I2Wrqc",
  "https://www.youtube.com/watch?v=9mK8YIckmfI",
];

const commentMessages = [
  "ayoub tahir",
  "anas elouiri",
  "achraf faraj",
  "mouad badi",
];

const minCommentPerVideo = 5;
const maxCommentPerVideo = 10;

const minDelayBettwencomments = 10;
const maxDelayBettwencomments = 30;

const minDelayBettwenVideos = 10;
const maxDelayBettwenVideos = 15;

(async () => {
  puppeteerExtra.use(stealthPlugin());
  const browser = await puppeteerExtra.launch({
    args: [
      "--start-maximized",
      /*"disable-gpu",
      "--disable-infobars",
      "--disable-extensions",
      "--ignore-certificate-errors"
      ,*/
    ],
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    defaultViewport: null,
    executablePath:
      "C://Program Files//Google//Chrome//Application//chrome.exe",
  });

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);

  //GO TO YOUTUBE
  await page.goto("https://www.youtube.com");

  console.log("Navigating to youtube home page");

  let loginButtonSelector =
    "div#masthead-container .style-scope.ytd-masthead #buttons a.yt-simple-endpoint.style-scope.ytd-button-renderer";

  try {
    await page.waitForSelector(loginButtonSelector);
  } catch (err) {
    loginButtonSelector =
      "div#masthead-container .style-scope.ytd-masthead #buttons .yt-spec-button-shape-next.yt-spec-button-shape-next--outline.yt-spec-button-shape-next--call-to-action";
  }

  try {
    //SIGN IN TO GOOGLE ACCOUNT
    await page.waitForSelector(loginButtonSelector);
    await page.waitForTimeout(2000);
    await page.click(loginButtonSelector);

    console.log("\nStart Login");

    //ENTER EMAIL
    await page.waitForSelector("input[name='identifier']");
    await page.waitForTimeout(2000);
    await page.type("input[name='identifier']", accountEmail, {
      delay: 150,
    });

    //NEXT TO PASSWORD
    await page.waitForTimeout(2000);
    await page.click(".F9NWFb button.VfPpkd-LgbsSe");

    //ENTER PASSWORD
    await page.waitForSelector("input[name='Passwd']");
    await page.waitForTimeout(2000);
    await page.type("input[name='Passwd']", accountPassword, {
      delay: 150,
    });

    //LOGIN
    await page.waitForTimeout(2000);
    await page.click(".F9NWFb button.VfPpkd-LgbsSe");

    console.log("\nLogin successfully");

    await page.waitForTimeout(6000);
  } catch (err) {
    console.log("\nAlredy Sign in!!!");
  }

  console.log(
    "\n--------------" +
      videosLinks.length +
      " videos to work on----------------\n"
  );

  for (let j = 0; j < videosLinks.length; j++) {
    //GO TO YOUTUBE video
    await page.goto(videosLinks[j]);

    console.log("Working on the video number " + (j + 1));
    //STOP VIDEO
    await page.waitForSelector("div.html5-video-container video");
    await page.waitForTimeout(5000);
    await page.click("div.html5-video-container video");

    let needToSkipWaiting = true;

    try {
      //CHECK IF ALREADY SIGN IN
      await page.waitForSelector(
        "div#masthead-container .style-scope.ytd-masthead #buttons button#avatar-btn"
      );

      await page.evaluate(function () {
        //SCROLL TO THE FIRST COMMENT
        var scrollDiv = document.querySelector(
          "[id='upload-info'] .style-scope"
        ).offsetTop;
        window.scrollTo({ top: scrollDiv, behavior: "smooth" });
      });

      await page.waitForTimeout(1000);

      const numberOfCommentsString = await page.evaluate(function () {
        //RETURN NUMBER OF COMMENTS
        return document.querySelector(
          "div#header div#title h2#count span.style-scope.yt-formatted-string"
        ).innerText;
      });

      const numberOfComments = parseInt(
        numberOfCommentsString.split(",").join("")
      );

      const numberNeedToComment = getRnd(
        minCommentPerVideo,
        maxCommentPerVideo
      );

      await page.waitForTimeout(2000);

      //STAST LOOPING OVER COMMENTS
      console.log("\nThis video has " + numberOfComments + " comments");
      if (numberOfComments > 1) {
        needToSkipWaiting = false;
        console.log(
          "I will do just " + numberNeedToComment + " for this video"
        );
        for (
          let i = 2;
          i <= numberOfComments && i <= numberNeedToComment + 1;
          i++
        ) {
          //CHECK IF COMMENT EXIST
          try {
            await page.waitForSelector("div#contents > :nth-child(" + i + ")");
          } catch (err) {
            console.log("\nError Skip");
            break;
          }
          //SCROLL TO COMMENTS ONE BY ONE
          await page.evaluate(function (arg1) {
            var scrollDiv = document.querySelector(
              "div#contents > :nth-child(" + arg1 + ")"
            ).offsetTop;
            window.scrollTo({ top: scrollDiv, behavior: "smooth" });
          }, i);

          console.log("\nStart replaying in the comment number " + (i - 1));
          //CLICK REPLAY BUTTON TO START COMMENTING
          await page.waitForSelector(
            "div#contents > :nth-child(" +
              i +
              ") a.yt-simple-endpoint.style-scope.ytd-button-renderer"
          );
          await page.waitForTimeout(3000);
          await page.click(
            "div#contents > :nth-child(" +
              i +
              ") a.yt-simple-endpoint.style-scope.ytd-button-renderer"
          );

          //WRITE COMMENT
          await page.waitForSelector(
            "div#contents > :nth-child(" +
              i +
              ") div[id='contenteditable-root']"
          );
          await page.waitForTimeout(3000);
          await page.type(
            "div#contents > :nth-child(" +
              i +
              ") div[id='contenteditable-root']",
            commentMessages[Math.floor(Math.random() * commentMessages.length)],
            {
              delay: 150,
            }
          );

          if (!testMode) {
            //CLICK REPLAY BUTTON
            await page.waitForSelector(
              "div#contents > :nth-child(" +
                i +
                ") div#buttons a.yt-simple-endpoint.style-scope.ytd-button-renderer .style-primary"
            );
            await page.waitForTimeout(5000);
            await page.click(
              "div#contents > :nth-child(" +
                i +
                ") div#buttons a.yt-simple-endpoint.style-scope.ytd-button-renderer .style-primary"
            );
          }
          console.log("\nDone");

          let rDelay = getRnd(minDelayBettwencomments, maxDelayBettwencomments);
          //WAII ? MIN TO COMMENT ON THE NEXT ONE
          console.log(
            "\nWaiting " + rDelay + "s for the next comment to replay on"
          );
          await page.waitForTimeout(rDelay * 1000);
          console.log("\n---->");
        }
      } else {
        console.log("So i will skip it");
      }
    } catch (err) {
      console.log("\nCant Sign in");
    }

    if (!needToSkipWaiting) {
      let vDelay = getRnd(minDelayBettwenVideos, maxDelayBettwenVideos);
      console.log("\nWaiting " + vDelay + "s for the next video");
      await page.waitForTimeout(vDelay * 1000);
    }
    console.log("\n---------------***---------------\n");
  }

  console.log("finished!!");
})();

function getRnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
