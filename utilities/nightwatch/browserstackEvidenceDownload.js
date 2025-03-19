const axios = require("axios");
const fs = require("fs");
const https = require("https");
require("dotenv").config();

const username = process.env.BROWSERSTACK_USER;
const password = process.env.BROWSERSTACK_KEY;
const auth = Buffer.from(`${username}:${password}`).toString("base64");

function downloadVideo(url, filename) {
  const directory = "./test_evidence";
  // Sanitize filename to remove potential problematic characters
  const safeFilename = filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase();

  if (!fs.existsSync(directory)) {
    try {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Directory '${directory}' created successfully.`);
    } catch (err) {
      console.error(`Error creating directory '${directory}': ${err.message}`);
      return; // Exit if we cannot create the directory
    }
  }

  const filePath = `${directory}/${safeFilename}`;
  const file = fs.createWriteStream(filePath);

  const request = https.get(url, (response) => {
    response.pipe(file);

    file.on("finish", () => {
      file.close();
      console.log(`Downloaded '${safeFilename}' successfully.`);
    });
  });
  request.on("error", (err) => {
    console.error(`Error during request: ${err.message}`);
    fs.unlinkSync(filePath);
  });

  file.on("error", (err) => {
    console.error(`Error writing file '${safeFilename}': ${err.message}`);
    fs.unlinkSync(filePath);
    file.close();
  });
}

// fetch session data for a given build hashed_id
function getSessionData(hashedId) {
  axios({
    method: "get",
    url: `https://api.browserstack.com/automate/builds/${hashedId}/sessions.json`,
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
    .then((response) => {
      response.data.forEach((session) => {
        const videoUrl = session.automation_session.video_url;
        downloadVideo(
          videoUrl,
          `${hashedId}-${session.automation_session.name}.mp4`,
        );
      });
    })
    .catch((error) => console.error(error));
}

function processBuilds(data) {
  data
    .filter((build) =>
      build.automation_build.name.includes(process.env.TEST_EXECUTION_KEY),
    )
    .forEach((build) => {
      const hashedId = build.automation_build.hashed_id;
      getSessionData(hashedId);
    });
}

function getBuilds() {
  axios({
    method: "get",
    url: "https://api.browserstack.com/automate/builds.json",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
    .then((response) => {
      processBuilds(response.data);
    })
    .catch((error) => console.error(error));
}

function start() {
  getBuilds();
}

start();
