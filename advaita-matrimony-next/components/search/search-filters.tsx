'use client';

/**
 * Advanced search filters.
 *
 * URL-DRIVEN, NOT COMPONENT STATE. Every filter lives in the query string, so a
 * search is shareable, bookmarkable, survives a reload and works with Back. That
 * also means the results are rendered on the server from the same params, with no
 * client-side fetching or loading cascade.
 *
 * Desktop shows the rail inline; mobile opens the same controls in a bottom sheet.
 * One implementation, two presentations — the filter set cannot drift between them.
 *
 * SAVED SEARCHES ARE LOCAL. There is no endpoint for them, so they live in
 * localStorage and the UI says "on this device". Storing them silently and letting
 * a member assume they follow their account would be a small lie with an annoying
 * payoff.
 *
 * NOT OFFERED AS A FILTER, DELIBERATELY:
 *  • Complexion — the column exists and the API would accept it. Filtering people
 *    by skin tone is colourism with a dropdown, so it is absent here and absent
 *    from the search payload.
 *  • Disability type / vitiligo coverage — the API accepts both. They are offered
 *    only as a broad "communities" choice, because filtering members by the
 *    specifics of their disability is exactly the sorting this platform exists to
 *    avoid. Members choose what to share on their own profile instead.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Chip, ChipGroup } from '../ui/badge';
import { Checkbox, OptionCardGroup } from '../ui/choice';
import { SelectField, TextField } from '../ui/field';
import { RangeSlider } from '../ui/range';
import { SearchableCheckList } from '../ui/select-list';
import { Sheet } from '../ui/overlay';
import { Note } from '../ui/feedback';
import { useToast } from '../ui/toast';
import { formatHeight } from '../../lib/format';
import {
  AGE_RANGE,
  EDUCATION_LEVELS,
  HEIGHT_RANGE_CM,
  INDIAN_STATES,
  MARITAL_STATUS_LABELS,
  MOTHER_TONGUES,
  PROFILE_CATEGORY_LABELS,
  RELIGIONS,
  optionsOf,
} from '../../lib/enums';
import type { MaritalStatus, ProfileCategory, SearchFilters } from '../../lib/api/types';
import styles from '../member/member.module.css';

const SAVED_SEARCH_KEY = 'advaita:saved-searches';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
}

/** Parses the URL query into a filter object. Unknown values are ignored. */
export function parseSearchFilters(params: Record<string, string | undefined>): SearchFilters {
  const int = (value: string | undefined): number | undefined => {
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const categories = params.categories
    ?.split(',')
    .filter((value): value is ProfileCategory => value in PROFILE_CATEGORY_LABELS);

  return {
    min_age: int(params.min_age),
    max_age: int(params.max_age),
    min_height: int(params.min_height),
    max_height: int(params.max_height),
    state: params.state || undefined,
    city: params.city || undefined,
    religion: params.religion || undefined,
    education: params.education || undefined,
    mother_tongue: params.mother_tongue || undefined,
    marital_status: (params.marital_status as MaritalStatus) || undefined,
    profile_category: categories && categories.length > 0 ? categories : undefined,
    with_photo: params.with_photo === '1' ? true : undefined,
    recently_active: params.recently_active === '1' ? true : undefined,
    premium_only: params.premium_only === '1' ? true : undefined,
    per_page: 24,
    page: int(params.page) ?? 1,
  };
}

/** Human labels for the active-filter chips. */
export function describeFilters(filters: SearchFilters): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];

  if (filters.min_age || filters.max_age) {
    chips.push({
      key: 'age',
      label: `Age ${filters.min_age ?? AGE_RANGE.min}–${filters.max_age ?? AGE_RANGE.max}`,
    });
  }
  if (filters.min_height || filters.max_height) {
    chips.push({
      key: 'height',
      label: `Height ${formatHeight(filters.min_height ?? HEIGHT_RANGE_CM.min)} – ${formatHeight(
        filters.max_height ?? HEIGHT_RANGE_CM.max,
      )}`,
    });
  }
  if (filters.state) chips.push({ key: 'state', label: filters.state });
  if (filters.city) chips.push({ key: 'city', label: filters.city });
  if (filters.religion) chips.push({ key: 'religion', label: filters.religion });
  if (filters.education) chips.push({ key: 'education', label: filters.education });
  if (filters.mother_tongue) chips.push({ key: 'mother_tongue', label: filters.mother_tongue });
  if (filters.marital_status) {
    chips.push({ key: 'marital_status', label: MARITAL_STATUS_LABELS[filters.marital_status] });
  }
  if (Array.isArray(filters.profile_category)) {
    for (const category of filters.profile_category) {
      chips.push({ key: `categories:${category}`, label: PROFILE_CATEGORY_LABELS[category] });
    }
  }
  if (filters.with_photo) chips.push({ key: 'with_photo', label: 'Has a photo' });
  if (filters.recently_active) chips.push({ key: 'recently_active', label: 'Recently active' });
  if (filters.premium_only) chips.push({ key: 'premium_only', label: 'Premium members' });

  return chips;
}

