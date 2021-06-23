#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrontendStackCdkTemplateStack, CustomProps } from '../lib/frontend-stack-cdk-template-stack';

//@ts-ignore
import * as config from "../../cdk-config.json";

const myProps:CustomProps = config as any

const app = new cdk.App();

// The env is set in circleCI and reflects the branch
const deployEnv = app.node.tryGetContext('env') || 'main'
myProps.ENV_TYPE = deployEnv

const stackId = myProps.CdkTemplateStackId+"-branch-"+deployEnv as string
new FrontendStackCdkTemplateStack(app, stackId , myProps);
/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
