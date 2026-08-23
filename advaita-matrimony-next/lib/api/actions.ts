'use client';

/**
 * Client-side mutations, routed through the /api/bff proxy.
 *
 * Everything returns an `ActionResult` rather than throwing, so components can
 * render precise success / error / conflict states without a try-catch in every
 * handler. The distinctions matter here: "you have used all your interests for
 * this plan" (403) and "you already sent this person an interest" (409) need very
 * different UI, and both are normal outcomes rather than failures.
 */

import { ApiError, friendlyMessage, type FieldErrors, isSoftFailure } from './client';
import { bff, authRoute } from './bff';
import type {
  ApiSuccess,
  ConversationSummary,
  InterestStatus,
  MessageRecord,
  Paginated,
  PartnerPreferenceRecord,
  PhotoRecord,
  PhonePeOrder,
  ProfileCardData,
  ProfileUpdatePayload,
  RazorpayOrder,
  RazorpayVerifyPayload,
  SearchFilters,
} from './types';

/* ==========================================================================
   Result type
   ========================================================================== */

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | {
      ok: false;
      message: string;
      status?: number;
      fieldErrors?: FieldErrors;
      /** Server said 409 — the action was already performed. Often not an error. */
      alreadyDone?: boolean;
      /** Server said 403 — usually a plan limit or a block. */
      notAllowed?: boolean;
    };

function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

function fail(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return {
      ok: false,
      message: friendlyMessage(error),
      status: error.status,
      fieldErrors: error.fieldErrors,
      alreadyDone: error.isConflict,
      notAllowed: error.isForbidden,
    };
  }
  return { ok: false, message: friendlyMessage(error) };
}

/* ==========================================================================
   Interests
   ========================================================================== */

/**
 * `POST /interests/send/{userId}`
 *
 * Known server responses: 200 success, 409 already sent, 403 plan limit reached,
 * 422 sending to yourself.
 */
export async function sendInterest(userId: number, message?: string): Promise<ActionResult> {
  try {
    const response = await bff<{ success: boolean; message: string }>(`/interests/send/${userId}`, {
      method: 'POST',
      body: message ? { message } : {},
    });
    return ok(undefined, response.message);
  } catch (error) {
    return fail(error);
  }
}

/**
 * `PUT /interests/{interestId}/respond`
 *
 * Accepting is what creates the Conversation row — it is the ONLY way chat is
 * ever unlocked between two members.
 */
export async function respondToInterest(
  interestId: number,
  status: Extract<InterestStatus, 'accepted' | 'rejected'>,
): Promise<ActionResult> {
  try {
    const response = await bff<{ success: boolean; message: string }>(`/interests/${interestId}/respond`, {
      method: 'PUT',
      body: { status },
    });
    return ok(undefined, response.message);
  } catch (error) {
    return fail(error);
  }
}

/* ==========================================================================
   Shortlist & blocking
   ========================================================================== */

export async function addToShortlist(userId: number): Promise<ActionResult> {
  try {
    await bff(`/shortlist/${userId}`, { method: 'POST' });
    return ok(undefined, 'Saved to your shortlist.');
  } catch (error) {
    return fail(error);
  }
}

export async function removeFromShortlist(userId: number): Promise<ActionResult> {
  try {
    await bff(`/shortlist/${userId}`, { method: 'DELETE' });
    return ok(undefined, 'Removed from your shortlist.');
  } catch (error) {
    return fail(error);
  }
}

/**
 * `POST /block/{userId}`
 *
 * NOTE: there is no unblock endpoint. Once the UI offers this it must say so
 * plainly, which is why the confirmation dialog warns that it cannot be undone
 * from the app yet. Tracked in docs/SECURITY_FINDINGS.md.
 */
export async function blockUser(userId: number, reason?: string): Promise<ActionResult> {
  try {
    await bff(`/block/${userId}`, { method: 'POST', body: reason ? { reason } : {} });
    return ok(undefined, 'This member can no longer see or contact you.');
  } catch (error) {
    return fail(error);
  }
}

