import Image from 'next/image';

export function BrandLogo() {
  return <Image className="brand-logo" src="/samepage-logo.svg" alt="" aria-hidden width={36} height={36} priority />;
}
