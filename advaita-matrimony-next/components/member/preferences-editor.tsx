'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '../ui/feedback';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/choice';
import { TextArea, TextField } from '../ui/field';
import { updatePartnerPreferences } from '../../lib/api/actions';
import { useAction } from '../../lib/hooks/use-action';
import { PROFILE_CATEGORY_LABELS } from '../../lib/enums';
import type { PartnerPreferenceRecord, ProfileCategory } from '../../lib/api/types';
import styles from './account.module.css';

const categories = Object.keys(PROFILE_CATEGORY_LABELS) as ProfileCategory[];

export function PreferencesEditor({ preferences }: { preferences: PartnerPreferenceRecord | null }) {
  const [minAge, setMinAge] = useState(preferences?.min_age ? String(preferences.min_age) : '');
  const [maxAge, setMaxAge] = useState(preferences?.max_age ? String(preferences.max_age) : '');
  const [states, setStates] = useState((preferences?.preferred_states ?? []).join(', '));
  const [selectedCategories, setSelectedCategories] = useState<ProfileCategory[]>(
    preferences?.accepted_categories ?? [],
  );
  const [aboutPartner, setAboutPartner] = useState(preferences?.about_partner ?? '');
  const save = useAction(updatePartnerPreferences);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const preferredStates = states
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    await save.run({
      min_age: minAge ? Number(minAge) : null,
      max_age: maxAge ? Number(maxAge) : null,
      preferred_states: preferredStates.length > 0 ? preferredStates : null,
      accepted_categories: selectedCategories.length > 0 ? selectedCategories : null,
      about_partner: aboutPartner.trim() || null,
    });
  };

  const toggleCategory = (category: ProfileCategory, checked: boolean) => {
    setSelectedCategories((current) =>
      checked ? [...current, category] : current.filter((item) => item !== category),
    );
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      {save.error && <Alert tone="error">{save.error}</Alert>}
      {save.message && <Alert tone="success">{save.message}</Alert>}

      <div className={styles.formGrid}>
        <TextField
          label="Youngest age"
          name="min_age"
          type="number"
          min={18}
          max={75}
          value={minAge}
          onChange={setMinAge}
        />
        <TextField
          label="Oldest age"
          name="max_age"
          type="number"
          min={18}
          max={75}
          value={maxAge}
          onChange={setMaxAge}
        />
        <TextField
          label="Preferred states"
          name="preferred_states"
          value={states}
          onChange={setStates}
          className={styles.full}
          help="Separate multiple states with commas. Leave blank if location is open."
        />
      </div>

      <fieldset className={styles.form}>
        <legend className={styles.sectionLabel}>Communities you are open to</legend>
        <p className={styles.sectionHelp}>
          Leave every option unchecked if you do not want this to narrow discovery.
        </p>
        {categories.map((category) => (
          <Checkbox
            key={category}
            checked={selectedCategories.includes(category)}
            onChange={(checked) => toggleCategory(category, checked)}
            label={PROFILE_CATEGORY_LABELS[category]}
            name="accepted_categories"
          />
        ))}
      </fieldset>

      <TextArea
        label="What matters to you in a partner"
        name="about_partner"
        value={aboutPartner}
        onChange={setAboutPartner}
        maxLength={1000}
        rows={5}
        help="This note is private to your matching experience; it is not shown as a public ranking claim."
      />

      <div className={styles.formActions}>
        <Button type="submit" icon="sliders" loading={save.isPending} loadingLabel="Saving preferences">
          Save preferences
        </Button>
        <span className={styles.muted} role="status" aria-live="polite">
          {save.state === 'success' ? 'Preferences saved just now.' : 'You can change these at any time.'}
        </span>
      </div>
    </form>
  );
}
