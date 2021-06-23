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

    const PROJECT_NAME = props.PROJECT_NAME
    const ENV_TYPE = props.ENV_TYPE
    const DISTRIBUTION_NAME = PROJECT_NAME + '-distribution'
    const FRONTEND_BUILD_FOLDER = props.FRONTEND_BUILD_FOLDER //"../client/build"
    const HOSTED_DOMAIN_NAME = props.HOSTED_DOMAIN_NAME

    const domainName = HOSTED_DOMAIN_NAME
    const siteSubDomain = PROJECT_NAME+ENV_TYPE

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

  }
}
