import type { APIRoute } from 'astro';
import { auth } from '@wix/essentials';
import { files } from '@wix/media';

/**
 * Issues a single-use tus upload URL for the Electric Logo settings panel.
 * Generating Media Manager upload URLs needs app permissions, so the call is elevated —
 * which is why the caller must be a Wix user (site owner / collaborator), never a visitor.
 */

const MAX_FILE_NAME = 255;
const LOGO_FOLDER = '/electric-logo';

const elevatedGenerateResumableUploadUrl = auth.elevate(files.generateFileResumableUploadUrl);

interface UploadRequest {
  mimeType: string;
  fileName: string;
}

const parseRequest = (body: unknown): UploadRequest | null => {
  if (typeof body !== 'object' || body === null) return null;
  const { mimeType, fileName } = body as Record<string, unknown>;
  if (typeof mimeType !== 'string' || !mimeType.startsWith('image/') || mimeType.length > 100) return null;
  if (typeof fileName !== 'string' || !fileName.trim() || fileName.length > MAX_FILE_NAME) return null;
  return { mimeType, fileName: fileName.trim() };
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { subjectType } = await auth.getTokenInfo();
    if (subjectType !== 'USER') {
      return Response.json({ error: 'Only site editors can upload a logo.' }, { status: 403 });
    }
  } catch (error) {
    console.error('logo-upload-url: could not resolve caller identity', error);
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let upload: UploadRequest | null;
  try {
    upload = parseRequest(await request.json());
  } catch {
    upload = null;
  }
  if (!upload) {
    return Response.json({ error: 'An image mimeType and fileName are required.' }, { status: 400 });
  }

  try {
    const { uploadUrl, uploadToken } = await elevatedGenerateResumableUploadUrl(upload.mimeType, {
      fileName: upload.fileName,
      filePath: LOGO_FOLDER,
      uploadProtocol: 'TUS'
    });
    return Response.json({ uploadUrl, uploadToken });
  } catch (error) {
    console.error('logo-upload-url: generateFileResumableUploadUrl failed', error);
    return Response.json({ error: 'Could not prepare the upload.' }, { status: 502 });
  }
};