/* ==========================================================================
   Draft state
   ========================================================================== */

interface Draft {
  ageRange: [number, number];
  heightRange: [number, number];
  state: string;
  city: string;
  religion: string;
  education: string;
  motherTongue: string;
  maritalStatus: string;
  categories: ProfileCategory[];
  withPhoto: boolean;
  recentlyActive: boolean;
  premiumOnly: boolean;
}

function draftFromFilters(filters: SearchFilters): Draft {
  return {
    ageRange: [filters.min_age ?? AGE_RANGE.min, filters.max_age ?? AGE_RANGE.max],
    heightRange: [filters.min_height ?? HEIGHT_RANGE_CM.min, filters.max_height ?? HEIGHT_RANGE_CM.max],
    state: filters.state ?? '',
    city: filters.city ?? '',
    religion: filters.religion ?? '',
    education: filters.education ?? '',
    motherTongue: filters.mother_tongue ?? '',
    maritalStatus: filters.marital_status ?? '',
    categories: Array.isArray(filters.profile_category)
      ? filters.profile_category
      : filters.profile_category
        ? [filters.profile_category]
        : [],
    withPhoto: filters.with_photo === true,
    recentlyActive: filters.recently_active === true,
    premiumOnly: filters.premium_only === true,
  };
}

function draftToQuery(draft: Draft): string {
  const params = new URLSearchParams();

  // Only send a bound when it actually narrows the search — sending the full
  // range would look like a filter in the chips while doing nothing.
  if (draft.ageRange[0] > AGE_RANGE.min) params.set('min_age', String(draft.ageRange[0]));
  if (draft.ageRange[1] < AGE_RANGE.max) params.set('max_age', String(draft.ageRange[1]));
  if (draft.heightRange[0] > HEIGHT_RANGE_CM.min) params.set('min_height', String(draft.heightRange[0]));
  if (draft.heightRange[1] < HEIGHT_RANGE_CM.max) params.set('max_height', String(draft.heightRange[1]));

  if (draft.state) params.set('state', draft.state);
  if (draft.city.trim()) params.set('city', draft.city.trim());
  if (draft.religion) params.set('religion', draft.religion);
  if (draft.education) params.set('education', draft.education);
  if (draft.motherTongue) params.set('mother_tongue', draft.motherTongue);
  if (draft.maritalStatus) params.set('marital_status', draft.maritalStatus);
  if (draft.categories.length > 0) params.set('categories', draft.categories.join(','));
  if (draft.withPhoto) params.set('with_photo', '1');
  if (draft.recentlyActive) params.set('recently_active', '1');
  if (draft.premiumOnly) params.set('premium_only', '1');

  return params.toString();
}

/* ==========================================================================
   Controls
   ========================================================================== */

