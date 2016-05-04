import { version }     from '../../package.json';
import PromiseRouter   from '../PromiseRouter';
import * as middleware from "../middlewares";
import Config from '../Config';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

//import mime from 'mime';

export class CloudCodeRouter extends PromiseRouter {
  mountRoutes() {
    this.route('GET','/releases/latest', middleware.promiseEnforceMasterKeyAccess, req => {
      const parseURL = "https://aux.parse.buddy.com/";
      let cloudCodeFolderPath = path.resolve(__dirname, "../../cloud");

      // get the latest version from parseURL+"app/current"
      const cloudCodeVersion = "v6";

      // apiKey
      var applicationId = req.config.applicationId;
      var masterKey = req.config.masterKey;
      var restAPIKey = req.config.restAPIKey;
      var fileKey = req.config.fileKey;
      const config = new Config(applicationId);
      const filesController = config.filesController;
      // _id is not unused
      const id = "sQcFtb9guw"; // can be a random Number

      // parse version
      const parseVersion = version;

      //var timeStamp = Date.now().toISOString();
      var date = new Date();
      var timestamp = date.toISOString();

      var files = fs.readdirSync(cloudCodeFolderPath);

      for(var i = 0; i < files.length; i++) {
          var filePath = path.join(cloudCodeFolderPath, files[i]);

          var fileContent = fs.readFileSync(filePath, 'utf8');
          var hash = crypto.createHash('md5').update(fileContent).digest('hex');
          // const hash = crypto.createHash("sha256");
          // hash.update(fileContent);
          // const hashResult = hash.digest("hex");

          console.log(hash);
          //var file = fs.statSync(filePath);

          // if (file.isDirectory()) {
          //     rmdirRecursiveSync(filePath);
          // }
          // else {
          //     fs.unlinkSync(filePath);
          // }
      }
      //console.log(timestamp);
// ```    GET     /app/cloudcode/{version}.zip (com.buddy.parse.aux.resource.AppResource)
//     POST    /app/cloudcode/{version}.zip (com.buddy.parse.aux.resource.AppResource)
//     GET     /app/current (com.buddy.parse.aux.resource.AppResource)
//     POST    /app/current
//[{"version":"v6","apiKey":"92014eb8-2fcf-4c2e-9451-2498e4d10d37","_id":"sQcFtb9guw","parseVersion":"1.4.2","timestamp":"2015-07-13T12:26:57.114Z","triggers":{},"checksums":"{\"cloud\":{\"main.js\":\"7e6e1872caf1c8fe1fd35758dbe96f30\"},\"public\":{\"index.html\":\"a9d71ca772c4fb43973b93322f3c39a5\"}}","userFiles":"{\"cloud\":{\"main.js\":\"2015-07-13T12:26:56.805Z\"},\"public\":{\"index.html\":\"2015-07-07T20:21:48.003Z\"}}"}]

      return { response:
        [{"version":cloudCodeVersion,"apiKey":fileKey,"_id":id,"parseVersion":parseVersion,"timestamp": timestamp,"triggers":{},"checksums":"{\"cloud\":{\"main.js\":\"7e6e1872caf1c8fe1fd35758dbe96f30\"},\"public\":{\"index.html\":\"a9d71ca772c4fb43973b93322f3c39a5\"}}","userFiles":"{\"cloud\":{\"main.js\":\"2015-07-13T12:26:56.805Z\"},\"public\":{\"index.html\":\"2015-07-07T20:21:48.003Z\"}}"}]
      };
    });

    this.route('GET','/scripts/:filename', middleware.promiseEnforceMasterKeyAccess, req => {
      const filename = req.params.filename;
      //const config = new Config(req.params.appId);
      //const filesController = config.filesController;

      // filesController.getFileData(config, "/Users/lama/Downloads/main.js").then((data) => {
      //   res.status(200);
      //   var contentType = mime.lookup(filename);
      //   res.set('Content-Type', contentType);
      //   res.end(data);
      // }).catch((err) => {
      //   res.status(404);
      //   res.set('Content-Type', 'text/plain');
      //   res.end('File not found.');
      // });
      return { response: "hello" };
    });
  }
}
