import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Loader2, Pencil } from 'lucide-react';
import { billingService } from '@/lib/billing/service';
import { pricingUrl } from '@/lib/routes';
import { userService } from '@/lib/user/service';
import { useUserProfile } from '@/lib/user/useUserProfile';

const creditsHistoryPageSize = 5;

function toEditableProfile(data) {
  const nickname = data?.nickname || data?.email?.split('@')[0] || 'LazyKiwi User';
  const [firstName, ...rest] = nickname.trim().split(/\s+/);
  return {
    firstName: firstName || '',
    lastName: rest.join(' '),
    email: data?.email || '',
    nickname,
    avatar: data?.avatar || '',
    sex: data?.sex,
  };
}

function getInitials(profile) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.nickname || profile.email || 'LK';
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Settings({ navigateToPage }) {
  const { credits: accountCredits, loading: accountCreditsLoading } = useUserProfile();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', nickname: '', avatar: '', sex: undefined });
  const [draft, setDraft] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(creditsHistoryPageSize);
  const [subscription, setSubscription] = useState(null);
  const [creditsHistory, setCreditsHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);

  useEffect(() => {
    userService.getProfile().then((data) => {
      const nextProfile = toEditableProfile(data);
      setProfile(nextProfile);
      setDraft(nextProfile);
    }).catch(() => {
      setProfile((current) => ({ ...current, firstName: 'LazyKiwi', lastName: 'User' }));
    });
    billingService.getCurrentSubscription().then(setSubscription).catch(() => setSubscription(null));
    userService.getPointRecords(1, 20).then((data) => {
      setCreditsHistory(
        (data?.list ?? []).map((item) => ({
          task: item.title || item.description || 'Credits update',
          credits: item.point,
          lastActiveOn: item.createTime ? new Date(item.createTime).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          }) : '-',
        })),
      );
      setHistoryTotal(data?.total ?? 0);
    }).catch(() => {
      setCreditsHistory([]);
      setHistoryTotal(0);
    });
  }, []);

  const visibleCreditsHistory = creditsHistory.slice(0, visibleHistoryCount);
  const hasMoreCreditsHistory = visibleHistoryCount < creditsHistory.length;

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigateToPage?.('home', '/app/home');
  };

  const handleCancel = () => {
    setDraft(profile);
    setProfileError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const firstName = draft.firstName.trim();
    const lastName = draft.lastName.trim();
    const nickname = [firstName, lastName].filter(Boolean).join(' ').trim();
    if (!nickname) {
      setProfileError('Please enter your name.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');
    setProfileSaved(false);
    try {
      await userService.updateProfile({
        nickname,
        avatar: draft.avatar || '',
        email: draft.email || undefined,
        sex: draft.sex,
      });
      const refreshed = await userService.getProfile();
      const nextProfile = toEditableProfile(refreshed);
      setProfile(nextProfile);
      setDraft(nextProfile);
      setIsEditing(false);
      setProfileSaved(true);
      window.setTimeout(() => setProfileSaved(false), 1800);
    } catch (error) {
      setProfileError(error?.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const initials = getInitials(profile);
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.nickname || 'LazyKiwi User';
  const displayedCreditsLeft = accountCredits ?? subscription?.currentPoints ?? 0;
  const creditsLeftLabel = accountCreditsLoading && accountCredits == null
    ? '...'
    : displayedCreditsLeft.toLocaleString();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <button
        type="button"
        onClick={handleBack}
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-bold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
      >
        <ArrowLeft size={15} />
        Back
      </button>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-kiwi-green-dark">Account</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">Settings</h1>
      </div>

      <section className="rounded-3xl border border-gray-200/80 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-kiwi-green to-lime-300 text-lg font-extrabold text-gray-950 shadow-sm">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">{displayName}</h2>
              <p className="mt-1 text-sm text-gray-500">{profile.email || '-'}</p>
              {profileSaved && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-kiwi-green-dark">
                  <Check size={14} />
                  Profile updated
                </p>
              )}
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <Pencil size={15} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile && <Loader2 size={15} className="animate-spin" />}
                Save
              </button>
            </div>
          )}
        </div>

        {profileError && <p className="mt-5 text-sm font-semibold text-red-600">{profileError}</p>}

        <div className="mt-8 grid gap-5 border-t border-gray-100 pt-6 sm:grid-cols-2">
          <ProfileField
            label="First name"
            value={isEditing ? draft.firstName : profile.firstName}
            isEditing={isEditing}
            onChange={(value) => setDraft((current) => ({ ...current, firstName: value }))}
          />
          <ProfileField
            label="Last name"
            value={isEditing ? draft.lastName : profile.lastName}
            isEditing={isEditing}
            onChange={(value) => setDraft((current) => ({ ...current, lastName: value }))}
          />
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-gray-200/80 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
        <h2 className="text-xl font-extrabold text-gray-900">Subscription</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Plan</p>
            <p className="mt-2 text-lg font-extrabold text-gray-900">
              {subscription?.planName ? `${subscription.planName} Plan` : 'No active plan'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Period</p>
            <p className="mt-2 text-sm font-semibold text-gray-700">
              {subscription?.currentPeriodEnd
                ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}`
                : '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-gray-200/80 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Credits left</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
              {creditsLeftLabel}
              {subscription?.planCredits ? (
                <span className="text-base text-gray-400"> / {subscription.planCredits.toLocaleString()}</span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.assign(pricingUrl())}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-black"
          >
            Upgrade plans
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-7">
          <h2 className="text-xl font-extrabold text-gray-900">Credits History</h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-4 font-bold">Task</th>
                  <th className="px-5 py-4 font-bold">Total credits used</th>
                  <th className="px-5 py-4 font-bold">Last active on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleCreditsHistory.map((item) => (
                  <tr key={`${item.task}-${item.lastActiveOn}`} className="text-sm text-gray-600">
                    <td className="px-5 py-4 font-semibold text-gray-800">{item.task}</td>
                    <td className="px-5 py-4 font-bold text-gray-700">{item.credits}</td>
                    <td className="px-5 py-4">{item.lastActiveOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMoreCreditsHistory && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleHistoryCount((count) => Math.min(count + creditsHistoryPageSize, creditsHistory.length))}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfileField({ label, value, isEditing, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
      {isEditing ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-kiwi-green-dark focus:ring-4 focus:ring-kiwi-green/10"
        />
      ) : (
        <span className="mt-2 block text-sm font-semibold text-gray-800">{value}</span>
      )}
    </label>
  );
}