function Controls({ draft, set }: { draft: Draft; set: (patch: Partial<Draft>) => void }) {
  return (
    <>
      <div className={styles.filterGroup}>
        <RangeSlider
          label="Age"
          min={AGE_RANGE.min}
          max={AGE_RANGE.max}
          value={draft.ageRange}
          onChange={(value) => set({ ageRange: value })}
          minLabel="Minimum age"
          maxLabel="Maximum age"
        />
      </div>

      <div className={styles.filterGroup}>
        <RangeSlider
          label="Height"
          min={HEIGHT_RANGE_CM.min}
          max={HEIGHT_RANGE_CM.max}
          value={draft.heightRange}
          onChange={(value) => set({ heightRange: value })}
          format={(value) => formatHeight(value) ?? `${value} cm`}
          minLabel="Minimum height"
          maxLabel="Maximum height"
        />
      </div>

      <div className={styles.filterGroup}>
        <SelectField
          label="State"
          name="state"
          options={INDIAN_STATES.map((state) => ({ value: state, label: state }))}
          value={draft.state}
          onChange={(value) => set({ state: value })}
          icon="pin"
        />
        <TextField label="City" name="city" value={draft.city} onChange={(value) => set({ city: value })} />
      </div>

      <div className={styles.filterGroup}>
        <SelectField
          label="Religion"
          name="religion"
          options={RELIGIONS.map((religion) => ({ value: religion, label: religion }))}
          value={draft.religion}
          onChange={(value) => set({ religion: value })}
        />
        <SelectField
          label="Mother tongue"
          name="mother_tongue"
          options={MOTHER_TONGUES.map((tongue) => ({ value: tongue, label: tongue }))}
          value={draft.motherTongue}
          onChange={(value) => set({ motherTongue: value })}
        />
        <SelectField
          label="Marital status"
          name="marital_status"
          options={optionsOf(MARITAL_STATUS_LABELS)}
          value={draft.maritalStatus}
          onChange={(value) => set({ maritalStatus: value })}
        />
      </div>

      <div className={styles.filterGroup}>
        <SearchableCheckList
          label="Education"
          options={EDUCATION_LEVELS}
          value={draft.education ? [draft.education] : []}
          /* The API takes a single education value, so keep the last chosen. */
          onChange={(value) => set({ education: value[value.length - 1] ?? '' })}
          maxHeight={190}
        />
      </div>

      <div className={styles.filterGroup}>
        <OptionCardGroup<ProfileCategory>
          legend="Communities"
          multiple
          minWidth={130}
          options={(Object.keys(PROFILE_CATEGORY_LABELS) as ProfileCategory[]).map((category) => ({
            value: category,
            title: PROFILE_CATEGORY_LABELS[category],
          }))}
          value={draft.categories}
          onChange={(value) => set({ categories: value })}
        />
      </div>

      <div className={styles.filterGroup}>
        <Checkbox
          label="Has a photo"
          strong
          checked={draft.withPhoto}
          onChange={(checked) => set({ withPhoto: checked })}
        />
        <Checkbox
          label="Active in the last few days"
          strong
          checked={draft.recentlyActive}
          onChange={(checked) => set({ recentlyActive: checked })}
        />
        <Checkbox
          label="Premium members only"
          strong
          checked={draft.premiumOnly}
          onChange={(checked) => set({ premiumOnly: checked })}
        />
      </div>
    </>
  );
}

/* ==========================================================================
   SearchFilterPanel
   ========================================================================== */

