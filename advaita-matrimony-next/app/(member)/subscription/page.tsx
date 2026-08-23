import type { Metadata } from 'next';
import { PageHeader } from '../../../components/member/page-header';
import { SubscriptionClient } from '../../../components/member/subscription-client';
import { getMySubscription, getPackages, getPaymentHistory } from '../../../lib/api/queries';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Membership' };

export default async function SubscriptionPage() {
  const [{ packages, freeMode }, subscription, history] = await Promise.all([
    getPackages(),
    getMySubscription(),
    getPaymentHistory(1),
  ]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Membership"
        subtitle="Choose the access that feels right for you. Prices, limits and features are always read from the server."
      />
      <SubscriptionClient
        packages={packages}
        freeMode={freeMode}
        subscription={subscription}
        history={history}
      />
    </div>
  );
}
