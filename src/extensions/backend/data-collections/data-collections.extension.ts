import { extensions } from '@wix/astro/builders'

import lifecycleEventsCollection from './lifecycle-events';

export default extensions.dataCollections({
  id: 'b9627815-e868-4c50-91fc-0c0edcd387d0',
  name: 'Data Collections',
  collections: [lifecycleEventsCollection],
});