export function SearchFilterPanel({ filters }: { filters: SearchFilters }) {
  const router = useRouter();
  const toast = useToast();

  const [draft, setDraft] = useState<Draft>(() => draftFromFilters(filters));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  /* Re-sync when the URL changes (Back, a chip removal, a saved search). */
  useEffect(() => {
    setDraft(draftFromFilters(filters));
  }, [filters]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_SEARCH_KEY);
      if (raw) setSaved(JSON.parse(raw) as SavedSearch[]);
    } catch {
      // Storage unavailable; saved searches simply do not appear.
    }
  }, []);

  const set = useCallback((patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const apply = useCallback(() => {
    const query = draftToQuery(draft);
    router.push(query ? `/search?${query}` : '/search');
    setSheetOpen(false);
  }, [draft, router]);

  const clear = useCallback(() => {
    router.push('/search');
    setSheetOpen(false);
  }, [router]);

  const persist = useCallback(
    (next: SavedSearch[]) => {
      setSaved(next);
      try {
        window.localStorage.setItem(SAVED_SEARCH_KEY, JSON.stringify(next));
      } catch {
        toast.error('Could not save that search', 'Your browser is blocking local storage.');
      }
    },
    [toast],
  );

  const saveCurrent = useCallback(() => {
    const query = draftToQuery(draft);
    if (!query) {
      toast.toast({ title: 'Nothing to save', description: 'Choose at least one filter first.' });
      return;
    }
    const chips = describeFilters(parseSearchFilters(Object.fromEntries(new URLSearchParams(query))));
    const name =
      chips
        .slice(0, 3)
        .map((chip) => chip.label)
        .join(' · ') || 'Search';
    persist([{ id: String(Date.now()), name, query }, ...saved].slice(0, 6));
    toast.success('Search saved', 'It is stored on this device.');
  }, [draft, persist, saved, toast]);

  const activeCount = useMemo(() => describeFilters(filters).length, [filters]);

  const footer = (
    <>
      <Button variant="ghost" onClick={clear}>
        Clear all
      </Button>
      <Button onClick={apply} icon="search">
        Show results
      </Button>
    </>
  );

  return (
    <>
      {/* -------- Desktop rail -------- */}
      <aside className={styles.filterRail} aria-label="Search filters">
        <Controls draft={draft} set={set} />

        <div className={styles.filterFoot}>
          <Button onClick={apply} icon="search" block>
            Show results
          </Button>
          <Button variant="ghost" onClick={clear} block>
            Clear all
          </Button>
          <Button variant="secondary" onClick={saveCurrent} icon="star" size="sm" block>
            Save this search
          </Button>
        </div>

        {saved.length > 0 && (
          <div className={styles.filterGroup}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--text-muted)' }}>
              SAVED ON THIS DEVICE
            </p>
            <ChipGroup label="Saved searches">
              {saved.map((entry) => (
                <Chip
                  key={entry.id}
                  onRemove={() => persist(saved.filter((item) => item.id !== entry.id))}
                  removeLabel={`Delete saved search ${entry.name}`}
                >
                  <button
                    type="button"
                    className="inline-control"
                    onClick={() => router.push(`/search?${entry.query}`)}
                    style={{ color: 'inherit', font: 'inherit', textAlign: 'start' }}
                  >
                    {entry.name}
                  </button>
                </Chip>
              ))}
            </ChipGroup>
            <Note icon="info">Saved searches are kept in this browser, not on your account.</Note>
          </div>
        )}
      </aside>

      {/* -------- Mobile trigger + sheet -------- */}
      <div className="hide-desktop" style={{ display: 'grid' }}>
        <Button variant="secondary" icon="sliders" onClick={() => setSheetOpen(true)} block>
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        description="Narrow the results, then show them."
        footer={footer}
        footerSpread
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <Controls draft={draft} set={set} />
          <Button variant="secondary" onClick={saveCurrent} icon="star" block>
            Save this search on this device
          </Button>
        </div>
      </Sheet>
    </>
  );
}

/* ==========================================================================
   Active filter chips
   ========================================================================== */

/**
 * Removable chips for the filters in effect.
 *
 * Removing one rewrites the URL, which re-renders the results on the server — the
 * chips and the results can never disagree, because they read the same source.
 */
export function ActiveFilterChips({ filters }: { filters: SearchFilters }) {
  const router = useRouter();
  const chips = describeFilters(filters);
  if (chips.length === 0) return null;

  const removeChip = (key: string) => {
    const params = new URLSearchParams();
    const draft = draftFromFilters(filters);

    // Rebuild without the removed key.
    if (key === 'age') {
      draft.ageRange = [AGE_RANGE.min, AGE_RANGE.max];
    } else if (key === 'height') {
      draft.heightRange = [HEIGHT_RANGE_CM.min, HEIGHT_RANGE_CM.max];
    } else if (key.startsWith('categories:')) {
      const value = key.split(':')[1] as ProfileCategory;
      draft.categories = draft.categories.filter((category) => category !== value);
    } else if (key === 'state') draft.state = '';
    else if (key === 'city') draft.city = '';
    else if (key === 'religion') draft.religion = '';
    else if (key === 'education') draft.education = '';
    else if (key === 'mother_tongue') draft.motherTongue = '';
    else if (key === 'marital_status') draft.maritalStatus = '';
    else if (key === 'with_photo') draft.withPhoto = false;
    else if (key === 'recently_active') draft.recentlyActive = false;
    else if (key === 'premium_only') draft.premiumOnly = false;

    const query = draftToQuery(draft);
    params.toString();
    router.push(query ? `/search?${query}` : '/search');
  };

  return (
    <div className={styles.activeFilters}>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          onRemove={() => removeChip(chip.key)}
          removeLabel={`Remove filter ${chip.label}`}
        >
          {chip.label}
        </Chip>
      ))}
      <Button variant="ghost" size="sm" icon="close" onClick={() => router.push('/search')}>
        Clear all
      </Button>
    </div>
  );
}
