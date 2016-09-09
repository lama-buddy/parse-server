// FilesController.js
import { Parse } from 'parse/node';
import { randomHexString } from '../cryptoUtils';
import AdaptableController from './AdaptableController';
import { FilesAdapter } from '../Adapters/Files/FilesAdapter';
import path  from 'path';
import mime from 'mime';

const legacyFilesRegex = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-.*");

export class FilesController extends AdaptableController {

  getFileData(config, filename) {
    return this.adapter.getFileData(filename);
  }

  createFile(config, filename, data, contentType) {

    let extname = path.extname(filename);

    const hasExtension = extname.length > 0;

    if (!hasExtension && contentType && mime.extension(contentType)) {
      filename = filename + '.' + mime.extension(contentType);
    } else if (hasExtension && !contentType) {
      contentType = mime.lookup(filename);
    }

    filename = randomHexString(32) + '_' + filename;

    var location = this.adapter.getFileLocation(config, filename);
    return this.adapter.createFile(filename, data, contentType).then(() => {
      return Promise.resolve({
        url: location,
        name: filename
      });
    });
  }

  deleteFile(config, filename) {
    return this.adapter.deleteFile(filename);
  }

  /**
   * Find file references in REST-format object and adds the url key
   * with the current mount point and app id.
   * Object may be a single object or list of REST-format objects.
   */
  expandFilesInObject(config, object) {
    if (object instanceof Array) {
      object.map((obj) => this.expandFilesInObject(config, obj));
      return;
    }
    if (typeof object !== 'object') {
      return;
    }
    for (let key in object) {
      let fileObject = object[key];
      if (fileObject && fileObject['__type'] === 'File') {
        if (fileObject['url']) {
          continue;
        }

        let filename = fileObject['name'];
        // all filenames starting with "tfss-" should be from files.parsetfss.com
        // all filenames starting with a "-" seperated UUID should be from files.parse.com
        // all other filenames have been migrated or created from Parse Server
        if (config.fileKey === undefined || config.fileKey === '') {
          // no legacy files, so all new files have no dashes in UUID. fix up fileObject['name'] to have dashes so filename is displayed correctly in the client apps
          fileObject['name'] =  this.getExpandedFileName(filename);
          fileObject['url'] = this.adapter.getFileLocation(config, filename);
        } else {
          // mix of some legacy files and local files
          if (filename.indexOf('tfss-') === 0) {
            fileObject['url'] = 'http://files.parsetfss.com/' + config.fileKey + '/' + encodeURIComponent(filename);
          } else if (legacyFilesRegex.test(filename)) {
            fileObject['url'] = 'http://files.parse.com/' + config.fileKey + '/' + encodeURIComponent(filename);
          } else {
            // local files without dashes in UUID. fix up fileObject['name'] to have dashes so filename is displayed correctly in the client apps
            fileObject['name'] =  this.getExpandedFileName(filename);
            fileObject['url'] = this.adapter.getFileLocation(config, filename);
          }
        }
      }
    }
  }

  expectedAdapterType() {
    return FilesAdapter;
  }

  getFileStream(config, filename) {
    return this.adapter.getFileStream(filename);
   }

   getExpandedFileName(filename) {
     // add the dashes into the UUID and put a - instead of _ before filename
     var updatedFileName = filename.substring(0,8) + "-" + filename.substring(8,12) + "-" + filename.substring(12,16) +
      "-" + filename.substring(16,20) + "-" + filename.substring(20,32) + '-' + filename.substring(33);

      return updatedFileName;
   }
}

export default FilesController;
