/* eslint-disable no-debugger */
/* eslint-disable no-nested-ternary */
import axios from 'axios';
import 'filepond/dist/filepond.min.css';
import * as PropTypes from 'prop-types';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';

import { deleteFile, uploadFile } from 'src/services/firebase/firestorage/helpers';

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);
export default function FilePondFirebaseInputField({
  label,
  hint,
  name,
  multiple,
  maxFiles,
  value,
  setValue,
  validateFile,
  acceptedFileTypes,
  required,
  uploadBasePath,
}) {
  return (
    <FilePond
      allowFileTypeValidation
      label={label}
      files={(value ? (multiple ? value : [value]) : [])?.map((f) => ({
        source: f,
        options: {
          type: 'local',
        },
      }))}
      onaddfilestart={({ file }) => {
        if (file && file.size > 0) {
          if (validateFile && !validateFile(file)) {
            /* empty */
            throw new Error('Select a valid file.');
          }
        }
      }}
      allowMultiple={multiple}
      maxFiles={maxFiles}
      required={required}
      acceptedFileTypes={acceptedFileTypes}
      name={name}
      labelIdle={hint}
      server={{
        /// The custom remove method receives the local file source and a load and error callback.
        remove: async (downloadUrl, load, error) => {
          console.debug('file_pond_server_remove');

          try {
            await deleteFile(downloadUrl);
          } catch (e) {
            error(e?.message ?? 'An error occured when removing this file from the server.');
          }

          load();
        },

        /// Custom revert methods receive the unique server file id and a load and error callback.
        revert: (uniqueFileId, load, error) => {
          console.debug('file_pond_server_revert');

          // Should remove the earlier created temp file here
          // ...

          // Can call the error method if something is wrong, should exit after
          error('oh my goodness');

          // Should call the load method when done, no parameters required
          load();
        },

        /// The custom process function receives a file object plus a set of FilePond callback methods to return control to FilePond. The file parameter contains the native file object (instead of a FilePond file item) access the file item is restricted in the process function to prevent setting properties or running functions that would would contradict or interfere with the current processing of the file.
        process: async (_, file, metadata, load, error, progress, abort) => {
          console.debug('file_pond_server_process');

          const fileID = generateId();

          uploadFile({
            filePath: `${uploadBasePath}/${fileID}`,
            file,
            metadata,
            onProgressBytes: (bytesTransferred, totalBytes) => {
              progress(true, bytesTransferred, totalBytes);
            },
            onError: (e) => {
              error(e?.message ?? 'An error occured when uploading your files to the server.');
              abort();
            },
            onSuccess: (fileUploadedUrl) => {
              setValue(multiple ? [fileUploadedUrl, ...(value ?? [])] : fileUploadedUrl);

              load(fileUploadedUrl);
            },
          });

          // Should expose an abort method so the request can be cancelled
          return {
            abort: () => {
              // This function is entered if the user has tapped the cancel button
              // request.abort();

              // Let FilePond know the request has been cancelled
              abort();
            },
          };
        },

        /// Custom load methods receive the local file source, and the callback methods: load, error, abort, and headers.
        load: async (downloadUrl, load, error, progress, abort) => {
          console.debug('file_pond_server_load');

          progress(true, 0, 1024);

          axios
            .get(downloadUrl, {
              responseType: 'blob',
              onDownloadProgress: ({ loaded, total }) => {
                progress(true, loaded, total);
              },
            })
            .then((res) => {
              const fileID = getUniqId(downloadUrl);

              load(new File([res.data], `${fileID}.png`, { type: 'image/png' }));
            })
            .catch((e) => {
              error(e?.message ?? 'An error occured when loading your files from the server.');
              abort();
            });

          // Should expose an abort method so the request can be cancelled
          return {
            abort: () => {
              // User tapped cancel, abort our ongoing actions here

              // Let FilePond know the request has been cancelled
              abort();
            },
          };
        },

        /// The custom fetch method receives the url to fetch and a set of FilePond callback methods to return control to FilePond.
        fetch: (url, load, error, progress, abort, _) => {
          console.debug('file_pond_server_fetch');

          progress(true, 0, 1024);

          axios
            .get(url, {
              responseType: 'blob',
              headers: {
                // 'Access-Control-Allow-Origin': '*',
              },
              onDownloadProgress: ({ loaded, total }) => {
                progress(true, loaded, total);
              },
            })
            .then((res) => {
              const fileID = getUniqId(url);

              load(new File([res.data], `${fileID}.png`, { type: 'image/png' }));
            })
            .catch((e) => {
              error(e?.message ?? 'An error occured when loading your files from the server.');
              abort();
            });

          // Should expose an abort method so the request can be cancelled
          return {
            abort: () => {
              // User tapped cancel, abort our ongoing actions here

              // Let FilePond know the request has been cancelled
              abort();
            },
          };
        },

        /// Custom restore methods receive the server file id of the file to restore and a set of FilePond callback methods to return control to FilePond.
        restore: async (downloadUrl, load, error, progress, abort, _) => {
          console.debug('file_pond_server_restore');

          progress(true, 0, 1024);

          axios
            .get(downloadUrl, {
              responseType: 'blob',
              onDownloadProgress: ({ loaded, total }) => {
                progress(true, loaded, total);
              },
            })
            .then((res) => {
              const fileID = getUniqId(downloadUrl);

              load(new File([res.data], `${fileID}.png`, { type: 'image/png' }));
            })
            .catch((e) => {
              error(e?.message ?? 'An error occured when loading your files from the server.');
              abort();
            });

          // Should expose an abort method so the request can be cancelled
          return {
            abort: () => {
              // User tapped cancel, abort our ongoing actions here

              // Let FilePond know the request has been cancelled
              abort();
            },
          };
        },
      }}
    />
  );
}

function generateId() {
  return Math.floor(Math.random() * (999999999999999 - 100000000000000 + 1)) + 100000000000000;
}

function getUniqId(downloadUrl) {
  const paths = downloadUrl.split('%2F');

  const fileName = paths[paths.length - 1].split('?')[0];

  if (fileName.includes('.')) {
    return fileName.split('.')[0];
  }

  return fileName;
}

FilePondFirebaseInputField.propTypes = {
  label: PropTypes.string,
  hint: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.any,
  setValue: PropTypes.func,
  multiple: PropTypes.bool,
  validateFile: PropTypes.func,
  maxFiles: PropTypes.number,
  required: PropTypes.bool,
  acceptedFileTypes: PropTypes.array,
  uploadBasePath: PropTypes.string,
};

FilePondFirebaseInputField.defaultProps = {
  multiple: false,
  maxFiles: 1,
  required: true,
  acceptedFileTypes: ['*/*'],
  uploadBasePath: 'images',
};
