import { app } from '@wix/astro/builders';
import myPage from './extensions/dashboard/pages/my-page/my-page.extension.ts';

import electricLogo from './extensions/site/widgets/electric-logo/electric-logo.extension.ts';

export default app()
  .use(myPage).use(electricLogo);
