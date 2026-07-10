import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Receipt, Coins, Images, ListChecks, Settings2, Search,
  ArrowUpRight, RefreshCw, Loader2, ShieldAlert, TrendingUp, CreditCard, Video, Image as ImageIcon,
} from 'lucide-react';
import { adminService } from '@/lib/admin/service';

const NAV_SECTIONS = [
  { id: 'dashboard', label: '数据看板', icon: LayoutDashboard, enabled: true },
  { id: 'users', label: '用户管理', icon: Users },
  { id: 'orders', label: '订单管理', icon: Receipt },
  { id: 'credits', label: '积分管理', icon: Coins },
  { id: 'content', label: '内容管理', icon: Images },
  { id: 'tasks', label: '任务管理', icon: ListChecks },
  { id: 'config', label: '配置管理', icon: Settings2 },
  { id: 'seo', label: 'SEO 管理', icon: Search },
];

function formatNumber(value) {
  if (value == null) return '0';
  return Number(value).toLocaleString('en-US');
}

function formatCurrency(minorUnits) {
  const amount = Number(minorUnits || 0) / 100;
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminDashboard({ navigateToPage }) {
  const [access, setAccess] = useState('checking'); // checking | granted | denied
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [usage, setUsage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setError('');
    const [summaryData, usageData] = await Promise.all([
      adminService.getSummary(),
      adminService.getFeatureUsage(),
    ]);
    setSummary(summaryData);
    setUsage(usageData);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const isAdmin = await adminService.checkAdmin();
      if (!mounted) return;
      if (!isAdmin) {
        setAccess('denied');
        setLoading(false);
        return;
      }
      setAccess('granted');
      try {
        await loadData();
      } catch (err) {
        if (mounted) setError(err?.message || '加载数据失败');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (err) {
      setError(err?.message || '刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  if (access === 'denied') {
    return <AccessDenied navigateToPage={navigateToPage} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F6F8FB] text-gray-900">
      <AdminSidebar navigateToPage={navigateToPage} />
      <main className="flex-1 min-w-0 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-kiwi-green-dark">Admin Console</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">数据看板</h1>
              <p className="mt-1 text-sm text-gray-500">核心指标 · 用户增长 · 积分与收入 · 功能使用统计</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
              >
                {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                刷新
              </button>
              <button
                type="button"
                onClick={() => navigateToPage?.('home', '/app/home')}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
              >
                返回应用
                <ArrowUpRight size={15} />
              </button>
            </div>
          </header>

          {access === 'checking' || loading ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm font-semibold">加载中…</p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600">
              {error}
            </div>
          ) : (
            <DashboardContent summary={summary} usage={usage} />
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardContent({ summary, usage }) {
  const coreStats = useMemo(() => ([
    { label: '注册用户数', value: formatNumber(summary?.totalUsers), sub: `今日 +${formatNumber(summary?.newUsersToday)}`, icon: Users, tone: 'green' },
    { label: '付费用户数', value: formatNumber(summary?.paidUsers), sub: `已支付订单 ${formatNumber(summary?.paidOrders)}`, icon: CreditCard, tone: 'blue' },
    { label: '累计收入', value: formatCurrency(summary?.revenueTotal), sub: `近30天 ${formatCurrency(summary?.revenue30d)}`, icon: Receipt, tone: 'amber' },
    { label: '积分余额（全站）', value: formatNumber(summary?.creditsBalance), sub: `冻结 ${formatNumber(summary?.creditsFrozen)}`, icon: Coins, tone: 'violet' },
    { label: '累计消耗积分', value: formatNumber(summary?.creditsLifetimeUsed), sub: `今日 ${formatNumber(summary?.creditsConsumedToday)}`, icon: TrendingUp, tone: 'rose' },
    { label: '累计发放积分', value: formatNumber(summary?.creditsLifetimeEarned), sub: `近30天消耗 ${formatNumber(summary?.creditsConsumed30d)}`, icon: Coins, tone: 'green' },
  ]), [summary]);

  return (
    <div className="mt-8 space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coreStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="用户增长">
          <div className="grid grid-cols-3 gap-4">
            <MiniStat label="今日新增" value={formatNumber(summary?.newUsersToday)} />
            <MiniStat label="近 7 天" value={formatNumber(summary?.newUsers7d)} />
            <MiniStat label="近 30 天" value={formatNumber(summary?.newUsers30d)} />
          </div>
        </Card>
        <Card title="积分消耗趋势">
          <div className="grid grid-cols-3 gap-4">
            <MiniStat label="今日消耗" value={formatNumber(summary?.creditsConsumedToday)} />
            <MiniStat label="近 7 天" value={formatNumber(summary?.creditsConsumed7d)} />
            <MiniStat label="近 30 天" value={formatNumber(summary?.creditsConsumed30d)} />
          </div>
        </Card>
      </div>

      <Card title="订阅套餐分布" subtitle="订阅生效中的付费用户">
        <BarList items={summary?.subscriptionsByPlan} emptyText="暂无订阅数据" />
      </Card>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="生成任务总数" value={formatNumber(usage?.totalTasks)} sub={`今日 ${formatNumber(usage?.tasksToday)}`} icon={ListChecks} tone="green" />
        <StatCard label="近 7 天任务" value={formatNumber(usage?.tasks7d)} sub={`近30天 ${formatNumber(usage?.tasks30d)}`} icon={TrendingUp} tone="blue" />
        <StatCard label="图片生成" value={formatNumber(usage?.imageTotal)} sub={`成功 ${formatNumber(usage?.imageSuccess)}`} icon={ImageIcon} tone="violet" />
        <StatCard label="视频生成" value={formatNumber(usage?.videoTotal)} sub={`成功 ${formatNumber(usage?.videoSuccess)}`} icon={Video} tone="amber" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="图片 · 按生成方式">
          <BarList items={usage?.imageByType} emptyText="暂无图片生成记录" />
        </Card>
        <Card title="视频 · 按生成方式">
          <BarList items={usage?.videoByType} emptyText="暂无视频生成记录" />
        </Card>
      </div>

      <Card title="视频 · 按模型使用次数">
        <BarList items={usage?.videoByModel} emptyText="暂无视频生成记录" max={10} />
      </Card>
    </div>
  );
}

const TONE_STYLES = {
  green: 'from-kiwi-green/20 to-lime-100 text-kiwi-green-dark',
  blue: 'from-sky-100 to-blue-100 text-blue-600',
  amber: 'from-amber-100 to-orange-100 text-amber-600',
  violet: 'from-violet-100 to-purple-100 text-violet-600',
  rose: 'from-rose-100 to-pink-100 text-rose-600',
};

function StatCard({ label, value, sub, icon: Icon, tone = 'green' }) {
  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">{value}</p>
          {sub ? <p className="mt-1 truncate text-xs font-medium text-gray-400">{sub}</p> : null}
        </div>
        {Icon ? (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${TONE_STYLES[tone] || TONE_STYLES.green}`}>
            <Icon size={20} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4 text-center">
      <p className="text-2xl font-extrabold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs font-semibold text-gray-400">{label}</p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs font-medium text-gray-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function BarList({ items, emptyText, max }) {
  const list = Array.isArray(items) ? items.slice(0, max || items.length) : [];
  if (list.length === 0) {
    return <p className="text-sm text-gray-400">{emptyText || '暂无数据'}</p>;
  }
  const total = list.reduce((sum, item) => sum + Number(item.count || 0), 0) || 1;
  const peak = Math.max(...list.map((item) => Number(item.count || 0)), 1);
  return (
    <div className="space-y-3.5">
      {list.map((item) => {
        const count = Number(item.count || 0);
        const width = Math.max(4, Math.round((count / peak) * 100));
        const share = Math.round((count / total) * 100);
        return (
          <div key={item.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">{item.label}</span>
              <span className="font-bold text-gray-900">{formatNumber(count)} <span className="text-xs font-medium text-gray-400">({share}%)</span></span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gradient-to-r from-kiwi-green to-kiwi-green-dark" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminSidebar({ navigateToPage }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-kiwi-green text-gray-950">
          <LayoutDashboard size={18} />
        </span>
        <span className="text-base font-extrabold tracking-tight">LazyKiwi 后台</span>
      </div>
      <nav className="px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const Icon = section.icon;
          if (section.enabled) {
            return (
              <div
                key={section.id}
                className="flex items-center gap-3 rounded-xl bg-kiwi-light-green px-3 py-2.5 text-sm font-bold text-kiwi-green-dark"
              >
                <Icon size={17} />
                {section.label}
              </div>
            );
          }
          return (
            <div
              key={section.id}
              className="flex cursor-not-allowed items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400"
              title="即将上线"
            >
              <span className="flex items-center gap-3">
                <Icon size={17} />
                {section.label}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">soon</span>
            </div>
          );
        })}
      </nav>
      <div className="px-5 pb-6">
        <button
          type="button"
          onClick={() => navigateToPage?.('home', '/app/home')}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
        >
          返回应用
        </button>
      </div>
    </aside>
  );
}

function AccessDenied({ navigateToPage }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FB] px-6">
      <div className="max-w-md rounded-3xl border border-gray-200/80 bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <ShieldAlert size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">无权限访问</h1>
        <p className="mt-2 text-sm text-gray-500">此页面仅限管理员访问。如需权限，请联系系统管理员将你的账号加入白名单。</p>
        <button
          type="button"
          onClick={() => navigateToPage?.('home', '/app/home')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
        >
          返回应用
          <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
}
