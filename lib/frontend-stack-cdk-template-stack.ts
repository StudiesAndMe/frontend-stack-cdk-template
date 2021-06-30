//import * as cdk from '@aws-cdk/core';

import cloudfront = require('@aws-cdk/aws-cloudfront');
import route53 = require('@aws-cdk/aws-route53');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import acm = require('@aws-cdk/aws-certificatemanager');
import cdk = require('@aws-cdk/core');
import targets = require('@aws-cdk/aws-route53-targets/lib');


export interface CustomProps extends cdk.StackProps {
  env: { account: string, region: string },
  CdkTemplateStackId:string,
  PROJECT_NAME: string
  ENV_TYPE: string
  FRONTEND_BUILD_FOLDER: string
  HOSTED_DOMAIN_NAME: string
}

export class FrontendStackCdkTemplateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CustomProps) {
    super(scope, id, props);

    const PROJECT_NAME = props.PROJECT_NAME //'sitetool-'
    const ENV_TYPE = props.ENV_TYPE //'staging'
    const DISTRIBUTION_NAME = PROJECT_NAME + '-distribution'
    const FRONTEND_BUILD_FOLDER = props.FRONTEND_BUILD_FOLDER //"../client/build"
    const HOSTED_DOMAIN_NAME = props.HOSTED_DOMAIN_NAME //'studies-and-me.com'

    const domainName = HOSTED_DOMAIN_NAME

    // if main or master branch - don't append branch name to url
    const isMainMaster = ENV_TYPE === 'main' || ENV_TYPE === 'master' ? true : false
    const siteSubDomain = isMainMaster ? PROJECT_NAME : PROJECT_NAME + '-' + ENV_TYPE

    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: domainName });

    const siteDomain = siteSubDomain + '.' + domainName;
    new cdk.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });

    // Content bucket
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: siteDomain,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,

      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new bucket, and it will remain in your account until manually deleted. By setting the policy to
      // DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });
    new cdk.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });

    // TLS certificate
    const certificateArn = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: siteDomain,
      hostedZone: zone,
      region: 'us-east-1', // Cloudfront only validates this region for certificates - if changes to eu-central-1 it fails
    }).certificateArn;
    new cdk.CfnOutput(this, 'Certificate', { value: certificateArn });

    // CloudFront distribution that provides HTTPS
    const distribution = new cloudfront.CloudFrontWebDistribution(this, DISTRIBUTION_NAME, {
      aliasConfiguration: {
        acmCertRef: certificateArn,
        names: [ siteDomain ],
        sslMethod: cloudfront.SSLMethod.SNI,
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
      },
      originConfigs: [
        {
          customOriginSource: {
            domainName: siteBucket.bucketWebsiteDomainName,
            originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          },
          behaviors : [ {isDefaultBehavior: true}],
        }
      ]
    });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      //sources: [ s3deploy.Source.asset('./site-contents') ],
      sources: [s3deploy.Source.asset(FRONTEND_BUILD_FOLDER)],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });
  }


}
