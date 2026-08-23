import type { Metadata } from 'next';
import { Badge, VerifiedBadge } from '../../../../components/ui/badge';
import { ButtonLink } from '../../../../components/ui/button';
import { Note } from '../../../../components/ui/feedback';
import { PageHeader } from '../../../../components/member/page-header';
import { getMyProfile } from '../../../../lib/api/queries';
import styles from '../../../../components/member/member.module.css';
import account from '../../../../components/member/account.module.css';

export const metadata: Metadata = { title: 'Verification' };

export default async function VerificationPage() {
  const profile = await getMyProfile();
  const { user } = profile;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Verification"
        subtitle="Understand what Advaita has verified and what still needs a human review."
      />
      <div className={account.stack}>
        <section className={account.panel} aria-labelledby="phone-heading">
          <div className={account.panelHeader}>
            <div>
              <h2 className={account.panelTitle} id="phone-heading">
                Mobile number
              </h2>
              <p className={account.panelSubtitle}>{user.phone}</p>
            </div>
            {user.phone_verified_at ? (
              <VerifiedBadge basis="Mobile number verified" />
            ) : (
              <Badge tone="pending">Not verified</Badge>
            )}
          </div>
          <p className={account.panelSubtitle}>
            {user.phone_verified_at
              ? 'Your mobile number was verified during sign-in or registration.'
              : 'This account does not have a verified mobile number yet.'}
          </p>
          {!user.phone_verified_at && (
            <Note icon="info">
              Re-verification for an existing account is not exposed by the current backend. Contact support
              and we will guide you through the secure OTP flow; never send an OTP by email.
            </Note>
          )}
        </section>

        <section className={account.panel} aria-labelledby="document-heading">
          <h2 className={account.panelTitle} id="document-heading">
            Community documents
          </h2>
          <p className={account.panelSubtitle}>
            UDID and other supporting-document uploads are not connected to a working frontend endpoint in
            this deployment. We have not added an upload button that could suggest a document was received
            when it was not.
          </p>
          <div className={account.formActions}>
            <ButtonLink
              href="mailto:support@advaitamatrimony.com?subject=Verification%20support"
              variant="secondary"
              icon="mail"
              external
            >
              Contact verification support
            </ButtonLink>
            <ButtonLink href="/help" variant="ghost">
              Read safety guidance
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
