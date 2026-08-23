import type { Metadata } from 'next';
import { PageHeader } from '../../../../components/member/page-header';
import { PreferencesEditor } from '../../../../components/member/preferences-editor';
import { getMyProfile } from '../../../../lib/api/queries';
import styles from '../../../../components/member/member.module.css';
import account from '../../../../components/member/account.module.css';

export const metadata: Metadata = { title: 'Partner preferences' };

export default async function PartnerPreferencesPage() {
  const profile = await getMyProfile();
  return (
    <div className={styles.page}>
      <PageHeader
        title="Partner preferences"
        subtitle="These are your settings for preference matches, not a promise that every result will fit perfectly."
      />
      <section className={account.panel}>
        <PreferencesEditor preferences={profile.user.partner_preferences} />
      </section>
    </div>
  );
}
