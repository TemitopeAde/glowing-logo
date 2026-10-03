import { app } from '@wix/astro/builders';
import myPage from './extensions/dashboard/pages/my-page/my-page.extension.ts';

import electricLogo from './extensions/site/widgets/electric-logo/electric-logo.extension.ts';

import electricLightningLogo from './extensions/site/components/electric-lightning-logo/electric-lightning-logo.extension.ts';

import electricLogoTools from './extensions/backend/app-tools/electric-logo-tools/electric-logo-tools.extension.ts';

import logoToolsProvider from './extensions/backend/service-plugins/logo-tools-provider/logo-tools-provider.extension.ts';

import appInstalled from './extensions/backend/events/app-installed/app-installed.extension.ts';

import paidPlanPurchased from './extensions/backend/events/paid-plan-purchased/paid-plan-purchased.extension.ts';

import paidPlanChanged from './extensions/backend/events/paid-plan-changed/paid-plan-changed.extension.ts';

import dataCollections from './extensions/backend/data-collections/data-collections.extension.ts';

export default app()
  .use(myPage).use(electricLogo).use(electricLightningLogo).use(electricLogoTools).use(logoToolsProvider).use(appInstalled).use(paidPlanPurchased).use(paidPlanChanged).use(dataCollections);
