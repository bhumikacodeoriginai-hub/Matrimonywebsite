'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Note } from '../ui/feedback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { createPhonePePayment, createRazorpayOrder, verifyRazorpayPayment } from '../../lib/api/actions';
import { formatDate, formatLimit, formatRupees, parseUsage } from '../../lib/format';
import type { MySubscriptionResponse, PaymentRecord, SubscriptionPackage } from '../../lib/api/types';
import styles from './account.module.css';

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      prefill?: { name?: string; email?: string; contact?: string };
      theme?: { color?: string };
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: { ondismiss?: () => void };
    }) => { open: () => void };
  }
}

interface SubscriptionClientProps {
  packages: SubscriptionPackage[];
  freeMode: boolean;
  subscription: MySubscriptionResponse | null;
  history: { data: PaymentRecord[] } | null;
}

function loadRazorpay(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function SubscriptionClient({ packages, freeMode, subscription, history }: SubscriptionClientProps) {
  const router = useRouter();
  const [busyPackage, setBusyPackage] = useState<number | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const choosePlan = async (plan: SubscriptionPackage, gateway: 'razorpay' | 'phonepe') => {
    setBusyPackage(plan.id);
    setMessage(null);

    if (freeMode) {
      setMessage({ tone: 'success', text: 'This deployment is in free mode, so no payment is needed.' });
      setBusyPackage(null);
      return;
    }

    if (gateway === 'phonepe') {
      const result = await createPhonePePayment(plan.id);
      setBusyPackage(null);
      if (!result.ok) {
        setMessage({ tone: 'error', text: result.message });
        return;
      }
      window.location.assign(result.data.redirect_url);
      return;
    }

    const order = await createRazorpayOrder(plan.id);
    if (!order.ok) {
      setBusyPackage(null);
      setMessage({ tone: 'error', text: order.message });
      return;
    }

    const available = await loadRazorpay();
    if (!available || !window.Razorpay) {
      setBusyPackage(null);
      setMessage({
        tone: 'error',
        text: 'The secure checkout could not load. Check your connection and try again.',
      });
      return;
    }

    const checkout = new window.Razorpay({
      key: order.data.key_id,
      amount: order.data.amount,
      currency: order.data.currency,
      name: 'Advaita Matrimony',
      description: `${plan.name} membership`,
      order_id: order.data.order_id,
      prefill: {
        name: order.data.user_name,
        email: order.data.user_email ?? undefined,
        contact: order.data.user_phone,
      },
      theme: { color: '#7b2d3b' },
      handler: (response) => {
        void (async () => {
          const verified = await verifyRazorpayPayment(response);
          setBusyPackage(null);
          if (!verified.ok) {
            setMessage({ tone: 'error', text: verified.message });
            return;
          }
          setMessage({
            tone: 'success',
            text: verified.message ?? 'Payment verified. Your membership is now active.',
          });
          router.refresh();
        })();
      },
      modal: { ondismiss: () => setBusyPackage(null) },
    });
    checkout.open();
  };

  const usage = subscription?.has_subscription ? subscription.data.usage : null;

  return (
    <div className={styles.stack}>
      {message && <Alert tone={message.tone === 'success' ? 'success' : 'error'}>{message.text}</Alert>}

      {subscription?.has_subscription && usage && (
        <section className={styles.panel} aria-labelledby="active-plan-heading">
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle} id="active-plan-heading">
                {subscription.data.package_name}
              </h2>
              <p className={styles.panelSubtitle}>
                {subscription.data.days_remaining} days remaining · expires{' '}
                {formatDate(subscription.data.expires_at)}
              </p>
            </div>
            <Badge tone="premium" icon="crown">
              Active
            </Badge>
          </div>
          <div className={styles.usageGrid}>
            {Object.entries(usage).map(([key, raw]) => {
              const parsed = parseUsage(raw);
              return (
                <div className={styles.usageItem} key={key}>
                  <p className={styles.usageTitle}>{key.replaceAll('_', ' ')}</p>
                  <p className={styles.usageValue}>
                    {parsed.limit === null ? `${parsed.used} · unlimited` : raw}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Note icon="shield-check">
        Payments are created and verified by the Laravel backend. Advaita does not store your card or UPI
        details. Plans do not renew automatically.
      </Note>

      {packages.length === 0 ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Plans are temporarily unavailable</h2>
          <p className={styles.panelSubtitle}>
            We could not load the live package catalogue. No prices are shown until the server provides them.
          </p>
        </section>
      ) : (
        <section aria-labelledby="plans-heading">
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle} id="plans-heading">
                Choose your pace
              </h2>
              <p className={styles.panelSubtitle}>
                Every price and feature below comes from the live package catalogue.
              </p>
            </div>
          </div>
          <div className={styles.planGrid}>
            {packages.map((plan) => (
              <article
                className={[styles.plan, plan.is_popular ? styles.planPopular : ''].filter(Boolean).join(' ')}
                key={plan.id}
              >
                {plan.is_popular && (
                  <Badge className={styles.planRibbon} tone="premium">
                    Most chosen
                  </Badge>
                )}
                <div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDescription}>
                    {plan.description ?? `${plan.duration_days}-day membership`}
                  </p>
                </div>
                <p className={styles.price}>
                  {formatRupees(plan.effective_price)} <small>/ {plan.duration_days} days</small>
                </p>
                <ul className={styles.featureList}>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" /> <span>{feature}</span>
                    </li>
                  ))}
                  <li>
                    <Icon name="check" /> <span>{formatLimit(plan.limits.interests)} interests</span>
                  </li>
                  <li>
                    <Icon name="check" />{' '}
                    <span>
                      {plan.includes.advanced_search ? 'Advanced search included' : 'Core search included'}
                    </span>
                  </li>
                </ul>
                <div className={styles.formActions}>
                  <Button
                    variant={plan.is_popular ? 'premium' : 'primary'}
                    block
                    loading={busyPackage === plan.id}
                    onClick={() => void choosePlan(plan, 'razorpay')}
                  >
                    Pay securely
                  </Button>
                  <Button
                    variant="ghost"
                    block
                    disabled={busyPackage !== null}
                    onClick={() => void choosePlan(plan, 'phonepe')}
                  >
                    Use PhonePe
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {history && history.data.length > 0 && (
        <section className={styles.panel} aria-labelledby="payment-history-heading">
          <h2 className={styles.panelTitle} id="payment-history-heading">
            Payment history
          </h2>
          <ul className={styles.detailList}>
            {history.data.map((payment) => (
              <li className={styles.detailRow} key={payment.id}>
                <span className={styles.detailTerm}>{formatDate(payment.created_at)}</span>
                <span className={styles.detailValue}>
                  {payment.package?.name ?? 'Membership'} · {formatRupees(payment.amount)} · {payment.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
