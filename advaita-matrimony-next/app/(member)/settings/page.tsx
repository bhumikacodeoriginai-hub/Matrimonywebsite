import type { Metadata } from 'next';
import { ButtonLink } from '../../../components/ui/button';
import { Note } from '../../../components/ui/feedback';
import { ThemeToggle } from '../../../components/theme-toggle';
import { PageHeader } from '../../../components/member/page-header';
import styles from '../../../components/member/member.module.css';
import account from '../../../components/member/account.module.css';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Settings"
        subtitle="Simple controls for how your Advaita experience looks and what you can review."
      />
      <div className={account.accountGrid}>
        <div className={account.stack}>
          <section className={account.panel} aria-labelledby="experience-heading">
            <h2 className={account.panelTitle} id="experience-heading">
              Your experience
            </h2>
            <div className={account.settingItem}>
              <div className={account.settingLabel}>
                <span className={account.settingTitle}>Appearance</span>
                <span className={account.settingDescription}>
                  Choose a light or dark presentation. Your preference stays on this device.
                </span>
              </div>
              <ThemeToggle />
            </div>
          </section>

          <section className={account.panel} aria-labelledby="profile-controls-heading">
            <h2 className={account.panelTitle} id="profile-controls-heading">
              Profile controls
            </h2>
            <ul className={account.settingList}>
              <li className={account.settingItem}>
                <div className={account.settingLabel}>
                  <span className={account.settingTitle}>Profile information</span>
                  <span className={account.settingDescription}>
                    Change your name, location, education and introduction.
                  </span>
                </div>
                <ButtonLink href="/profile/edit" variant="secondary" size="sm">
                  Open
                </ButtonLink>
              </li>
              <li className={account.settingItem}>
                <div className={account.settingLabel}>
                  <span className={account.settingTitle}>Partner preferences</span>
                  <span className={account.settingDescription}>
                    Adjust the inputs used by preference matches.
                  </span>
                </div>
                <ButtonLink href="/profile/preferences" variant="secondary" size="sm">
                  Open
                </ButtonLink>
              </li>
              <li className={account.settingItem}>
                <div className={account.settingLabel}>
                  <span className={account.settingTitle}>Photo privacy</span>
                  <span className={account.settingDescription}>
                    Manage the photos on your profile. Clear originals are never rendered by this UI unless
                    the server authorises them.
                  </span>
                </div>
                <ButtonLink href="/profile/photos" variant="secondary" size="sm">
                  Open
                </ButtonLink>
              </li>
            </ul>
          </section>
        </div>

        <aside className={account.stack}>
          <section className={account.panel} aria-labelledby="privacy-links-heading">
            <h2 className={account.panelTitle} id="privacy-links-heading">
              Privacy & policies
            </h2>
            <div className={account.formActions}>
              <ButtonLink href="/privacy" variant="ghost">
                Privacy policy
              </ButtonLink>
              <ButtonLink href="/terms" variant="ghost">
                Terms of use
              </ButtonLink>
              <ButtonLink href="/refund" variant="ghost">
                Refund policy
              </ButtonLink>
            </div>
            <Note icon="info">
              Some privacy controls require backend support that is not available in this deployment yet. We
              will not show a switch that only looks like it works.
            </Note>
          </section>
          <section className={account.panel} aria-labelledby="account-help-heading">
            <h2 className={account.panelTitle} id="account-help-heading">
              Need an account change?
            </h2>
            <p className={account.panelSubtitle}>
              For password reset, account deletion or a correction to personal data, email the support team.
              Include your Advaita profile ID and never send a password.
            </p>
            <ButtonLink
              href="mailto:support@advaitamatrimony.com?subject=Account%20support"
              variant="secondary"
              icon="mail"
              external
            >
              Contact support
            </ButtonLink>
          </section>
        </aside>
      </div>
    </div>
  );
}
