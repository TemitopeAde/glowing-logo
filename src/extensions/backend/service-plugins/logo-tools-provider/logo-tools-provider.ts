import { toolsProvider } from '@wix/app-tools/service-plugins';
import { explainSettings, importLogo, recommendStyle, type Payload } from './logo-tools';

/** Aria calls this with a methodName declared in electric-logo-tools.extension.ts. */
toolsProvider.provideHandlers({
  runTool: async ({ request, metadata }) => {
    const { methodName } = request;
    const payload = (request.payload ?? undefined) as Payload;
    try {
      switch (methodName) {
        case 'explain-settings':
          return { response: explainSettings(payload) };
        case 'recommend-style':
          return { response: recommendStyle(payload) };
        case 'import-logo': {
          if (!metadata.identity?.wixUserId) {
            throw new Error('Only Wix users (site owners and collaborators) can import a logo.');
          }
          return { response: await importLogo(payload) };
        }
        default:
          throw new Error(`Unknown tool: ${methodName ?? '(none)'}`);
      }
    } catch (error) {
      console.error(`logo-tools-provider: ${methodName ?? '(none)'} failed (request ${metadata.requestId ?? 'n/a'})`, error);
      throw error;
    }
  },
});
