import { httpClient } from '@wix/essentials';
import { Upload } from 'tus-js-client';

const UPLOAD_URL_ENDPOINT = new URL('/api/logo-upload-url', import.meta.url).href;
const RETRY_DELAYS = [0, 3000, 5000, 10000, 20000];
export const MAX_LOGO_BYTES = 25 * 1024 * 1024;

interface UploadTarget {
  uploadUrl: string;
  uploadToken: string;
}

const isUploadTarget = (value: unknown): value is UploadTarget => {
  if (typeof value !== 'object' || value === null) return false;
  const { uploadUrl, uploadToken } = value as Record<string, unknown>;
  return typeof uploadUrl === 'string' && typeof uploadToken === 'string';
};

const readError = async (response: Response) => {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
  } catch {
    // Non-JSON error body; fall through to the status line.
  }
  return `${response.status} ${response.statusText}`.trim();
};

const requestUploadTarget = async (file: File): Promise<UploadTarget> => {
  const response = await httpClient.fetchWithAuth(UPLOAD_URL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeType: file.type, fileName: file.name })
  });
  if (!response.ok) throw new Error(`Could not start upload: ${await readError(response)}`);
  const body: unknown = await response.json();
  if (!isUploadTarget(body)) throw new Error('Could not start upload: unexpected response.');
  return body;
};

const runTusUpload = (file: File, target: UploadTarget, onProgress: (percent: number) => void) =>
  new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: target.uploadUrl,
      retryDelays: RETRY_DELAYS,
      metadata: { filename: file.name, contentType: file.type, token: target.uploadToken },
      onProgress: (sent, total) => onProgress(total > 0 ? Math.round((sent / total) * 100) : 0),
      onSuccess: () => resolve(),
      onError: (error) => reject(error)
    });
    upload.start();
  });

/** Completes the tus session; Media Manager answers with the stored file descriptor. */
const finalizeUpload = async (file: File, target: UploadTarget): Promise<string> => {
  const url = new URL(`${target.uploadUrl}/${target.uploadToken}`);
  url.searchParams.set('filename', file.name);
  const response = await fetch(url, { method: 'PUT' });
  if (!response.ok) throw new Error(`Could not finish upload: ${await readError(response)}`);
  const body: unknown = await response.json();
  const fileUrl =
    typeof body === 'object' && body !== null && 'file' in body && typeof body.file === 'object' && body.file !== null
      ? (body.file as Record<string, unknown>).url
      : undefined;
  if (typeof fileUrl !== 'string') throw new Error('Upload finished but no file URL was returned.');
  return fileUrl;
};

/**
 * Uploads an image to the site's Media Manager with a resumable (tus) upload and resolves to its
 * public wixstatic URL.
 */
export const uploadLogo = async (file: File, onProgress: (percent: number) => void): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (SVG, PNG, JPG, WebP).');
  if (file.size === 0) throw new Error('That file is empty.');
  if (file.size > MAX_LOGO_BYTES) throw new Error('Logos must be 25 MB or smaller.');

  const target = await requestUploadTarget(file);
  onProgress(0);
  await runTusUpload(file, target, onProgress);
  return finalizeUpload(file, target);
};
