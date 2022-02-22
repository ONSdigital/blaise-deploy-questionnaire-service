import { Storage, Bucket, GetSignedUrlConfig } from "@google-cloud/storage";
import { EnvironmentVariables } from "../config";

export type file = {
  name?: string
  updated?: string
  found: boolean
}

export default class StorageManager {
  bucket: Bucket;
  storage: Storage;
  bucketName: string;

  constructor(config: EnvironmentVariables) {
    this.bucketName = config.BucketName;
    this.storage = new Storage({ projectId: config.ProjectId });
    this.bucket = this.storage.bucket(config.BucketName);
  }

  async GetSignedUrl(filename: string): Promise<string> {
    const options: GetSignedUrlConfig = {
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: "application/octet-stream",
    };

    try {
      return await this.bucket.file(filename).getSignedUrl(options)[0];
    } catch (error: unknown) {
      console.error(error, "getSignedUrl Failed");
      throw ("getSignedUrl Failed");
    }
  }

  async GetBucketItems(): Promise<string[]> {
    const fileList: string[] = [];
    let files: File[];

    try {
      files = await this.bucket.getFiles();
    } catch (error: unknown) {
      console.error(error, "getBucketItems Failed");
      throw "getBucketItems Failed";
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
        found: true
      };
    } catch (error: any) {
      if (error && "code" in error && error.code === 404) {
        return { found: false };
      }
      throw `Failed ${error}`;
    }
  }
}
