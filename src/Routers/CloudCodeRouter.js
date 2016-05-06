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

      var date = new Date();
      var timestamp = date.toISOString();

      var files = fs.readdirSync(cloudCodeFolderPath);
      var ResponseObject = function () {
        this.version = cloudCodeVersion;
        this.apiKey = fileKey;
        this._id = id;
        this.parseVersion = parseVersion;
        this.timestamp = timestamp;
        this.triggers = {};
      };

      var responseObjects = [];
      var responseObj = new ResponseObject();
      var checksums = {};
      checksums.cloud = {};
      checksums.public = {};

      var userFiles = {};
      userFiles.cloud = {};
      userFiles.public = {};

      for(var i = 0; i < files.length; i++) {
          var file = files[i];
          var filePath = path.join(cloudCodeFolderPath, file);

          var fileContent = fs.readFileSync(filePath, 'utf8');
          var hash = crypto.createHash('md5').update(fileContent).digest('hex');
          var fileStats = fs.statSync(filePath);
          var stamp = fileStats.mtime.toISOString();

          checksums['cloud'][file] = hash;
          userFiles['cloud'][file] = stamp;
      }
      responseObj.checksums = JSON.stringify(checksums);
      responseObj.userFiles = JSON.stringify(userFiles);
      responseObjects.push(responseObj);

      return { response: responseObjects };
    });

    this.route('GET','/scripts/:filename', middleware.promiseEnforceMasterKeyAccess, req => {
      var applicationId = req.config.applicationId;
      var masterKey = req.config.masterKey;

      const config = new Config(applicationId);
      const filesController = config.filesController;

      let cloudCodeFolderPath = path.resolve(__dirname, "../../cloud");
      const filename = req.params.filename;
      var filePath = path.join(cloudCodeFolderPath, filename);
     var fileContent = fs.readFileSync(filePath, 'utf8');

     return { response: fileContent };
    });
  }
}
