#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrontendStackCdkTemplateStack } from '../lib/frontend-stack-cdk-template-stack';
import * as config from "../config.json";


const app = new cdk.App();
new FrontendStackCdkTemplateStack(app, config.CdkTemplateStackId, config);
/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
