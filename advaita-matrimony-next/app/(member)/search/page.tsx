/**
 * Advanced search.
 *
 * Server-rendered from the query string. The filter panel is the only client
 * component; it rewrites the URL, and this page re-renders the results. That means
 * no loading spinner cascade, no client-side fetch, and a URL that is a complete
 * description of what is on screen.
 *
 * `GET /search` returns NO `match_score`, so no compatibility badges appear here —
 * `preferences` is passed as null to every card, which is what suppresses them.
 * Discover is the only surface with real scores.
 */

import type { Metadata } from 'next';
import { ButtonLink } from '../../../components/ui/button';
import { EmptyState, Note } from '../../../components/ui/feedback';
import { PageHeader, Pager, ResultBar } from '../../../components/member/page-header';
import { ProfileCard } from '../../../components/profile/profile-card';
import {
  ActiveFilterChips,
  SearchFilterPanel,
  describeFilters,
  parseSearchFilters,
} from '../../../components/search/search-filters';
import { searchProfiles } from '../../../lib/api/queries';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Search' };

type SearchParams = Record<string, string | undefined>;

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = parseSearchFilters(params);
  const results = await searchProfiles(filters);

  const activeFilters = describeFilters(filters);

  /** Preserved across pagination so page 2 keeps the same filters. */
  const query = new URLSearchParams(
    Object.entries(params).filter(([key, value]) => key !== 'page' && value) as [string, string][],
  ).toString();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Search"
        subtitle="Filter by what actually matters to you. Every filter is reflected in the address bar, so you can bookmark or share a search."
        actions={
          <ButtonLink href="/discover" variant="secondary" icon="compass">
            Matched to me
          </ButtonLink>
        }
      />

      <div className={styles.withRail}>
        <SearchFilterPanel filters={filters} />

        <div style={{ display: 'grid', gap: 'var(--space-5)', minWidth: 0 }}>
          {activeFilters.length > 0 && <ActiveFilterChips filters={filters} />}

          {!results ? (
            <EmptyState
              icon="alert"
              title="Search is unavailable right now"
              body="We could not reach the search service. Please try again in a moment."
            >
              <ButtonLink href="/search">Try again</ButtonLink>
            </EmptyState>
          ) : results.data.length === 0 ? (
            <EmptyState
              icon="search"
              title="No profiles match those filters"
              body={
                activeFilters.length > 0
                  ? 'Try removing a filter or two. Age range and state are usually the ones that narrow things most.'
                  : 'There are no profiles to show yet. Please try again shortly.'
              }
            >
              <ButtonLink href="/search">Clear all filters</ButtonLink>
              <ButtonLink href="/discover" variant="secondary">
                See profiles matched to you
              </ButtonLink>
            </EmptyState>
          ) : (
            <>
              <ResultBar count={results.total} label="profiles found" />

              <div className={styles.cardGrid}>
                {results.data.map((profile, index) => (
                  /*
                    preferences={null} on purpose: /search returns no match_score,
                    so any percentage here would be fabricated.
                  */
                  <ProfileCard key={profile.id} profile={profile} preferences={null} index={index} />
                ))}
              </div>

              <Pager
                currentPage={results.current_page}
                lastPage={results.last_page}
                total={results.total}
                basePath="/search"
                query={query}
              />

              <Note icon="info">
                Search results are ordered by recent activity. To see profiles ranked against your
                preferences, use{' '}
                <a href="/discover" style={{ fontWeight: 800 }}>
                  Discover
                </a>
                .
              </Note>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
