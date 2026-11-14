import type { Metadata } from 'next';
import { InfoPage } from '@/components/info-page';
import { SourceContent } from '@/components/source-content';
export const metadata: Metadata = { title: 'Data and sources — Agro Field' };
export default function Sources() {
  return (
    <InfoPage
      label="Data with a source"
      title={'Know where the\nnumbers come from.'}
      intro="Every result needs context. Here is what the archive can tell you, where it comes from, and where local knowledge is still needed."
    >
      <SourceContent />
    </InfoPage>
  );
}
