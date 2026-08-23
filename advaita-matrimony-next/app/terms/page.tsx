import type { Metadata } from 'next';
import { LanguageProvider } from '../../components/landing/language-provider';
import { LegalList, LegalPage } from '../../components/landing/legal-page';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'The rules for using Advaita Matrimony, and what we owe each other.',
};

export default function TermsPage() {
  return (
    <LanguageProvider>
      <LegalPage
        overline="The agreement between us"
        title="Terms of use"
        lastUpdated="23 August 2026"
        lede="Plain rules, written to be read. Using Advaita means agreeing to these."
        sections={[
          {
            id: 'eligibility',
            title: 'Who can join',
            body: (
              <LegalList
                items={[
                  'You must be at least 18 years old. We check your date of birth at sign-up and reject anything younger.',
                  'You must be legally free to marry. If you are separated or divorced, say so on your profile — that field exists for a reason.',
                  'One account per person. Duplicate accounts are removed.',
                  'You must use your own identity, your own photos, and true information.',
                ]}
              />
            ),
          },
          {
            id: 'review',
            title: 'Profile review',
            body: (
              <p>
                Every profile is reviewed by a person before it becomes searchable, and so is every photo.
                This takes time, and it is the reason there are fewer fake profiles here. We may ask you to
                change something, or decline a profile that breaks these terms. If we decline yours, we will
                tell you why.
              </p>
            ),
          },
          {
            id: 'conduct',
            title: 'How to behave here',
            body: (
              <>
                <p>
                  Members come here to find a marriage partner. Some of them have been treated badly elsewhere
                  for their disability, their hearing, or their skin. The standard is higher than &ldquo;not
                  illegal&rdquo;.
                </p>
                <LegalList
                  items={[
                    'Do not ask anyone for money, at any point, for any reason.',
                    'Do not harass, threaten, or keep contacting someone who has declined you.',
                    'Do not comment on someone’s disability, hearing, speech or skin as though it were a defect or a bargaining position.',
                    'Do not share, screenshot or repost another member’s photos or details anywhere else.',
                    'Do not use the platform to advertise, recruit, or collect data.',
                    'Do not impersonate anyone, or use photos that are not of you.',
                  ]}
                />
                <p>
                  Breaking these gets your account suspended. Asking members for money, or targeting someone
                  over their disability or appearance, gets it removed without warning.
                </p>
              </>
            ),
          },
          {
            id: 'contact',
            title: 'Interests and contact',
            body: (
              <p>
                You can send an interest to any member. They can accept or decline it, and declining is a
                complete answer that needs no explanation. Messaging opens only when an interest has been
                accepted. Contact details are revealed according to your membership, not on demand.
              </p>
            ),
          },
          {
            id: 'membership',
            title: 'Membership and payment',
            body: (
              <LegalList
                items={[
                  'Creating a profile, searching, and receiving and accepting interests are free.',
                  'Paid memberships add contact visibility and higher limits. The current plans, prices and durations are shown on the membership page and in your account.',
                  'Payments are taken by Razorpay or PhonePe. A membership starts once payment is confirmed and runs for the stated number of days.',
                  'Memberships do not renew automatically. Nothing is charged again unless you choose to buy again.',
                  'Refunds are covered on the refund policy page.',
                ]}
              />
            ),
          },
          {
            id: 'what-we-do-not-promise',
            title: 'What we do not promise',
            body: (
              <>
                <p>
                  We are a platform for meeting people, not a matchmaking guarantee, and we will not pretend
                  otherwise.
                </p>
                <LegalList
                  items={[
                    'We do not promise you will find a partner, or any particular number of matches.',
                    'Match percentages are arithmetic on the preferences you saved. They are a sorting aid, not a prediction about a marriage.',
                    'We review profiles carefully, but we cannot guarantee that every member is who they say they are. Meet in a public place, tell someone where you are going, and take your time.',
                    'We do not verify income, property, horoscopes, or family claims.',
                  ]}
                />
              </>
            ),
          },
          {
            id: 'your-content',
            title: 'Your content stays yours',
            body: (
              <p>
                Your photos and words remain yours. You give us permission to show them to other members on
                the platform, in the ways described in the privacy policy, for as long as your account is
                open. We do not use your photos in advertising. When you delete your account, that permission
                ends.
              </p>
            ),
          },
          {
            id: 'ending',
            title: 'Ending your account',
            body: (
              <p>
                You can ask us to close your account at any time by emailing support@advaitamatrimony.com. We
                may suspend or close an account that breaks these terms. If you have an unused paid membership
                and we close your account for reasons that are not your fault, the refund policy applies.
              </p>
            ),
          },
          {
            id: 'changes',
            title: 'Changes to these terms',
            body: (
              <p>
                If we change something that materially affects you, we will tell you rather than quietly
                editing this page. The last-updated date at the top always reflects the current version.
              </p>
            ),
          },
        ]}
      />
    </LanguageProvider>
  );
}
