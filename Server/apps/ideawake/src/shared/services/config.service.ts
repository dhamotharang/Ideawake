import * as dotenv from 'dotenv';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AwsConfigInterface } from '../../interfaces/aws-config.interface';
import { SnakeNamingStrategy } from '../../snake-naming.strategy';

export class ConfigService {
  constructor() {
    const nodeEnv = this.nodeEnv;
    dotenv.config({
      path: `.${nodeEnv}.env`,
    });
    // Replace \\n with \n to support multiline strings in AWS
    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
    }
  }
  public get(key: string): string {
    return process.env[key];
  }
  public getNumber(key: string): number {
    return Number(this.get(key));
  }
  public getBoolean(key: string): boolean {
    return this.get(key) === 'false' ? false : true;
  }
  public getEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }
  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }
  /**
   * Get TypeORM Config, Entities and Migrations Lists
   * @return Config Object
   */
  get typeOrmConfig(): TypeOrmModuleOptions {
    let entities = [];
    let migrations = [];
    const entityContext = (require as any).context(
      './../../modules',
      true,
      /\.entity\.ts$/,
    );
    entities = entityContext.keys().map(id => {
      const entityModule = entityContext(id);
      const [entity] = Object.values(entityModule);
      return entity;
    });
    const migrationContext = (require as any).context(
      './../../migrations',
      false,
      /\.ts$/,
    );
    migrations = migrationContext.keys().map(id => {
      const migrationModule = migrationContext(id);
      const [migration] = Object.values(migrationModule);
      return migration;
    });
    return {
      entities,
      migrations,
      keepConnectionAlive: true,
      type: 'postgres',
      host: this.get('POSTGRES_HOST'),
      port: this.getNumber('POSTGRES_PORT'),
      username: this.get('POSTGRES_USERNAME'),
      password: this.get('POSTGRES_PASSWORD'),
      database: this.get('POSTGRES_DATABASE'),
      migrationsRun: true,
      logging: this.nodeEnv === 'development',
      namingStrategy: new SnakeNamingStrategy(),
      cli: {
        migrationsDir: 'migration',
      },
      extra: {
        max: 20,
      },
    };
  }
  get awsS3Config(): AwsConfigInterface {
    return {
      accessKeyId: this.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.get('AWS_S3_SECRET_ACCESS_KEY'),
      bucketName: this.get('AWS_S3_BUCKET_NAME'),
    };
  }
  get awsS3Location(): { bucketLocation: string } {
    return {
      bucketLocation: this.get('AWS_S3_BUCKET_LOCATION'),
    };
  }
  get mailerTransporter(): {} {
    return {
      host: this.get('EMAIL_SENDER_HOST'),
      port: this.get('EMAIL_SENDER_PORT'),
      auth: {
        user: this.get('EMAIL_SENDER_EMAIL'),
        pass: this.get('EMAIL_SENDER_PASSWORD'),
      },
    };
  }
}
