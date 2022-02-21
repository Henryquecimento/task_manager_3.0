import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "taskmanager",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["dynamodb:*"],
            Resource: ["*"],
          },
          {
            Effect: "Allow",
            Action: ["s3:*"],
            Resource: ["*"],
          },
        ],
      },
    },
  },
  functions: {
    CreateUsersToDo: {
      handler: "src/functions/CreateUsersToDo.handler",
      events: [
        {
          http: {
            path: "CreateUsersToDo/{user_id}",
            method: "post",
            cors: true,
          },
        },
      ],
    },
    ShowUsersToDo: {
      handler: "src/functions/ShowUserToDo.handler",
      events: [
        {
          http: {
            path: "ShowUserToDo/{user_id}",
            method: "get",
            cors: true,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    dynamodb: {
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
  },
  resources: {
    Resources: {
      dbCertificateUsers: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "user_todos",
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
