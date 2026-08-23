import type { Metadata } from 'next';
import { PageHeader } from '../../../../components/member/page-header';
import { PhotoManager } from '../../../../components/member/photo-manager';
import { getMyProfile } from '../../../../lib/api/queries';
import styles from '../../../../components/member/member.module.css';
import account from '../../../../components/member/account.module.css';

export const metadata: Metadata = { title: 'Profile photos' };

export default async function ProfilePhotosPage() {
  const profile = await getMyProfile();
  return (
    <div className={styles.page}>
      <PageHeader
        title="Profile photos"
        subtitle="Add photos you are comfortable sharing. Clear, recent images help people recognise the person behind the profile."
      />
      <section className={account.panel}>
        <PhotoManager initialPhotos={profile.user.photos} />
      </section>
    </div>
  );
}
