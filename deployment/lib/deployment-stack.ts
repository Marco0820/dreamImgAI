import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class DeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPC
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // 2. A single secret for all application credentials
    const appSecrets = new secretsmanager.Secret(this, 'AppSecrets', {
      secretName: 'dreamimg-secrets',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
          // Placeholders for user to fill in the AWS Secrets Manager console
          SECRET_KEY: 'REPLACE_WITH_A_STRONG_SECRET_KEY',
          OPENAI_API_KEY: 'REPLACE_WITH_YOUR_OPENAI_KEY',
          GROQ_API_KEY: 'REPLACE_WITH_YOUR_GROQ_KEY',
          STABILITY_API_KEY: 'REPLACE_WITH_YOUR_STABILITY_KEY',
          STRIPE_API_KEY: 'REPLACE_WITH_YOUR_STRIPE_SECRET_KEY',
          STRIPE_WEBHOOK_SECRET: 'REPLACE_WITH_YOUR_STRIPE_WEBHOOK_SECRET',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password', // This is for the DB password
      },
    });

    // 3. RDS PostgreSQL Database
    const dbInstance = new rds.DatabaseInstance(this, 'PostgresDB', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_15 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      // Use the single app secret for DB credentials.
      // RDS will automatically manage the 'password', 'host', 'port', 'dbname' fields in the secret.
      credentials: rds.Credentials.fromSecret(appSecrets, 'username'),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      publiclyAccessible: false,
      databaseName: 'dreamimg',
    });
    
    // Allow connections from within the VPC
    dbInstance.connections.allowDefaultPortFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), 'Allow connections from within the VPC');


    // 4. App Runner IAM Role
    const apprunnerAccessRole = new iam.Role(this, 'AppRunnerAccessRole', {
        assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
    });

    appSecrets.grantRead(apprunnerAccessRole);

    // 5. Backend App Runner Service from local Dockerfile
    const backendService = new apprunner.Service(this, 'BackendService', {
      serviceName: 'dreamimg-backend',
      source: apprunner.Source.fromAsset({
        asset: path.join(__dirname, '..', '..', 'backend'),
        imageConfiguration: {
          port: 8000,
          // Pass only the info needed to find the secrets
          environmentVariables: {
            ENVIRONMENT: 'production',
            AWS_REGION: this.region,
            APP_SECRETS_NAME: appSecrets.secretName,
          },
        },
      }),
      instanceRole: apprunnerAccessRole,
      vpcConnector: new apprunner.VpcConnector(this, 'BackendVpcConnector', { vpc }),
    });

    // 6. Frontend App Runner Service from local Dockerfile
    const frontendService = new apprunner.Service(this, 'FrontendService', {
        serviceName: 'dreamimg-frontend',
        source: apprunner.Source.fromAsset({
            asset: path.join(__dirname, '..', '..', 'frontend'),
            imageConfiguration: {
                port: 3000,
                environmentVariables: {
                    NEXT_PUBLIC_API_BASE_URL: backendService.serviceUrl,
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'your-pk-test-key' // Replace with your publishable key
                }
            },
        }),
    });

    // 7. Outputs
    new cdk.CfnOutput(this, 'BackendServiceUrl', {
      value: backendService.serviceUrl,
      description: 'The URL of the backend service',
    });

    new cdk.CfnOutput(this, 'FrontendServiceUrl', {
      value: frontendService.serviceUrl,
      description: 'The URL of the frontend service',
    });
    
    new cdk.CfnOutput(this, 'AppSecretsArn', {
        value: appSecrets.secretArn,
        description: 'ARN of the application secrets in Secrets Manager'
    });
  }
}