/* ==========================================================================
   Photo privacy
   ========================================================================== */

export type PhotoRequestOutcome = 'sent' | 'already_pending' | 'already_granted';

/**
 * `POST /profiles/{userId}/request-photo`
 *
 * Returns HTTP 200 with `success: false` for "already pending" / "already
 * granted", so those are surfaced as outcomes rather than errors.
 *
 * ⚠️ This endpoint currently 500s on an unpatched backend: it references
 * `App\Models\PhotoAccessRequest` and `User::sentPhotoRequests()`, neither of
 * which exists. The fix ships in advaita-matrimony-web (see the PhotoAccessRequest
 * model added alongside this redesign). Until it is deployed, the UI shows a
 * "temporarily unavailable" state rather than a silent failure.
 */
export async function requestPhotoAccess(
  userId: number,
  message?: string,
): Promise<ActionResult<PhotoRequestOutcome>> {
  try {
    const response = await bff<{ success: boolean; message: string }>(`/profiles/${userId}/request-photo`, {
      method: 'POST',
      body: message ? { message } : {},
    });

    if (isSoftFailure(response)) {
      const outcome: PhotoRequestOutcome = /granted/i.test(response.message)
        ? 'already_granted'
        : 'already_pending';
      return ok(outcome, response.message);
    }

    return ok('sent', response.message);
  } catch (error) {
    return fail(error);
  }
}

/* ==========================================================================
   Own profile
   ========================================================================== */

/**
 * `PUT /profile/update`
 *
 * The server performs NO validation and mass-assigns whatever it receives onto
 * the `profiles` row, so an out-of-range enum becomes a MySQL error rather than a
 * friendly 422. Send only typed values from ProfileUpdatePayload.
 */
export async function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<ActionResult<{ profile_completion: number }>> {
  try {
    const response = await bff<{ success: boolean; message: string; profile_completion: number }>(
      '/profile/update',
      { method: 'PUT', body: payload },
    );
    return ok({ profile_completion: response.profile_completion }, response.message);
  } catch (error) {
    return fail(error);
  }
}

export async function updatePartnerPreferences(payload: PartnerPreferenceRecord): Promise<ActionResult> {
  try {
    const response = await bff<{ success: boolean; message: string }>('/profile/partner-preferences', {
      method: 'PUT',
      body: payload,
    });
    return ok(undefined, response.message);
  } catch (error) {
    return fail(error);
  }
}

/** Max 5 MB, jpeg/png/jpg/webp, max 8 photos per member (all enforced server-side). */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PHOTO_MAX_COUNT = 8;

/**
 * `POST /profile/photo/upload` (multipart)
 *
 * Client-side pre-checks exist to give instant, specific feedback — the server
 * remains the authority.
 */
export async function uploadPhoto(file: File, isPrimary = false): Promise<ActionResult<PhotoRecord>> {
  if (!PHOTO_ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, message: 'Please choose a JPG, PNG or WebP image.' };
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return { ok: false, message: 'That photo is larger than 5 MB. Please choose a smaller one.' };
  }

  const form = new FormData();
  form.append('photo', file);
  form.append('is_primary', isPrimary ? '1' : '0');

  try {
    const response = await bff<{ success: boolean; message: string; photo: PhotoRecord }>(
      '/profile/photo/upload',
      { method: 'POST', body: form },
    );
    return ok(response.photo, response.message);
  } catch (error) {
    return fail(error);
  }
}

export async function deletePhoto(photoId: number): Promise<ActionResult> {
  try {
    const response = await bff<{ success: boolean; message: string }>(`/profile/photo/${photoId}`, {
      method: 'DELETE',
    });
    return ok(undefined, response.message);
  } catch (error) {
    return fail(error);
  }
}

/* ==========================================================================
   Chat
   ========================================================================== */

