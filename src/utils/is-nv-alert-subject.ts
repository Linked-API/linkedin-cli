export function isNvAlertSubject(value: string): boolean {
  if (/^urn:li:fs_salesProfile:\(AC[ow][\w-]+,[^,()]+,[^,()]+\)$/.test(value)) return true;
  if (/^urn:li:fs_salesCompany:[1-9]\d*$/.test(value)) return true;
  if (!/^(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\//i.test(value)) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const pathname = decodeURIComponent(url.pathname);
    return (
      /^\/in\/AC[ow][\w-]+\/?$/i.test(pathname) ||
      /^\/sales\/(?:lead|people)\/AC[ow][\w-]+(?:,[^,/?]+,[^,/?]+)?\/?$/i.test(pathname) ||
      /^\/(?:company|school|showcase|sales\/company)\/[1-9]\d*\/?$/i.test(pathname)
    );
  } catch {
    return false;
  }
}
