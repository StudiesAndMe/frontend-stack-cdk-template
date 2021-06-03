import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as FrontendStackCdkTemplate from '../lib/frontend-stack-cdk-template-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN

  const props = {
    env: { account: 'acount-id', region: 'eu-central-1' },
    PROJECT_NAME: 'some-name',
    ENV_TYPE: 'staging',
    FRONTEND_BUILD_FOLDER: 'path-to-folder',
    HOSTED_DOMAIN_NAME: 'domaine-name',
  }

    const stack = new FrontendStackCdkTemplate.FrontendStackCdkTemplateStack(app, 'MyTestStack', props);
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
