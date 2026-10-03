import React, { useState, type FC } from 'react';
import {
  Box,
  Button,
  FileUpload,
  FormField,
  Image,
  Input,
  LinearProgressBar,
  SidePanel,
  Text,
  TextButton
} from '@wix/design-system';
import { BOLT } from '../lib/constants';
import { uploadLogo } from './upload-logo';

interface LogoFieldProps {
  value: string;
  onChange: (src: string) => void;
}

type UploadState = { status: 'idle' } | { status: 'uploading'; percent: number } | { status: 'error'; message: string };

export const LogoField: FC<LogoFieldProps> = ({ value, onChange }) => {
  const [upload, setUpload] = useState<UploadState>({ status: 'idle' });
  const [draftUrl, setDraftUrl] = useState(value);
  const uploading = upload.status === 'uploading';

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUpload({ status: 'uploading', percent: 0 });
    try {
      const url = await uploadLogo(file, (percent) => setUpload({ status: 'uploading', percent }));
      setDraftUrl(url);
      onChange(url);
      setUpload({ status: 'idle' });
    } catch (error) {
      console.error('Logo upload failed:', error);
      setUpload({ status: 'error', message: error instanceof Error ? error.message : 'Upload failed.' });
    }
  };

  const commitUrl = () => {
    const next = draftUrl.trim();
    if (next !== value) onChange(next);
  };

  return (
    <>
      <SidePanel.Field>
        <FormField
          label="Logo image"
          infoContent="Upload an SVG or transparent PNG for the cleanest outline. Opaque images are traced by keying out their background colour. Uploads are saved to this site's Media Manager."
          suffix={
            value ? (
              <TextButton
                size="small"
                disabled={uploading}
                onClick={() => {
                  setDraftUrl('');
                  onChange('');
                }}
              >
                Use lightning bolt
              </TextButton>
            ) : undefined
          }
        >
          <Box direction="vertical" gap="SP2">
            <Box align="center" verticalAlign="middle" height="96px" borderRadius="8px" backgroundColor="D10">
              <Image src={value || BOLT} fit="contain" width="80px" height="80px" transparent />
            </Box>
            <FileUpload accept="image/svg+xml,image/png,image/jpeg,image/webp,image/gif" onChange={handleFiles}>
              {({ openFileUploadDialog }) => (
                <Button size="small" fullWidth disabled={uploading} onClick={openFileUploadDialog}>
                  {uploading ? 'Uploading…' : 'Upload logo'}
                </Button>
              )}
            </FileUpload>
            {upload.status === 'uploading' && <LinearProgressBar value={upload.percent} showProgressIndication />}
            {upload.status === 'error' && (
              <Text size="small" skin="error">
                {upload.message}
              </Text>
            )}
          </Box>
        </FormField>
      </SidePanel.Field>
      <SidePanel.Field>
        <FormField
          label="Or image URL"
          infoContent="Paste a direct link to an image. The host must allow cross-origin loading (CORS) so the outline can be traced."
        >
          <Input
            size="small"
            value={draftUrl}
            placeholder="https://…/logo.svg"
            disabled={uploading}
            onChange={(event) => setDraftUrl(event.target.value)}
            onBlur={commitUrl}
            onEnterPressed={commitUrl}
          />
        </FormField>
      </SidePanel.Field>
    </>
  );
};
