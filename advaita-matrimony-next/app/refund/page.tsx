import type { Metadata } from 'next';
import { LanguageProvider } from '../../components/landing/language-provider';
import { LegalList, LegalPage } from '../../components/landing/legal-page';

export const metadata: Metadata = {
  title: 'Refund policy',
  description: 'When Advaita Matrimony refunds a membership, how to ask, and how long it takes.',
};

export default function RefundPage() {
  return (
    <LanguageProvider>
      <LegalPage
        overline="Membership & payments"
        title="Refund policy"
        lastUpdated="23 August 2026"
        lede="A membership is a service you can start using immediately, so refunds are limited — but the cases where we do refund are stated here, not buried."
        sections={[
          {
            id: 'cooling-off',
            title: 'The first 7 days',
            body: (
              <p>
                If you buy a membership and change your mind within <strong>7 days</strong>, write to us and
                we will refund it in full — as long as you have not yet used what the membership unlocks.
                &ldquo;Used&rdquo; means you have viewed contact details or sent interests beyond the free
                allowance. Simply browsing does not count against you.
              </p>
            ),
          },
          {
            id: 'we-refund',
            title: 'We refund in these cases',
            body: (
              <LegalList
                items={[
                  'You were charged twice for the same membership.',
                  'Payment was taken but the membership was not activated on your account.',
                  'You were charged an amount that does not match the plan price shown at checkout.',
                  'We suspend or close your account for a reason that is not your fault, while a paid membership is still running — we refund the unused portion.',
                  'A feature the plan explicitly includes was unavailable for a sustained period.',
                ]}
              />
            ),
          },
          {
            id: 'we-do-not-refund',
            title: 'We do not refund in these cases',
            body: (
              <>
                <LegalList
                  items={[
                    'You did not find a partner. We are honest on the terms page that we cannot promise this, and the membership is for access to the platform, not for an outcome.',
                    'You did not use the membership during its term.',
                    'Your account was closed because it broke the terms of use.',
                    'The membership has expired.',
                  ]}
                />
                <p>
                  Memberships never renew automatically, so there is no such thing here as an unexpected
                  repeat charge.
                </p>
              </>
            ),
          },
          {
            id: 'how-to-ask',
            title: 'How to ask',
            body: (
              <>
                <p>
                  Email <strong>support@advaitamatrimony.com</strong> from the address on your account, or
                  include your Advaita profile ID, and tell us:
                </p>
                <LegalList
                  items={[
                    'The plan you bought and roughly when.',
                    'The payment reference from your bank, UPI app, or our confirmation.',
                    'What went wrong.',
                  ]}
                />
                <p>
                  You can also see every payment you have made, with its reference, under Subscription in your
                  account.
                </p>
              </>
            ),
          },
          {
            id: 'timing',
            title: 'How long it takes',
            body: (
              <LegalList
                items={[
                  'We reply within 3 working days.',
                  'Approved refunds are issued to the original payment method within 5 to 7 working days.',
                  'Your bank or UPI provider may take a few days more to show it. That part is outside our control.',
                  'We will tell you if we decline, and why.',
                ]}
              />
            ),
          },
          {
            id: 'disputes',
            title: 'If you are not satisfied',
            body: (
              <p>
                Reply to our decision and ask for it to be escalated — a second person will review it. Please
                come to us before raising a chargeback with your bank: a chargeback freezes the account while
                it is investigated, which usually helps you less than a direct refund would.
              </p>
            ),
          },
        ]}
      />
    </LanguageProvider>
  );
}
