import type { Metadata } from 'next';
import { ButtonLink } from '../../../components/ui/button';
import { Note } from '../../../components/ui/feedback';
import { PageHeader } from '../../../components/member/page-header';
import styles from '../../../components/member/member.module.css';
import account from '../../../components/member/account.module.css';

export const metadata: Metadata = { title: 'Help & safety' };

export default function HelpPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Help & safety"
        subtitle="Good connections need clear boundaries. Here is what Advaita can do today, and where a human team helps."
      />
      <div className={account.accountGrid}>
        <div className={account.stack}>
          <section className={account.panel} aria-labelledby="safety-heading">
            <h2 className={account.panelTitle} id="safety-heading">
              Stay safe while you connect
            </h2>
            <ul className={styles.panelList}>
              <li className={styles.panelListItem}>
                <span className={styles.panelBullet} /> Never send money, OTPs, passwords or identity
                documents to another member.
              </li>
              <li className={styles.panelListItem}>
                <span className={styles.panelBullet} /> Keep early conversations on Advaita until you have
                built trust and verified the person independently.
              </li>
              <li className={styles.panelListItem}>
                <span className={styles.panelBullet} /> Meet in a public place, tell someone you trust and
                keep control of your own transport.
              </li>
              <li className={styles.panelListItem}>
                <span className={styles.panelBullet} /> If a member pressures, threatens or impersonates
                someone, stop replying and report the profile.
              </li>
            </ul>
          </section>
          <section className={account.panel} aria-labelledby="report-heading">
            <h2 className={account.panelTitle} id="report-heading">
              Report a concern
            </h2>
            <p className={account.panelSubtitle}>
              In-app reporting is not connected to a backend endpoint yet. Email a human at
              safety@advaitamatrimony.com with the profile ID, what happened and any relevant screenshots. Do
              not send passwords or OTPs.
            </p>
            <ButtonLink
              href="mailto:safety@advaitamatrimony.com?subject=Safety%20report"
              variant="danger"
              icon="flag"
              external
            >
              Contact safety team
            </ButtonLink>
          </section>
        </div>
        <aside className={account.stack}>
          <section className={account.panel} aria-labelledby="how-heading">
            <h2 className={account.panelTitle} id="how-heading">
              How the product works
            </h2>
            <ul className={styles.panelList}>
              <li className={styles.panelListItem}>
                <span className={styles.panelBullet} /> Send an interest from a profile.
              </li>
              <li className={styles.panelListItem}>
                <span className={styles.panelBullet} /> Chat opens only after the interest is accepted.
              </li>
              <li className={styles.panelListItem}>
                <span className={styles.panelBullet} /> Private photos remain blurred until the member
                approves access.
              </li>
              <li className={styles.panelListItem}>
                <span className={styles.panelBullet} /> Preference matches are rule-based arithmetic, not an
                AI promise.
              </li>
            </ul>
          </section>
          <Note icon="shield">
            Advaita will never ask you to pay another member or share a verification code. When in doubt,
            pause and ask the safety team.
          </Note>
        </aside>
      </div>
    </div>
  );
}
