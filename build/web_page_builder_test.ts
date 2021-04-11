import express = require("express");
import fs = require("fs");
import http = require("http");
import path = require("path");
import puppeteer = require("puppeteer");
import { buildWebPages } from "./web_page_builder";
import { assertThat, containStr, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";
import { registerWebPageHandlers } from "@selfage/web_page_handler";

let HOST_NAME = "localhost";
let PORT = 8000;
let HOST_URL = `http://${HOST_NAME}:${PORT}`;

async function createServer(app: express.Express): Promise<http.Server> {
  let server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen({ host: HOST_NAME, port: PORT }, () => resolve());
  });
  return server;
}

async function closeServer(server: http.Server): Promise<void> {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
}

async function unlinkCommonBuiltFiles(): Promise<void> {
  await Promise.all([
    fs.promises.unlink(
      "./test_data/build/web_page_builder/browser-source-map-support.js.gz"
    ),
    fs.promises.unlink("./test_data/build/web_page_builder/environment.js"),
    fs.promises.unlink("./test_data/build/web_page_builder/base.js"),
    fs.promises.unlink("./test_data/build/web_page_builder/simple_page.js"),
    fs.promises.unlink("./test_data/build/web_page_builder/simple_page_bin.js"),
    fs.promises.unlink(
      "./test_data/build/web_page_builder/simple_page_bin.js.gz"
    ),
    fs.promises.unlink(
      "./test_data/build/web_page_builder/simple_page_bin.html"
    ),
    fs.promises.unlink(
      "./test_data/build/web_page_builder/simple_page_bin.html.gz"
    ),
    fs.promises.unlink(
      "./test_data/build/web_page_builder/simple_not_found.js"
    ),
    fs.promises.unlink(
      "./test_data/build/web_page_builder/simple_not_found_bin.js"
    ),
    fs.promises.unlink(
      "./test_data/build/web_page_builder/simple_not_found_bin.js.gz"
    ),
    fs.promises.unlink(
      "./test_data/build/web_page_builder/simple_not_found_bin.html"
    ),
    fs.promises.unlink(
      "./test_data/build/web_page_builder/simple_not_found_bin.html.gz"
    ),
  ]);
}

TEST_RUNNER.run({
  name: "WebPageBuilderTest",
  cases: [
    {
      name: "BuildProdEnvironmentWithSourceMapping",
      execute: async () => {
        // Prepare
        let app = express();
        let server = await createServer(app);
        let browser = await puppeteer.launch();
        let page = await browser.newPage();
        let errorPromsie = new Promise<string>((resolve) => {
          page.on("pageerror", (err) => {
            resolve(err.message);
          });
        });

        // Execute
        await buildWebPages(
          "./test_data/build/web_page_builder",
          "./test_data/build/web_page_builder/tsconfig.json",
          "./test_data/build/web_page_builder/environment_prod.ts",
          true
        );

        // Verify
        await registerWebPageHandlers(
          app,
          path.join(__dirname, "../test_data/build/web_page_builder")
        );
        let res = await page.goto(`${HOST_URL}/some_page`);
        assertThat(res.status(), eq(200), "status");
        assertThat(
          await errorPromsie,
          containStr("Prod execute: 60"),
          `error message`
        );
        assertThat(
          await errorPromsie,
          containStr("simple_page.ts"),
          `error stack`
        );

        // Cleanup
        await Promise.all([
          browser.close(),
          closeServer(server),
          fs.promises.unlink(
            "./test_data/build/web_page_builder/environment_prod.js"
          ),
          unlinkCommonBuiltFiles(),
        ]);
      },
    },
    {
      name: "BuildAndReturnNotFound",
      execute: async () => {
        // Prepare
        let app = express();
        let server = await createServer(app);
        let browser = await puppeteer.launch();
        let page = await browser.newPage();
        let logPromise = new Promise<string>((resolve) => {
          page.on("console", (msg) => {
            if (msg.type() === "log") {
              resolve(msg.text());
            }
          });
        });

        // Execute
        await buildWebPages(
          "./test_data/build/web_page_builder",
          "./test_data/build/web_page_builder/tsconfig.json"
        );

        // Verify
        await registerWebPageHandlers(
          app,
          path.join(__dirname, "../test_data/build/web_page_builder")
        );
        let res = await page.goto(`${HOST_URL}/not_found`);
        assertThat(res.status(), eq(404), "status");
        assertThat(await logPromise, containStr("Wow! Not found!"), `log`);

        // Cleanup
        await Promise.all([
          browser.close(),
          closeServer(server),
          unlinkCommonBuiltFiles(),
        ]);
      },
    },
  ],
});
