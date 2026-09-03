export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const onLoad = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.removeEventListener('load', onLoad);
    };
    reader.addEventListener('load', onLoad);
    reader.readAsDataURL(blob);
  });
}