/**
 * `POST /chat/conversations/{id}/send`
 *
 * `body` is required unless an attachment is present (`required_without`).
 * Attachments cap at 10 MB server-side.
 */
export async function sendMessage(
  conversationId: number,
  input: { body?: string; attachment?: File | null },
): Promise<ActionResult<MessageRecord>> {
  const text = input.body?.trim() ?? '';
  if (!text && !input.attachment) {
    return { ok: false, message: 'Write a message first.' };
  }

  try {
    let response: { success: boolean; data: MessageRecord };

    if (input.attachment) {
      const form = new FormData();
      if (text) form.append('body', text);
      form.append('attachment', input.attachment);
      form.append('type', input.attachment.type.startsWith('audio/') ? 'audio' : 'image');
      response = await bff(`/chat/conversations/${conversationId}/send`, { method: 'POST', body: form });
    } else {
      response = await bff(`/chat/conversations/${conversationId}/send`, {
        method: 'POST',
        body: { body: text, type: 'text' },
      });
    }

    return ok(response.data);
  } catch (error) {
    return fail(error);
  }
}

/** Client-side polling for new messages. There is no websocket or FCM push. */
export async function fetchMessages(
  conversationId: number,
  page = 1,
): Promise<Paginated<MessageRecord> | null> {
  try {
    const response = await bff<ApiSuccess<Paginated<MessageRecord>>>(
      `/chat/conversations/${conversationId}/messages`,
      { query: { page } },
    );
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchConversations(page = 1): Promise<Paginated<ConversationSummary> | null> {
  try {
    const response = await bff<ApiSuccess<Paginated<ConversationSummary>>>('/chat/conversations', {
      query: { page },
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await bff<{ success: true; count: number }>('/chat/unread-count');
    return response.count ?? 0;
  } catch {
    return 0;
  }
}

/* ==========================================================================
   Discovery (client-side pagination / filtering)
   ========================================================================== */

export async function fetchSearchResults(
  filters: SearchFilters,
): Promise<ActionResult<Paginated<ProfileCardData>>> {
  try {
    const response = await bff<ApiSuccess<Paginated<ProfileCardData>>>('/search', {
      query: filters as Record<string, string | number | boolean | undefined | (string | number)[]>,
    });
    return ok(response.data);
  } catch (error) {
    return fail(error);
  }
}

export async function fetchRecommendations(): Promise<ProfileCardData[]> {
  try {
    const response = await bff<ApiSuccess<ProfileCardData[]>>('/matches/recommended');
    return response.data ?? [];
  } catch {
    return [];
  }
}

/* ==========================================================================
   Payments
   ========================================================================== */

export async function createRazorpayOrder(packageId: number): Promise<ActionResult<RazorpayOrder>> {
  try {
    const response = await bff<RazorpayOrder>('/payments/razorpay/create-order', {
      method: 'POST',
      body: { package_id: packageId },
    });
    return ok(response);
  } catch (error) {
    return fail(error);
  }
}

export async function verifyRazorpayPayment(payload: RazorpayVerifyPayload): Promise<ActionResult> {
  try {
    const response = await bff<{ success: boolean; message: string }>('/payments/razorpay/verify', {
      method: 'POST',
      body: payload,
    });
    return ok(undefined, response.message);
  } catch (error) {
    return fail(error);
  }
}

export async function createPhonePePayment(packageId: number): Promise<ActionResult<PhonePeOrder>> {
  try {
    const response = await bff<PhonePeOrder>('/payments/phonepe/create', {
      method: 'POST',
      body: { package_id: packageId },
    });
    return ok(response);
  } catch (error) {
    return fail(error);
  }
}

/* ==========================================================================
   Session
   ========================================================================== */

export async function logout(): Promise<void> {
  try {
    await authRoute('/logout', { method: 'POST' });
  } catch {
    // The cookie is cleared server-side regardless; navigating away is enough.
  }
}
