'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
export function BackToMap() {
  const query = useSearchParams().toString();
  return (
    <Link href={query ? `/?${query}` : '/'} className="back-to-map">
      <ArrowLeft size={16} />
      Back to the map
    </Link>
  );
}
