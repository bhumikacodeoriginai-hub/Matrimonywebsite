import type { Metadata } from 'next';
import { PageHeader } from '../../../../components/member/page-header';
import { ProfileEditor } from '../../../../components/member/profile-editor';
import { getMyProfile } from '../../../../lib/api/queries';
import styles from '../../../../components/member/member.module.css';
import account from '../../../../components/member/account.module.css';

export const metadata: Metadata = { title: 'Edit profile' };

export default async function EditProfilePage() {
  const profile = await getMyProfile();
  return (
    <div className={styles.page}>
      <PageHeader
        title="Edit profile"
        subtitle="Share enough to be understood, and keep optional details optional."
      />
      <section className={account.panel}>
        <ProfileEditor profileData={profile} />
      </section>
    </div>
  );
}
