const glob = require("glob");
const express = require("express");
const app = express();
const { readFileSync, statSync } = require("fs");
const path = require("path");

const { DIST_NAME } = require("../../webpack.common");

import roomRouter from "./room";

const getPort = (port) => {
  if (statSync("../demo.port")) {
    try {
      port = parseInt(readFileSync("../demo.port"));
    } catch (ex) {
      console.log(ex);
    }
  }
  if (process.env.SITE_PORT) {
    try {
      port = parseInt(process.env.SITE_PORT);
    } catch (ex) {
      // Suppress exception
      console.log("Exception parsing SITE_PORT: ", ex);
    }
  }
  const args = process.argv.slice(2);
  if (args.length > 0) {
    try {
      port = parseInt(args[0]);
    } catch (ex) {
      // Suppress exception
      console.log("Exception parsing site port from first argument: ", ex);
    }
  }
  return port;
};
const port = getPort(3000);

const getRootPath = () => {
  if (process.env.SITE_ROOT) {
    return process.env.SITE_ROOT;
  }
  return "";
};
const root = getRootPath();

app.use("/", roomRouter);

async function getDemos() {
  return new Promise((respond, reject) => {
    glob("../www/*.html", {}, function (err, files) {
      if (err) {
        reject(err);
      }
      // files is an array of filenames.
      respond(
        files.map((file) => {
          const m = file.match(/www\/(\w+)\.html/);
          [1];
          return m ? m[1] : null;
        })
      );
    });
  });
}

app.get(root, async (req, res) => {
  res.sendFile(path.resolve(process.cwd() + "/../www/index.html"));
});

app.get(root + "/@:worldEnv", async (req, res) => {
  res.sendFile(path.resolve(process.cwd() + "/../www/index.html"));
});

app.use(root, express.static("../src"));
app.use(root, express.static("../dist"));
app.use(root, express.static("../www"));

app.listen(port, () => {
  console.log(
    `See ${DIST_NAME} build information at http://localhost:${port}${root}`
  );
});
