import type { Metadata } from 'next';
import { LanguageProvider } from '../../components/landing/language-provider';
import { LegalList, LegalPage } from '../../components/landing/legal-page';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What Advaita Matrimony collects, who can see your photos and contact details, and how to have your data removed.',
};

/**
 * The factual claims here are taken from the implementation, not aspiration:
 * photo variants written by PhotoService, the members-only default on new photos,
 * contact masking in ProfileController, interest-gated conversations, and admin
 * review before a profile becomes searchable.
 */
export default function PrivacyPage() {
  return (
    <LanguageProvider>
      <LegalPage
        overline="Your story, your control"
        title="Privacy"
        lastUpdated="23 August 2026"
        lede="Advaita exists for people who have good reasons to be careful about what they share. This page says plainly what we collect, who can see it, and how to get it removed."
        sections={[
          {
            id: 'what-we-collect',
            title: 'What we collect',
            body: (
              <>
                <p>Only what a matrimony profile needs, and only what you type in.</p>
                <LegalList
                  items={[
                    <>
                      <strong>Account details</strong> — your name, mobile number, date of birth, gender and
                      (optionally) email address. The mobile number is required because it is how we verify
                      that an account belongs to a real person.
                    </>,
                    <>
                      <strong>Profile details</strong> — everything you choose to fill in: education, work,
                      family, lifestyle, location, about-you text and partner preferences. Every one of these
                      fields can be left blank.
                    </>,
                    <>
                      <strong>Community details</strong> — if you join as a Divyangjan, Deaf or
                      hard-of-hearing, or vitiligo member, the related fields you fill in. These are optional,
                      and you decide which of them appear on your profile.
                    </>,
                    <>
                      <strong>Verification documents</strong> — a UDID certificate if you choose to submit
                      one. Only our review team ever opens it. It is never shown on your profile and never
                      shared with other members.
                    </>,
                    <>
                      <strong>Photos</strong> — the images you upload, plus the watermarked, blurred and
                      thumbnail versions we generate from them.
                    </>,
                    <>
                      <strong>Activity</strong> — interests sent and received, profiles you viewed, who viewed
                      you, shortlists and messages.
                    </>,
                  ]}
                />
              </>
            ),
          },
          {
            id: 'photos',
            title: 'How your photos are protected',
            body: (
              <>
                <p>
                  Photo privacy is the part members ask about most, so here is exactly what happens when you
                  upload one.
                </p>
                <LegalList
                  items={[
                    'Every upload is automatically watermarked with the Advaita name, which makes it materially harder to reuse elsewhere.',
                    'A blurred copy is generated. That is the version other members see unless they are allowed to see more.',
                    'New photos default to members-only. Guests and search engines never see them.',
                    'You can require an approved request for a photo, in which case it stays blurred until you personally approve the person asking.',
                    'A photo you delete stops being shown immediately.',
                  ]}
                />
                <p>
                  <strong>One limitation we will not hide from you:</strong> image files are currently served
                  from ordinary web storage. That means the blur protects your photo from being browsed, but a
                  direct file link that someone already has could still resolve. Closing that gap completely —
                  serving every photo through a permission check — is an active piece of work, and it is
                  tracked openly in our engineering notes rather than glossed over here.
                </p>
              </>
            ),
          },
          {
            id: 'who-sees-what',
            title: 'Who can see what',
            body: (
              <LegalList
                items={[
                  <>
                    <strong>Guests and search engines</strong> — nothing. No profile, no photo, no name.
                    Profile pages require a signed-in account, and they are excluded from search-engine
                    indexing.
                  </>,
                  <>
                    <strong>Other members</strong> — your profile details and your blurred photos, once our
                    team has approved your profile.
                  </>,
                  <>
                    <strong>Your mobile number and email</strong> — hidden. Members see a masked number such
                    as 9876****10 until they hold a membership that reveals contact details.
                  </>,
                  <>
                    <strong>People you have blocked</strong> — nothing at all. A block removes you from their
                    view entirely and stops them contacting you.
                  </>,
                  <>
                    <strong>Our review team</strong> — your profile and documents, for approval and for
                    investigating reports. Nothing else.
                  </>,
                ]}
              />
            ),
          },
          {
            id: 'messages',
            title: 'Messages',
            body: (
              <>
                <p>
                  Nobody can message you out of the blue. A conversation only exists after one of you sends an
                  interest and the other accepts it. Until then there is no channel between you.
                </p>
                <p>
                  Messages are stored so you can read them later, and our team can access a conversation when
                  investigating a report of abuse. They are not end-to-end encrypted, and we would rather tell
                  you that than imply a protection we do not provide.
                </p>
              </>
            ),
          },
          {
            id: 'payments',
            title: 'Payments',
            body: (
              <p>
                Card and UPI details are handled entirely by our payment providers, Razorpay and PhonePe. We
                never see or store them. What we keep is the fact of a payment: which plan, how much, when,
                and the provider&rsquo;s reference so we can help if something goes wrong.
              </p>
            ),
          },
          {
            id: 'your-rights',
            title: 'Your choices',
            body: (
              <LegalList
                items={[
                  'Edit or clear any profile field at any time, including community-specific ones.',
                  'Change a photo’s privacy level, or delete it.',
                  'Block any member. They lose all access to you.',
                  'Ask us to delete your account and data by emailing support@advaitamatrimony.com. We will confirm when it is done.',
                  'Ask for a copy of what we hold about you.',
                ]}
              />
            ),
          },
          {
            id: 'retention',
            title: 'How long we keep things',
            body: (
              <p>
                While your account is open, we keep your profile so members can find you. When you ask us to
                delete it, we remove your profile, photos and messages. We keep the minimum payment records
                that tax and accounting rules require, and nothing more.
              </p>
            ),
          },
        ]}
      />
    </LanguageProvider>
  );
}
