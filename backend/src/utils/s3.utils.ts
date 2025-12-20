
export function parseS3Url(url: string) {
  const key = url.split('.amazonaws.com/')[1] || '';
  const parts = key.split('/');
  const folderName = parts.slice(0, -1).join('/');
  const fileName = parts[parts.length - 1];
  return { folderName, fileName };
}
