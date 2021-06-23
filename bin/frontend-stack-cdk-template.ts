#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrontendStackCdkTemplateStack, CustomProps } from '../lib/frontend-stack-cdk-template-stack';

//@ts-ignore
import * as config from "../../config.json";

const myProps:CustomProps = config as any

const app = new cdk.App();
new FrontendStackCdkTemplateStack(app, myProps.CdkTemplateStackId as string, myProps);
/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
