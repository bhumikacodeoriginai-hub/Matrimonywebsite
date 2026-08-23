'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '../ui/feedback';
import { Button } from '../ui/button';
import { SelectField, TextArea, TextField } from '../ui/field';
import { updateProfile } from '../../lib/api/actions';
import { useAction } from '../../lib/hooks/use-action';
import { INDIAN_STATES, FAMILY_TYPE_LABELS, PROFILE_CATEGORY_LABELS } from '../../lib/enums';
import type { FamilyType, MyProfileResponse, ProfileCategory } from '../../lib/api/types';
import styles from './account.module.css';

const categoryOptions = (Object.keys(PROFILE_CATEGORY_LABELS) as ProfileCategory[]).map((value) => ({
  value,
  label: PROFILE_CATEGORY_LABELS[value],
}));

export function ProfileEditor({ profileData }: { profileData: MyProfileResponse }) {
  const { user } = profileData;
  const profile = user.profile;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user.date_of_birth ?? '');
  const [category, setCategory] = useState<ProfileCategory>(profile?.profile_category ?? 'general');
  const [city, setCity] = useState(profile?.city ?? '');
  const [state, setState] = useState(profile?.state ?? '');
  const [education, setEducation] = useState(profile?.highest_education ?? '');
  const [occupation, setOccupation] = useState(profile?.occupation ?? '');
  const [about, setAbout] = useState(profile?.about_me ?? '');
  const [familyType, setFamilyType] = useState<FamilyType | ''>(profile?.family_type ?? '');
  const [familyDetails, setFamilyDetails] = useState(profile?.family_details ?? '');
  const [hobbies, setHobbies] = useState((profile?.hobbies ?? []).join(', '));

  const save = useAction(updateProfile);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await save.run({
      name: name.trim(),
      email: email.trim(),
      date_of_birth: dateOfBirth,
      profile_category: category,
      city: city.trim() || null,
      state: state || null,
      highest_education: education.trim() || null,
      occupation: occupation.trim() || null,
      about_me: about.trim() || null,
      family_type: familyType || null,
      family_details: familyDetails.trim() || null,
      hobbies: hobbies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    });
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      {save.error && <Alert tone="error">{save.error}</Alert>}
      {save.message && <Alert tone="success">{save.message}</Alert>}

      <div className={styles.formGrid}>
        <TextField
          label="Full name"
          name="name"
          value={name}
          onChange={setName}
          required
          autoComplete="name"
        />
        <TextField
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <TextField
          label="Date of birth"
          name="date_of_birth"
          type="date"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          id="basics"
          help="Your date of birth is used to show an accurate age. You must be 18 or older."
          required
        />
        <SelectField
          label="Community"
          name="profile_category"
          options={categoryOptions}
          value={category}
          onChange={(value) => setCategory(value as ProfileCategory)}
          help="This is how your profile is grouped in the member experience."
        />
        <TextField
          label="City"
          name="city"
          value={city}
          onChange={setCity}
          autoComplete="address-level2"
          id="location"
        />
        <SelectField
          label="State"
          name="state"
          options={INDIAN_STATES.map((value) => ({ value, label: value }))}
          value={state}
          onChange={setState}
          placeholder="Choose a state"
        />
        <TextField
          label="Highest education"
          name="highest_education"
          value={education}
          onChange={setEducation}
          id="career"
        />
        <TextField label="Occupation" name="occupation" value={occupation} onChange={setOccupation} />
        <TextArea
          label="About you"
          name="about_me"
          value={about}
          onChange={setAbout}
          maxLength={1000}
          rows={6}
          showCounter
          className={styles.full}
          help="A specific, warm introduction helps someone start a real conversation."
          id="about"
        />
        <SelectField
          label="Family type"
          name="family_type"
          options={Object.entries(FAMILY_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          value={familyType}
          onChange={(value) => setFamilyType(value as FamilyType)}
          placeholder="Choose if you would like to share"
          id="family"
        />
        <TextField
          label="Hobbies and interests"
          name="hobbies"
          value={hobbies}
          onChange={setHobbies}
          help="Separate several interests with commas."
          id="lifestyle"
        />
        <TextArea
          label="Family details"
          name="family_details"
          value={familyDetails}
          onChange={setFamilyDetails}
          maxLength={1000}
          rows={4}
          showCounter
          className={styles.full}
          help="Optional. Share only what feels comfortable."
        />
      </div>

      <div className={styles.formActions}>
        <Button type="submit" icon="check" loading={save.isPending} loadingLabel="Saving your profile">
          Save changes
        </Button>
        <span className={styles.muted} role="status" aria-live="polite">
          {save.state === 'success'
            ? 'Saved just now.'
            : 'Only the fields you change are used by the member experience.'}
        </span>
      </div>
    </form>
  );
}
