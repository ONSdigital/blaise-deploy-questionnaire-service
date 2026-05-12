import { type Bucket, type File, type GetSignedUrlConfig, Storage } from "@google-cloud/storage";

import { type Config } from "./config.js";

const SIGNED_URL_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

type file = {
  name?: string;
  updated?: string;
  found: boolean;
};

export default class StorageManager {
  bucket: Bucket;
  storage: Storage;
  bucketName: string;

  constructor(config: Config) {
    this.bucketName = config.BucketName;
    this.storage = new Storage({ projectId: config.ProjectId });
    this.bucket = this.storage.bucket(config.BucketName);
  }

  async GetSignedUrl(filename: string): Promise<string> {
    const options: GetSignedUrlConfig = {
      version: "v4",
      action: "write",
      expires: Date.now() + SIGNED_URL_EXPIRY_MS,
      contentType: "application/octet-stream",
    };

    try {
      const [url] = await this.bucket.file(filename).getSignedUrl(options);

      return url;
    } catch (error: unknown) {
      throw new Error("getSignedUrl Failed", { cause: error });
    }
  }

  async GetBucketItems(): Promise<string[]> {
    const fileList: string[] = [];
    let files: File[];

    try {
      [files] = await this.bucket.getFiles();
    } catch (error: unknown) {
      throw new Error("getBucketItems Failed", { cause: error });
    }

    for (const file of files) {
      if (file.name.endsWith(".bpkg")) {
        fileList.push(file.name);
      }
    }

    return fileList;
  }

  async CheckFile(fileName: string): Promise<file> {
    try {
      const [metadata] = await this.bucket.file(fileName).getMetadata();

      return {
        name: metadata.name,
        updated: metadata.updated,
        found: true,
      };
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 404
      ) {
        return { found: false };
      }

      throw new Error("checkFile Failed", { cause: error });
    }
  }
}
