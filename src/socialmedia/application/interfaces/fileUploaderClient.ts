import ReadStream = NodeJS.ReadStream;

export type File = {
  filename: string;
  mimetype: string;
  encoding: string;
  stream?: ReadStream;
}

export type UploadedFileResponse = {
  filename: string;
  mimetype: string;
  encoding: string;
  url: string;
}

export interface FileUploaderClient {
  upload: (
      { file }: { file: Promise<File> }
  ) => Promise<UploadedFileResponse>;
}
