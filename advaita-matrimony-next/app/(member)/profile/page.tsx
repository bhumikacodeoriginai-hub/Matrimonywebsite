import type { Metadata } from 'next';
import { Avatar } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { ButtonLink } from '../../../components/ui/button';
import { ProgressBar } from '../../../components/ui/progress';
import { PageHeader } from '../../../components/member/page-header';
import { getMyProfile } from '../../../lib/api/queries';
import { formatDate, metaLine } from '../../../lib/format';
import { PROFILE_CATEGORY_LABELS, PROFILE_STATUS_LABELS } from '../../../lib/enums';
import styles from '../../../components/member/member.module.css';
import account from '../../../components/member/account.module.css';

export const metadata: Metadata = { title: 'My profile' };

export default async function MyProfilePage() {
  const data = await getMyProfile();
  const { user } = data;
  const profile = user.profile;
  const primary = user.photos.find((photo) => photo.is_primary) ?? user.photos[0];

  return (
    <div className={styles.page}>
      <PageHeader
        title="My profile"
        subtitle="See the profile members see, then make changes without losing sight of your privacy."
        actions={
          <>
            <ButtonLink href="/profile/edit" variant="secondary" icon="edit">
              Edit profile
            </ButtonLink>
            <ButtonLink href="/profile/photos" variant="ghost" icon="camera">
              Photos
            </ButtonLink>
          </>
        }
      />

      <div className={account.accountGrid}>
        <div className={account.stack}>
          <section className={account.panel} aria-labelledby="profile-summary-heading">
            <div className={account.profileHero}>
              <Avatar
                src={primary?.thumbnail_path ?? null}
                name={user.name}
                size="xl"
                ring={user.is_premium ? 'premium' : 'default'}
                decorative
              />
              <div>
                <h2 className={account.profileHeroTitle} id="profile-summary-heading">
                  {user.name}
                </h2>
                <p className={account.profileHeroMeta}>
                  {metaLine(profile?.city, profile?.state) || user.unique_id}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    flexWrap: 'wrap',
                    marginTop: 'var(--space-3)',
                  }}
                >
                  <Badge
                    tone={
                      user.profile_status === 'approved'
                        ? 'verified'
                        : user.profile_status === 'rejected'
                          ? 'danger'
                          : 'pending'
                    }
                  >
                    {PROFILE_STATUS_LABELS[user.profile_status]}
                  </Badge>
                  {profile?.profile_category && (
                    <Badge tone="neutral">{PROFILE_CATEGORY_LABELS[profile.profile_category]}</Badge>
                  )}
                </div>
              </div>
            </div>
            <ProgressBar
              value={data.profile_completion}
              label="Profile completeness"
              tone={data.profile_completion >= 70 ? 'verified' : 'brand'}
            />
            <p className={account.muted}>
              A complete profile gives people enough context to start with respect. It does not guarantee a
              match or approval.
            </p>
          </section>

          <section className={account.panel} aria-labelledby="about-heading">
            <h2 className={account.panelTitle} id="about-heading">
              Your introduction
            </h2>
            <p className={account.panelSubtitle}>
              {profile?.about_me?.trim() || 'You have not written an introduction yet.'}
            </p>
            {!profile?.about_me?.trim() && (
              <ButtonLink href="/profile/edit" variant="secondary">
                Add your introduction
              </ButtonLink>
            )}
          </section>

          <section className={account.panel} aria-labelledby="details-heading">
            <h2 className={account.panelTitle} id="details-heading">
              Profile details
            </h2>
            <dl className={account.detailList}>
              <div className={account.detailRow}>
                <dt className={account.detailTerm}>Age</dt>
                <dd className={account.detailValue}>
                  {user.date_of_birth ? formatDate(user.date_of_birth) : 'Add your date of birth'}
                </dd>
              </div>
              <div className={account.detailRow}>
                <dt className={account.detailTerm}>Location</dt>
                <dd className={account.detailValue}>
                  {metaLine(profile?.city, profile?.state, profile?.country) || 'Not added'}
                </dd>
              </div>
              <div className={account.detailRow}>
                <dt className={account.detailTerm}>Education</dt>
                <dd className={account.detailValue}>{profile?.highest_education || 'Not added'}</dd>
              </div>
              <div className={account.detailRow}>
                <dt className={account.detailTerm}>Work</dt>
                <dd className={account.detailValue}>
                  {metaLine(profile?.occupation, profile?.employed_in) || 'Not added'}
                </dd>
              </div>
              <div className={account.detailRow}>
                <dt className={account.detailTerm}>Languages</dt>
                <dd className={account.detailValue}>{profile?.languages_known?.join(', ') || 'Not added'}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className={account.stack}>
          <section className={account.panel} aria-labelledby="privacy-heading">
            <h2 className={account.panelTitle} id="privacy-heading">
              <span className={account.panelIcon}>⌁</span>Privacy by default
            </h2>
            <p className={account.panelSubtitle}>
              Your phone number and email are not displayed here as public contact links. Photo privacy is
              managed per upload where the backend supports it.
            </p>
            <ButtonLink href="/settings" variant="secondary" icon="settings">
              Review settings
            </ButtonLink>
          </section>
          <section className={account.panel} aria-labelledby="preferences-heading">
            <h2 className={account.panelTitle} id="preferences-heading">
              Partner preferences
            </h2>
            <p className={account.panelSubtitle}>
              {user.partner_preferences
                ? 'Your saved preferences are used for preference matches.'
                : 'No preferences saved yet, so Discover cannot rank profiles against them.'}
            </p>
            <ButtonLink href="/profile/preferences" variant="secondary" icon="sliders">
              Edit preferences
            </ButtonLink>
          </section>
        </aside>
      </div>
    </div>
  );
}
