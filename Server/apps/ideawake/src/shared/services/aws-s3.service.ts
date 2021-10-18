import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';
import { GeneratorService } from './generator.service';
import { readFileSync } from 'fs';
// import { File } from '../../interfaces/IFile';

@Injectable()
export class AwsS3Service {
  private readonly _s3: AWS.S3;

  constructor(
    public configService: ConfigService,
    public generatorService: GeneratorService,
  ) {
    const options: AWS.S3.Types.ClientConfiguration = {
      region: configService.awsS3Location.bucketLocation
        ? configService.awsS3Location.bucketLocation
        : 'us-east-2',
    };

    const awsS3Config = configService.awsS3Config;

    if (awsS3Config.accessKeyId && awsS3Config.secretAccessKey) {
      options.credentials = awsS3Config;
    }

    this._s3 = new AWS.S3(options);
  }

  async uploadImage(file: { mimetype: any; buffer: any }, s3Folder) {
    const fileName = this.generatorService.fileName(mime.extension(
      file.mimetype,
    ) as string);
    const key = s3Folder + fileName;
    await this._s3
      .putObject({
        Bucket: this.configService.awsS3Config.bucketName,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: 'application/octet-stream',
        Key: key,
      })
      .promise();
    return (
      'https://' +
      this.configService.awsS3Config.bucketName +
      '.s3.amazonaws.com/' +
      'attachments/users/' +
      fileName
    );
  }
  async getSignedUrl2(fileName: string, contentType: string, s3Folder: string) {
    const signedUrlExpireSeconds = 60 * 60;
    fileName = new Date().getTime() + fileName;
    const myKey = s3Folder + fileName;
    const myBucket = this.configService.awsS3Config.bucketName;
    let fileurl = '';
    const params = {
      Bucket: myBucket,
      Key: myKey,
      Expires: signedUrlExpireSeconds,
      ACL: 'public-read',
      ContentType: contentType,
    };
    fileurl = await this._s3.getSignedUrl('putObject', params);
    const configObject = {
      success: true,
      message: 'AWS SDK S3 Pre-signed urls generated successfully.',
      urls: fileurl,
      bucketPath:
        'https://' +
        this.configService.awsS3Config.bucketName +
        '.s3.amazonaws.com/' +
        s3Folder,
      fileName: fileName,
    };
    return configObject;
  }

  async uploadFile(
    fileName: string,
    s3Folder: string,
    fileDir?: string,
  ): Promise<string> {
    const filePath = `${fileDir ? `${fileDir}/` : ''}${fileName}`;
    const key = `${s3Folder}/${fileName}`;

    const fileData = readFileSync(filePath);

    await this._s3
      .putObject({
        Bucket: this.configService.awsS3Config.bucketName,
        Body: fileData,
        ACL: 'public-read',
        ContentType: 'application/octet-stream',
        Key: key,
      })
      .promise();
    return `https://${this.configService.awsS3Config.bucketName}.s3.amazonaws.com/${s3Folder}/${fileName}`;
  }
}
