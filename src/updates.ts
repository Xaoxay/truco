import { CapacitorHttp, registerPlugin } from '@capacitor/core';

export const NativeUpdates = registerPlugin<{
  installedVersion(): Promise<{ code: number; name: string }>;
  openDownload(options: { url: string }): Promise<void>;
}>('TrucoUpdates');

export function availableUpdate(release: unknown, installedCode: number): { code: number; url: string } | null {
  const r = release as { tag_name?: unknown; draft?: boolean; prerelease?: boolean; assets?: { name?: string; browser_download_url?: string }[] } | null;
  if (!r || r.draft || r.prerelease || typeof r.tag_name !== 'string') return null;
  const match = /^android-(\d+)$/.exec(r.tag_name);
  if (!match) return null;
  const code = Number(match[1]);
  if (!Number.isSafeInteger(code) || code <= installedCode) return null;
  const asset = Array.isArray(r.assets) ? r.assets.find(a => a.name === 'truco.apk') : undefined;
  const expected = `https://github.com/Xaoxay/truco/releases/download/android-${code}/truco.apk`;
  return asset?.browser_download_url === expected ? { code, url: expected } : null;
}

export async function checkForUpdate() {
  const installed = await NativeUpdates.installedVersion();
  const response = await CapacitorHttp.get({
    url: 'https://api.github.com/repos/Xaoxay/truco/releases/latest',
    headers: { Accept: 'application/vnd.github+json' },
    connectTimeout: 10000, readTimeout: 10000,
  });
  if (response.status === 404) return null;
  if (response.status !== 200) throw new Error('Update service unavailable');
  return availableUpdate(response.data, installed.code);
}
