import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Receipt, Coins, Images, ListChecks, Settings2, Search,
  ArrowUpRight, RefreshCw, Loader2, ShieldAlert, TrendingUp, CreditCard, Video, Image as ImageIcon,
  X, Wallet, ScrollText, SlidersHorizontal, Plus, Minus, Eye, Mail, Package,
  FileText, ArrowUp, ArrowDown, Trash2, Upload, ArrowLeft,
} from 'lucide-react';
import { adminService } from '@/lib/admin/service';

const NAV_SECTIONS = [
  { id: 'dashboard', label: '数据看板', icon: LayoutDashboard, enabled: true },
  { id: 'users', label: '用户管理', icon: Users, enabled: true },
  { id: 'orders', label: '订单管理', icon: Receipt, enabled: true },
  { id: 'credits', label: '积分管理', icon: Coins, enabled: true },
  { id: 'content', label: '内容管理', icon: Images, enabled: true },
  { id: 'tasks', label: '任务管理', icon: ListChecks, enabled: true },
  { id: 'config', label: '配置管理', icon: Settings2, enabled: true },
  { id: 'seo', label: 'SEO 管理', icon: Search, enabled: true },
  { id: 'pages', label: '模板页面', icon: FileText, enabled: true },
];

const BIZ_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: '10', label: '注册赠送' },
  { value: '20', label: '订阅发放' },
  { value: '30', label: '积分包购买' },
  { value: '40', label: '生成预扣' },
  { value: '41', label: '生成消耗' },
  { value: '42', label: '生成返还' },
  { value: '50', label: '管理员调整' },
  { value: '60', label: '积分过期' },
];

function formatNumber(value) {
  if (value == null) return '0';
  return Number(value).toLocaleString('en-US');
}

function formatSigned(value) {
  const num = Number(value || 0);
  const formatted = Math.abs(num).toLocaleString('en-US');
  if (num > 0) return `+${formatted}`;
  if (num < 0) return `-${formatted}`;
  return '0';
}

function formatCurrency(minorUnits) {
  const amount = Number(minorUnits || 0) / 100;
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

export default function AdminDashboard({ navigateToPage }) {
  const [access, setAccess] = useState('checking'); // checking | granted | denied
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const isAdmin = await adminService.checkAdmin();
      if (!mounted) return;
      setAccess(isAdmin ? 'granted' : 'denied');
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (access === 'denied') {
    return <AccessDenied navigateToPage={navigateToPage} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F6F8FB] text-gray-900">
      <AdminSidebar navigateToPage={navigateToPage} activeSection={activeSection} onSelect={setActiveSection} />
      <main className="flex-1 min-w-0 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {access === 'checking' ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm font-semibold">加载中…</p>
            </div>
          ) : activeSection === 'credits' ? (
            <CreditsSection navigateToPage={navigateToPage} />
          ) : activeSection === 'users' ? (
            <UsersSection navigateToPage={navigateToPage} />
          ) : activeSection === 'orders' ? (
            <OrdersSection navigateToPage={navigateToPage} />
          ) : activeSection === 'content' ? (
            <ContentSection navigateToPage={navigateToPage} />
          ) : activeSection === 'tasks' ? (
            <TasksSection navigateToPage={navigateToPage} />
          ) : activeSection === 'config' ? (
            <ConfigSection navigateToPage={navigateToPage} />
          ) : activeSection === 'seo' ? (
            <SeoSection navigateToPage={navigateToPage} />
          ) : activeSection === 'pages' ? (
            <PagesSection navigateToPage={navigateToPage} />
          ) : (
            <DashboardSection navigateToPage={navigateToPage} />
          )}
        </div>
      </main>
    </div>
  );
}

// ==================== 数据看板 ====================

function DashboardSection({ navigateToPage }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [usage, setUsage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    const [summaryData, usageData] = await Promise.all([
      adminService.getSummary(),
      adminService.getFeatureUsage(),
    ]);
    setSummary(summaryData);
    setUsage(usageData);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
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
  }, [loadData]);

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

  return (
    <>
      <SectionHeader
        title="数据看板"
        subtitle="核心指标 · 用户增长 · 积分与收入 · 功能使用统计"
        navigateToPage={navigateToPage}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        refreshDisabled={loading}
      />
      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} />
      ) : (
        <DashboardContent summary={summary} usage={usage} />
      )}
    </>
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

// ==================== 积分管理 ====================

const CREDIT_TABS = [
  { id: 'accounts', label: '积分账户', icon: Wallet },
  { id: 'ledger', label: '积分流水', icon: ScrollText },
  { id: 'rules', label: '扣费规则', icon: SlidersHorizontal },
];

function CreditsSection({ navigateToPage }) {
  const [tab, setTab] = useState('accounts');
  const [adjustTarget, setAdjustTarget] = useState(null); // account object or {} for manual
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <>
      <SectionHeader
        title="积分管理"
        subtitle="积分账户 · 积分流水 · 扣费规则配置"
        navigateToPage={navigateToPage}
        extraAction={(
          <button
            type="button"
            onClick={() => setAdjustTarget({})}
            className="inline-flex items-center gap-2 rounded-xl bg-kiwi-green px-4 py-2.5 text-sm font-bold text-gray-950 shadow-sm transition hover:brightness-95"
          >
            <SlidersHorizontal size={15} />
            调整积分
          </button>
        )}
      />

      <div className="mt-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {CREDIT_TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? 'border-kiwi-green-dark text-kiwi-green-dark'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {tab === 'accounts' && (
            <CreditAccountsTab
              key={`accounts-${reloadKey}`}
              onAdjust={(account) => setAdjustTarget(account)}
            />
          )}
          {tab === 'ledger' && <CreditLedgerTab key={`ledger-${reloadKey}`} />}
          {tab === 'rules' && <CreditRulesTab />}
        </div>
      </div>

      {adjustTarget && (
        <AdjustCreditModal
          target={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSuccess={() => {
            setAdjustTarget(null);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}

function CreditAccountsTab({ onAdjust }) {
  const [keyword, setKeyword] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 10;

  const load = useCallback(async (searchKeyword, page) => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getCreditAccountPage({ keyword: searchKeyword, pageNo: page, pageSize });
      setData(result || { list: [], total: 0 });
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(keyword, pageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (pageNo === 1) {
      load(keyword, 1);
    } else {
      setPageNo(1);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="按邮箱 / 昵称搜索"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-kiwi-green"
          />
        </div>
        <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">
          搜索
        </button>
      </form>

      <TableShell
        loading={loading}
        error={error}
        empty={data.list.length === 0}
        headers={['会员', '可用积分', '冻结', '累计发放', '累计消耗', '操作']}
      >
        {data.list.map((row) => (
          <tr key={row.userId} className="border-t border-gray-100 hover:bg-gray-50/60">
            <td className="px-4 py-3">
              <div className="font-semibold text-gray-900">{row.email || '未知邮箱'}</div>
              <div className="text-xs text-gray-400">ID: {row.userId}</div>
            </td>
            <td className="px-4 py-3 font-bold text-gray-900">{formatNumber(row.availableCredits)}</td>
            <td className="px-4 py-3 text-gray-600">{formatNumber(row.frozenCredits)}</td>
            <td className="px-4 py-3 text-gray-600">{formatNumber(row.lifetimeEarnedCredits)}</td>
            <td className="px-4 py-3 text-gray-600">{formatNumber(row.lifetimeUsedCredits)}</td>
            <td className="px-4 py-3">
              <button
                type="button"
                onClick={() => onAdjust(row)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-kiwi-light-green hover:text-kiwi-green-dark"
              >
                调整
              </button>
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />
    </div>
  );
}

function CreditLedgerTab() {
  const [filters, setFilters] = useState({ keyword: '', bizType: '', beginTime: '', endTime: '' });
  const [applied, setApplied] = useState({ keyword: '', bizType: '', beginTime: '', endTime: '' });
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 10;

  const load = useCallback(async (f, page) => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getCreditLedgerPage({
        keyword: f.keyword || undefined,
        bizType: f.bizType || undefined,
        beginTime: f.beginTime ? `${f.beginTime.replace('T', ' ')}:00` : undefined,
        endTime: f.endTime ? `${f.endTime.replace('T', ' ')}:00` : undefined,
        pageNo: page,
        pageSize,
      });
      setData(result || { list: [], total: 0 });
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(applied, pageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, applied]);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied({ ...filters });
    setPageNo(1);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.keyword}
            onChange={(e) => setFilters((s) => ({ ...s, keyword: e.target.value }))}
            placeholder="按邮箱 / 昵称搜索"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-kiwi-green"
          />
        </div>
        <select
          value={filters.bizType}
          onChange={(e) => setFilters((s) => ({ ...s, bizType: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
        >
          {BIZ_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={filters.beginTime}
          onChange={(e) => setFilters((s) => ({ ...s, beginTime: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 outline-none focus:border-kiwi-green"
        />
        <input
          type="datetime-local"
          value={filters.endTime}
          onChange={(e) => setFilters((s) => ({ ...s, endTime: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 outline-none focus:border-kiwi-green"
        />
        <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">
          查询
        </button>
      </form>

      <TableShell
        loading={loading}
        error={error}
        empty={data.list.length === 0}
        headers={['时间', '会员', '类型', '变动', '变动后可用', '说明']}
      >
        {data.list.map((row) => (
          <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/60">
            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDateTime(row.createTime)}</td>
            <td className="px-4 py-3">
              <div className="font-semibold text-gray-900">{row.email || '未知'}</div>
              <div className="text-xs text-gray-400">ID: {row.userId}</div>
            </td>
            <td className="px-4 py-3">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">{row.bizTypeLabel}</span>
            </td>
            <td className={`px-4 py-3 font-bold ${row.changeCredits > 0 ? 'text-kiwi-green-dark' : row.changeCredits < 0 ? 'text-rose-500' : 'text-gray-400'}`}>
              {formatSigned(row.changeCredits)}
            </td>
            <td className="px-4 py-3 text-gray-700">{formatNumber(row.availableAfter)}</td>
            <td className="px-4 py-3 max-w-[240px]">
              <div className="truncate font-medium text-gray-700" title={row.title || ''}>{row.title || '-'}</div>
              {row.description ? <div className="truncate text-xs text-gray-400" title={row.description}>{row.description}</div> : null}
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />
    </div>
  );
}

function CreditRulesTab() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await adminService.getCreditRules();
        if (mounted) setRules(result);
      } catch (err) {
        if (mounted) setError(err?.message || '加载失败');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div className="space-y-6">
      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        当前扣费规则由后端计费引擎（LazyKiwiCreditCalculator）维护，此处为只读展示。如需调整费率请修改后端配置。
      </p>
      <Card title="图片生成 · 扣费规则" subtitle="按模型计费（单张积分）">
        <RuleTable rows={rules?.imageRules} type="image" />
      </Card>
      <Card title="视频生成 · 扣费规则" subtitle="按模型 / 清晰度 / 时长 / 音频计费（单条积分）">
        <RuleTable rows={rules?.videoRules} type="video" />
      </Card>
    </div>
  );
}

function RuleTable({ rows, type }) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    return <p className="text-sm text-gray-400">暂无规则</p>;
  }
  const isVideo = type === 'video';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
            <th className="px-4 py-2">模型</th>
            {isVideo && <th className="px-4 py-2">清晰度</th>}
            {isVideo && <th className="px-4 py-2">时长</th>}
            {isVideo && <th className="px-4 py-2">音频</th>}
            <th className="px-4 py-2">消耗积分</th>
          </tr>
        </thead>
        <tbody>
          {list.map((row, idx) => (
            <tr key={`${row.model}-${row.resolution}-${row.duration}-${idx}`} className="border-t border-gray-100">
              <td className="px-4 py-2.5 font-semibold text-gray-800">{row.model}</td>
              {isVideo && <td className="px-4 py-2.5 text-gray-600">{row.resolution === '-' ? '任意' : row.resolution}</td>}
              {isVideo && <td className="px-4 py-2.5 text-gray-600">{row.duration}</td>}
              {isVideo && <td className="px-4 py-2.5 text-gray-600">{row.sound === 'on' ? '有' : row.sound === 'off' ? '无' : '-'}</td>}
              <td className="px-4 py-2.5 font-bold text-kiwi-green-dark">{formatNumber(row.credits)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdjustCreditModal({ target, onClose, onSuccess }) {
  const hasUser = target && target.userId != null;
  const [mode, setMode] = useState('set');
  const [email, setEmail] = useState(hasUser ? (target.email || '') : '');
  const [amount, setAmount] = useState(hasUser ? String(target.availableCredits ?? '') : '');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const numAmount = Number(amount);
    if (Number.isNaN(numAmount)) {
      setError('请输入有效的数量');
      return;
    }
    if (!hasUser && !email.trim()) {
      setError('请输入用户邮箱');
      return;
    }
    setSubmitting(true);
    try {
      await adminService.adjustCredit({
        userId: hasUser ? target.userId : undefined,
        email: hasUser ? undefined : email.trim(),
        mode,
        amount: numAmount,
        reason: reason.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err?.message || '调整失败');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900">调整积分</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-500">用户邮箱</label>
            {hasUser ? (
              <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800">
                {target.email || '未知邮箱'} <span className="text-xs font-medium text-gray-400">(ID: {target.userId})</span>
              </div>
            ) : (
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
              />
            )}
            {hasUser ? (
              <p className="mt-1 text-xs text-gray-400">当前可用积分：{formatNumber(target.availableCredits)}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-500">调整方式</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('set')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                  mode === 'set' ? 'border-kiwi-green bg-kiwi-light-green text-kiwi-green-dark' : 'border-gray-200 text-gray-500'
                }`}
              >
                设为目标值
              </button>
              <button
                type="button"
                onClick={() => setMode('delta')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                  mode === 'delta' ? 'border-kiwi-green bg-kiwi-light-green text-kiwi-green-dark' : 'border-gray-200 text-gray-500'
                }`}
              >
                增减
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-500">
              {mode === 'set' ? '目标可用积分' : '增减数量（负数为扣减）'}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {mode === 'set' ? <Coins size={15} /> : Number(amount) < 0 ? <Minus size={15} /> : <Plus size={15} />}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={mode === 'set' ? '100000' : '例如 10000 或 -5000'}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold outline-none focus:border-kiwi-green"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-500">调整原因（可选）</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例如：运营补偿 / 管理员初始化"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
            />
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              确认调整
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== 用户管理 ====================

const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'active', label: '生效中' },
  { value: 'none', label: '未订阅' },
  { value: 'past_due', label: '逾期' },
  { value: 'canceled', label: '已取消' },
];

function statusTone(status) {
  if (status === 30) return 'green';
  if (status === 40) return 'rose';
  if (status === 50) return 'gray';
  return 'amber';
}

function StatusPill({ label, tone = 'gray' }) {
  const styles = {
    green: 'bg-kiwi-light-green text-kiwi-green-dark',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    gray: 'bg-gray-100 text-gray-500',
    blue: 'bg-sky-50 text-sky-600',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${styles[tone] || styles.gray}`}>
      {label || '-'}
    </span>
  );
}

function subscriptionTone(status) {
  if (status === 'active') return 'green';
  if (status === 'past_due') return 'amber';
  if (status === 'canceled') return 'rose';
  return 'gray';
}

function subscriptionLabel(status) {
  const map = { active: '生效中', past_due: '逾期', canceled: '已取消', none: '未订阅' };
  return map[status] || status || '未订阅';
}

function UsersSection({ navigateToPage }) {
  const [filters, setFilters] = useState({ keyword: '', subscriptionStatus: '', planId: '' });
  const [applied, setApplied] = useState({ keyword: '', subscriptionStatus: '', planId: '' });
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailUserId, setDetailUserId] = useState(null);
  const pageSize = 10;

  const load = useCallback(async (f, page) => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getUserPage({
        keyword: f.keyword || undefined,
        subscriptionStatus: f.subscriptionStatus || undefined,
        planId: f.planId || undefined,
        pageNo: page,
        pageSize,
      });
      setData(result || { list: [], total: 0 });
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(applied, pageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, applied]);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied({ ...filters });
    setPageNo(1);
  };

  return (
    <>
      <SectionHeader
        title="用户管理"
        subtitle="用户列表 · 会员状态 · 积分与消费 · 用户详情"
        navigateToPage={navigateToPage}
        onRefresh={() => load(applied, pageNo)}
        refreshDisabled={loading}
      />
      <div className="mt-8">
        <form onSubmit={handleSearch} className="mb-4 flex flex-wrap items-end gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.keyword}
              onChange={(e) => setFilters((s) => ({ ...s, keyword: e.target.value }))}
              placeholder="按邮箱 / 昵称搜索"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-kiwi-green"
            />
          </div>
          <select
            value={filters.subscriptionStatus}
            onChange={(e) => setFilters((s) => ({ ...s, subscriptionStatus: e.target.value }))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
          >
            {SUBSCRIPTION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            value={filters.planId}
            onChange={(e) => setFilters((s) => ({ ...s, planId: e.target.value }))}
            placeholder="套餐（如 pro）"
            className="w-[140px] rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
          />
          <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">
            查询
          </button>
        </form>

        <TableShell
          loading={loading}
          error={error}
          empty={data.list.length === 0}
          headers={['会员', '登录方式', '会员状态', '套餐', '可用积分', '累计消耗', '注册时间', '操作']}
        >
          {data.list.map((row) => (
            <tr key={row.userId} className="border-t border-gray-100 hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <div className="font-semibold text-gray-900">{row.email || '未知邮箱'}</div>
                <div className="text-xs text-gray-400">{row.nickname ? `${row.nickname} · ` : ''}ID: {row.userId}</div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                  <Mail size={13} />{row.loginType === 'google' ? 'Google' : '邮箱'}
                </span>
              </td>
              <td className="px-4 py-3"><StatusPill label={subscriptionLabel(row.subscriptionStatus)} tone={subscriptionTone(row.subscriptionStatus)} /></td>
              <td className="px-4 py-3 text-gray-700">{row.planId || '-'}</td>
              <td className="px-4 py-3 font-bold text-gray-900">{formatNumber(row.availableCredits)}</td>
              <td className="px-4 py-3 text-gray-600">{formatNumber(row.lifetimeUsedCredits)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDateTime(row.registerTime)}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setDetailUserId(row.userId)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-kiwi-light-green hover:text-kiwi-green-dark"
                >
                  <Eye size={13} />详情
                </button>
              </td>
            </tr>
          ))}
        </TableShell>

        <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />
      </div>

      {detailUserId != null && (
        <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />
      )}
    </>
  );
}

function UserDetailModal({ userId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('videos');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await adminService.getUserDetail(userId);
        if (mounted) setDetail(result);
      } catch (err) {
        if (mounted) setError(err?.message || '加载失败');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const user = detail?.user;
  const tabs = [
    { id: 'videos', label: `视频记录 (${detail?.recentVideos?.length || 0})` },
    { id: 'images', label: `图片记录 (${detail?.recentImages?.length || 0})` },
    { id: 'orders', label: `购买记录 (${detail?.orders?.length || 0})` },
    { id: 'ledger', label: `积分流水 (${detail?.recentLedger?.length || 0})` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-extrabold text-gray-900">用户详情</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(88vh-64px)] overflow-y-auto px-6 py-5">
          {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} /> : (
            <>
              <div className="rounded-2xl border border-gray-200/80 bg-gray-50/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-extrabold text-gray-900">{user?.email || '未知邮箱'}</div>
                    <div className="text-xs text-gray-400">{user?.nickname ? `${user.nickname} · ` : ''}ID: {user?.userId} · {user?.loginType === 'google' ? 'Google 登录' : '邮箱登录'}</div>
                  </div>
                  <StatusPill label={subscriptionLabel(user?.subscriptionStatus)} tone={subscriptionTone(user?.subscriptionStatus)} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat label="当前套餐" value={user?.planId || '无'} />
                  <MiniStat label="可用积分" value={formatNumber(user?.availableCredits)} />
                  <MiniStat label="累计发放" value={formatNumber(user?.lifetimeEarnedCredits)} />
                  <MiniStat label="累计消耗" value={formatNumber(user?.lifetimeUsedCredits)} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
                  <span>注册时间：{formatDateTime(user?.registerTime)}</span>
                  <span>计费周期：{user?.billingInterval || '-'}</span>
                  <span>当前周期结束：{formatDateTime(user?.currentPeriodEnd)}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-b border-gray-200">
                {tabs.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`border-b-2 px-3 py-2 text-sm font-bold transition ${active ? 'border-kiwi-green-dark text-kiwi-green-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                {tab === 'videos' && <ContentMiniList items={detail?.recentVideos} onPreview={setPreview} emptyText="暂无视频生成记录" />}
                {tab === 'images' && <ContentMiniList items={detail?.recentImages} onPreview={setPreview} emptyText="暂无图片生成记录" />}
                {tab === 'orders' && <OrderMiniList items={detail?.orders} />}
                {tab === 'ledger' && <LedgerMiniList items={detail?.recentLedger} />}
              </div>
            </>
          )}
        </div>
      </div>
      {preview && <ContentPreviewModal content={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function ContentMiniList({ items, onPreview, emptyText }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return <p className="py-6 text-center text-sm text-gray-400">{emptyText || '暂无数据'}</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {list.map((item) => (
        <button
          key={`${item.kind}-${item.id}`}
          type="button"
          onClick={() => onPreview(item)}
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition hover:border-kiwi-green"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
            {item.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                {item.kind === 'video' ? <Video size={24} /> : <ImageIcon size={24} />}
              </div>
            )}
            <span className="absolute right-1.5 top-1.5"><StatusPill label={item.statusLabel} tone={statusTone(item.status)} /></span>
          </div>
          <div className="p-2.5">
            <div className="truncate text-xs font-semibold text-gray-700" title={item.prompt || ''}>{item.prompt || item.generateTypeLabel || '-'}</div>
            <div className="mt-0.5 truncate text-[11px] text-gray-400">{item.model || '-'} · {formatNumber(item.credits)} 积分</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function OrderMiniList({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return <p className="py-6 text-center text-sm text-gray-400">暂无购买记录</p>;
  return (
    <div className="space-y-2">
      {list.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <StatusPill label={item.orderTypeLabel} tone={item.orderType === 'credit_pack' ? 'blue' : 'green'} />
              {item.title || '-'}
            </div>
            <div className="mt-0.5 text-xs text-gray-400">{formatDateTime(item.createTime)}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-kiwi-green-dark">+{formatNumber(item.credits)}</div>
            <div className="text-[11px] text-gray-400">积分</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LedgerMiniList({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return <p className="py-6 text-center text-sm text-gray-400">暂无积分流水</p>;
  return (
    <div className="space-y-2">
      {list.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">{item.bizTypeLabel}</span>
              <span className="truncate">{item.title || '-'}</span>
            </div>
            <div className="mt-0.5 text-xs text-gray-400">{formatDateTime(item.createTime)}</div>
          </div>
          <div className={`font-bold ${item.changeCredits > 0 ? 'text-kiwi-green-dark' : item.changeCredits < 0 ? 'text-rose-500' : 'text-gray-400'}`}>
            {formatSigned(item.changeCredits)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== 订单管理 ====================

const ORDER_TABS = [
  { id: 'subscription', label: '订阅订单', icon: CreditCard },
  { id: 'credit_pack', label: '积分包订单', icon: Package },
];

function OrdersSection({ navigateToPage }) {
  const [tab, setTab] = useState('subscription');
  return (
    <>
      <SectionHeader
        title="订单管理"
        subtitle="订阅订单 · 积分包订单 · 支付与发放记录"
        navigateToPage={navigateToPage}
      />
      <div className="mt-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {ORDER_TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${active ? 'border-kiwi-green-dark text-kiwi-green-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <OrdersTab key={tab} orderType={tab} />
        </div>
      </div>
    </>
  );
}

function OrdersTab({ orderType }) {
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 10;

  const load = useCallback(async (kw, page) => {
    setLoading(true);
    setError('');
    try {
      const fn = orderType === 'credit_pack' ? adminService.getCreditPackOrderPage : adminService.getSubscriptionOrderPage;
      const result = await fn({ keyword: kw || undefined, pageNo: page, pageSize });
      setData(result || { list: [], total: 0 });
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [orderType]);

  useEffect(() => {
    load(applied, pageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, applied, orderType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied(keyword);
    setPageNo(1);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="按邮箱 / 昵称搜索"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-kiwi-green"
          />
        </div>
        <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">搜索</button>
      </form>

      <p className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
        订单记录由积分流水（{orderType === 'credit_pack' ? '积分包购买' : '订阅发放'}）派生。支付金额将在后续计费改造中补充。
      </p>

      <TableShell
        loading={loading}
        error={error}
        empty={data.list.length === 0}
        headers={['时间', '会员', '类型', '套餐', '获得积分', '金额', '业务单号']}
      >
        {data.list.map((row) => (
          <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/60">
            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDateTime(row.createTime)}</td>
            <td className="px-4 py-3">
              <div className="font-semibold text-gray-900">{row.email || '未知'}</div>
              <div className="text-xs text-gray-400">ID: {row.userId}</div>
            </td>
            <td className="px-4 py-3"><StatusPill label={row.orderTypeLabel} tone={row.orderType === 'credit_pack' ? 'blue' : 'green'} /></td>
            <td className="px-4 py-3 text-gray-700">{row.planId || '-'}</td>
            <td className="px-4 py-3 font-bold text-kiwi-green-dark">+{formatNumber(row.credits)}</td>
            <td className="px-4 py-3 text-gray-600">{row.amount != null ? formatCurrency(row.amount) : '-'}</td>
            <td className="px-4 py-3 max-w-[200px] truncate text-xs text-gray-400" title={row.bizNo || ''}>{row.bizNo || '-'}</td>
          </tr>
        ))}
      </TableShell>

      <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />
    </div>
  );
}

// ==================== 内容管理 ====================

const VIDEO_GEN_TYPE_OPTIONS = [
  { value: '', label: '全部方式' },
  { value: '1', label: '文生视频' },
  { value: '2', label: '图生视频' },
  { value: '3', label: '首尾帧' },
  { value: '4', label: '模板生成' },
];

const IMAGE_GEN_TYPE_OPTIONS = [
  { value: '', label: '全部方式' },
  { value: '1', label: '模板生成' },
  { value: '2', label: '文生图' },
  { value: '3', label: '图生图' },
];

const VIDEO_STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: '0', label: '已创建' },
  { value: '10', label: '排队中' },
  { value: '20', label: '生成中' },
  { value: '30', label: '成功' },
  { value: '40', label: '失败' },
  { value: '50', label: '已停止' },
];

const IMAGE_STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: '10', label: '已提交' },
  { value: '20', label: '处理中' },
  { value: '30', label: '成功' },
  { value: '40', label: '失败' },
];

const CONTENT_TABS = [
  { id: 'video', label: '视频生成记录', icon: Video },
  { id: 'image', label: '图片生成记录', icon: ImageIcon },
];

function ContentSection({ navigateToPage }) {
  const [tab, setTab] = useState('video');
  const [preview, setPreview] = useState(null);
  return (
    <>
      <SectionHeader
        title="内容管理"
        subtitle="视频生成记录 · 图片生成记录 · 按用户 / 功能 / 状态筛选"
        navigateToPage={navigateToPage}
      />
      <div className="mt-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {CONTENT_TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${active ? 'border-kiwi-green-dark text-kiwi-green-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <ContentTab key={tab} kind={tab} onPreview={setPreview} />
        </div>
      </div>
      {preview && <ContentPreviewModal content={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

function ContentTab({ kind, onPreview }) {
  const isVideo = kind === 'video';
  const emptyFilters = { keyword: '', generateType: '', model: '', status: '', beginTime: '', endTime: '' };
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 10;

  const load = useCallback(async (f, page) => {
    setLoading(true);
    setError('');
    try {
      const common = {
        keyword: f.keyword || undefined,
        generateType: f.generateType ? Number(f.generateType) : undefined,
        status: f.status ? Number(f.status) : undefined,
        beginTime: f.beginTime ? `${f.beginTime.replace('T', ' ')}:00` : undefined,
        endTime: f.endTime ? `${f.endTime.replace('T', ' ')}:00` : undefined,
        pageNo: page,
        pageSize,
      };
      const result = isVideo
        ? await adminService.getVideoContentPage({ ...common, model: f.model || undefined })
        : await adminService.getImageContentPage(common);
      setData(result || { list: [], total: 0 });
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [isVideo]);

  useEffect(() => {
    load(applied, pageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, applied, kind]);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied({ ...filters });
    setPageNo(1);
  };

  const genTypeOptions = isVideo ? VIDEO_GEN_TYPE_OPTIONS : IMAGE_GEN_TYPE_OPTIONS;
  const statusOptions = isVideo ? VIDEO_STATUS_OPTIONS : IMAGE_STATUS_OPTIONS;

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative min-w-[180px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.keyword}
            onChange={(e) => setFilters((s) => ({ ...s, keyword: e.target.value }))}
            placeholder="按邮箱 / 昵称搜索"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-kiwi-green"
          />
        </div>
        <select
          value={filters.generateType}
          onChange={(e) => setFilters((s) => ({ ...s, generateType: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
        >
          {genTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {isVideo && (
          <input
            value={filters.model}
            onChange={(e) => setFilters((s) => ({ ...s, model: e.target.value }))}
            placeholder="模型"
            className="w-[120px] rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
          />
        )}
        <select
          value={filters.status}
          onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
        >
          {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">查询</button>
      </form>

      <TableShell
        loading={loading}
        error={error}
        empty={data.list.length === 0}
        headers={['预览', '会员', '方式', '模型', '提示词', '状态', '积分', '时间', '操作']}
      >
        {data.list.map((row) => (
          <tr key={`${row.kind}-${row.id}`} className="border-t border-gray-100 hover:bg-gray-50/60">
            <td className="px-4 py-3">
              <div className="h-11 w-16 overflow-hidden rounded-lg bg-gray-100">
                {row.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    {row.kind === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
                  </div>
                )}
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="font-semibold text-gray-900">{row.email || '未知'}</div>
              <div className="text-xs text-gray-400">ID: {row.userId}</div>
            </td>
            <td className="px-4 py-3 text-xs text-gray-600">{row.generateTypeLabel || '-'}</td>
            <td className="px-4 py-3 text-xs text-gray-600">{row.model || '-'}</td>
            <td className="px-4 py-3 max-w-[200px]"><div className="truncate text-xs text-gray-600" title={row.prompt || ''}>{row.prompt || '-'}</div></td>
            <td className="px-4 py-3"><StatusPill label={row.statusLabel} tone={statusTone(row.status)} /></td>
            <td className="px-4 py-3 text-gray-600">{formatNumber(row.credits)}</td>
            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDateTime(row.createTime)}</td>
            <td className="px-4 py-3">
              <button
                type="button"
                onClick={() => onPreview(row)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-kiwi-light-green hover:text-kiwi-green-dark"
              >
                <Eye size={13} />查看
              </button>
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />
    </div>
  );
}

function ContentPreviewModal({ content, onClose }) {
  const urls = Array.isArray(content?.resultUrls) ? content.resultUrls : [];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-extrabold text-gray-900">{content?.kind === 'video' ? '视频详情' : '图片详情'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(88vh-64px)] overflow-y-auto px-6 py-5">
          <div className="overflow-hidden rounded-2xl bg-gray-900/5">
            {content?.kind === 'video' ? (
              urls[0] ? (
                <video src={urls[0]} controls poster={content?.coverUrl || undefined} className="max-h-[46vh] w-full bg-black object-contain" />
              ) : content?.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={content.coverUrl} alt="" className="max-h-[46vh] w-full object-contain" />
              ) : (
                <div className="flex h-40 items-center justify-center text-gray-300"><Video size={32} /></div>
              )
            ) : (
              urls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {urls.map((url, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={idx} src={url} alt="" className="w-full rounded-lg object-cover" />
                  ))}
                </div>
              ) : content?.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={content.coverUrl} alt="" className="max-h-[46vh] w-full object-contain" />
              ) : (
                <div className="flex h-40 items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
              )
            )}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <DetailRow label="会员" value={`${content?.email || '未知'} (ID: ${content?.userId})`} />
            <DetailRow label="生成方式" value={content?.generateTypeLabel || '-'} />
            <DetailRow label="模型" value={content?.model || '-'} />
            <DetailRow label="分辨率 / 比例" value={`${content?.resolution || '-'} · ${content?.aspectRatio || '-'}`} />
            <DetailRow label="状态" value={content?.statusLabel || '-'} />
            <DetailRow label="消耗积分" value={formatNumber(content?.credits)} />
            <DetailRow label="提交时间" value={formatDateTime(content?.submitTime)} />
            <DetailRow label="完成时间" value={formatDateTime(content?.finishTime)} />
            {content?.prompt ? <DetailRow label="提示词" value={content.prompt} /> : null}
            {content?.errorMessage ? <DetailRow label="错误信息" value={content.errorMessage} tone="rose" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, tone }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-xs font-bold text-gray-400">{label}</span>
      <span className={`flex-1 break-words text-sm font-medium ${tone === 'rose' ? 'text-rose-500' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}

// ==================== 任务管理 ====================

const TASK_KIND_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'video', label: '视频' },
  { value: 'image', label: '图片' },
];

const TASK_STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: '10', label: '排队 / 已提交' },
  { value: '20', label: '生成 / 处理中' },
  { value: '30', label: '成功' },
  { value: '40', label: '失败' },
  { value: '50', label: '已停止' },
];

function TasksSection({ navigateToPage }) {
  const [filters, setFilters] = useState({ taskKind: '', keyword: '', status: '' });
  const [applied, setApplied] = useState({ taskKind: '', keyword: '', status: '' });
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailTask, setDetailTask] = useState(null);
  const pageSize = 10;

  const load = useCallback(async (f, page) => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getTaskPage({
        taskKind: f.taskKind || undefined,
        keyword: f.keyword || undefined,
        status: f.status ? Number(f.status) : undefined,
        pageNo: page,
        pageSize,
      });
      setData(result || { list: [], total: 0 });
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(applied, pageNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, applied]);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied({ ...filters });
    setPageNo(1);
  };

  return (
    <>
      <SectionHeader
        title="任务管理"
        subtitle="生成任务状态（排队 / 生成 / 成功 / 失败）· 积分扣减与返还"
        navigateToPage={navigateToPage}
        onRefresh={() => load(applied, pageNo)}
        refreshDisabled={loading}
      />
      <div className="mt-8">
        <form onSubmit={handleSearch} className="mb-4 flex flex-wrap items-end gap-3">
          <div className="relative min-w-[180px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.keyword}
              onChange={(e) => setFilters((s) => ({ ...s, keyword: e.target.value }))}
              placeholder="按邮箱 / 昵称搜索"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-kiwi-green"
            />
          </div>
          <select
            value={filters.taskKind}
            onChange={(e) => setFilters((s) => ({ ...s, taskKind: e.target.value }))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
          >
            {TASK_KIND_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
          >
            {TASK_STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">查询</button>
        </form>

        <TableShell
          loading={loading}
          error={error}
          empty={data.list.length === 0}
          headers={['任务', '会员', '类型', '模型', '状态', '积分', '积分状态', '时间', '操作']}
        >
          {data.list.map((row) => (
            <tr key={`${row.kind}-${row.id}`} className="border-t border-gray-100 hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <div className="font-semibold text-gray-900">{row.taskNo || `#${row.id}`}</div>
                <div className="text-xs text-gray-400">{row.generateTypeLabel || '-'}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-gray-900">{row.email || '未知'}</div>
                <div className="text-xs text-gray-400">ID: {row.userId}</div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                  {row.kind === 'video' ? <Video size={13} /> : <ImageIcon size={13} />}
                  {row.kind === 'video' ? '视频' : '图片'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">{row.model || '-'}</td>
              <td className="px-4 py-3"><StatusPill label={row.statusLabel} tone={statusTone(row.status)} /></td>
              <td className="px-4 py-3 text-gray-600">{formatNumber(row.credits)}</td>
              <td className="px-4 py-3">{row.reservationStatusLabel ? <StatusPill label={row.reservationStatusLabel} tone={row.reservationStatus === 20 ? 'blue' : row.reservationStatus === 10 ? 'green' : 'amber'} /> : <span className="text-xs text-gray-300">-</span>}</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDateTime(row.createTime)}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setDetailTask(row)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-kiwi-light-green hover:text-kiwi-green-dark"
                >
                  <Eye size={13} />详情
                </button>
              </td>
            </tr>
          ))}
        </TableShell>

        <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />
      </div>

      {detailTask && (
        <TaskDetailModal taskKind={detailTask.kind} taskId={detailTask.id} onClose={() => setDetailTask(null)} />
      )}
    </>
  );
}

function TaskDetailModal({ taskKind, taskId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await adminService.getTaskDetail(taskKind, taskId);
        if (mounted) setDetail(result);
      } catch (err) {
        if (mounted) setError(err?.message || '加载失败');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [taskKind, taskId]);

  const content = detail?.content;
  const task = detail?.task;
  const urls = Array.isArray(content?.resultUrls) ? content.resultUrls : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-extrabold text-gray-900">任务详情</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(88vh-64px)] overflow-y-auto px-6 py-5">
          {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} /> : (
            <>
              <div className="overflow-hidden rounded-2xl bg-gray-900/5">
                {content?.kind === 'video' ? (
                  urls[0] ? (
                    <video src={urls[0]} controls poster={content?.coverUrl || undefined} className="max-h-[40vh] w-full bg-black object-contain" />
                  ) : content?.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={content.coverUrl} alt="" className="max-h-[40vh] w-full object-contain" />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-gray-300"><Video size={28} /></div>
                  )
                ) : (
                  urls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {urls.map((url, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={idx} src={url} alt="" className="w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  ) : content?.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={content.coverUrl} alt="" className="max-h-[40vh] w-full object-contain" />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-gray-300"><ImageIcon size={28} /></div>
                  )
                )}
              </div>

              <div className="mt-4 space-y-2">
                <DetailRow label="任务号" value={task?.taskNo || `#${task?.id}`} />
                <DetailRow label="会员" value={`${task?.email || '未知'} (ID: ${task?.userId})`} />
                <DetailRow label="类型" value={task?.kind === 'video' ? '视频' : '图片'} />
                <DetailRow label="模型" value={task?.model || '-'} />
                <DetailRow label="状态" value={task?.statusLabel || '-'} />
                <DetailRow label="任务积分" value={formatNumber(task?.credits)} />
                <DetailRow label="积分状态" value={task?.reservationStatusLabel || '-'} />
                <DetailRow label="提交时间" value={formatDateTime(task?.submitTime)} />
                <DetailRow label="完成时间" value={formatDateTime(task?.finishTime)} />
                {content?.prompt ? <DetailRow label="提示词" value={content.prompt} /> : null}
                {task?.errorMessage ? <DetailRow label="错误信息" value={task.errorMessage} tone="rose" /> : null}
              </div>

              <div className="mt-5">
                <h4 className="mb-2 text-sm font-extrabold text-gray-900">关联积分流水</h4>
                <LedgerMiniList items={detail?.ledger} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== 通用组件 ====================

// ==================== 配置管理（套餐 / 积分包） ====================

const PRODUCT_TYPE_PLAN = 1;
const PRODUCT_TYPE_PACK = 2;

function ConfigSection({ navigateToPage }) {
  const [productType, setProductType] = useState(PRODUCT_TYPE_PLAN);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // product object | 'new' | null
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getProductPage({ productType, keyword, pageNo, pageSize });
      setData(result);
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [productType, keyword, pageNo]);

  useEffect(() => { load(); }, [load]);

  const isPlan = productType === PRODUCT_TYPE_PLAN;

  const onSearch = (e) => {
    e.preventDefault();
    setPageNo(1);
    setKeyword(searchInput.trim());
  };

  const toggleStatus = async (row) => {
    try {
      await adminService.updateProductStatus(row.id, row.status === 1 ? 0 : 1);
      load();
    } catch (err) {
      alert(err?.message || '操作失败');
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`确认删除「${row.name}」(${row.code})？`)) return;
    try {
      await adminService.deleteProduct(row.id);
      load();
    } catch (err) {
      alert(err?.message || '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="配置管理"
        subtitle="管理订阅套餐与积分包的价格、积分与展示信息（数据库驱动）"
        navigateToPage={navigateToPage}
        onRefresh={load}
        refreshing={loading}
        extraAction={(
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-xl bg-kiwi-green px-4 py-2.5 text-sm font-bold text-white transition hover:bg-kiwi-green-dark"
          >
            <Plus size={15} />
            新建{isPlan ? '套餐' : '积分包'}
          </button>
        )}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          {[
            { id: PRODUCT_TYPE_PLAN, label: '订阅套餐' },
            { id: PRODUCT_TYPE_PACK, label: '积分包' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setProductType(tab.id); setPageNo(1); }}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                productType === tab.id ? 'bg-kiwi-light-green text-kiwi-green-dark' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={onSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="按标识 / 名称搜索"
            className="w-56 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
          />
          <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">搜索</button>
        </form>
      </div>

      <TableShell
        loading={loading}
        error={error}
        empty={!loading && !error && data.list.length === 0}
        headers={isPlan
          ? ['排序', '标识', '名称', '月/年积分', '月付', '年付', '并发', '状态', '操作']
          : ['排序', '标识', '名称', '积分', '一次性价格', '状态', '操作']}
      >
        {data.list.map((row) => (
          <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/60">
            <td className="px-4 py-3 text-gray-400">{row.sort}</td>
            <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.code}</td>
            <td className="px-4 py-3">
              <div className="font-bold text-gray-900">{row.name}</div>
              {row.badge ? <span className="mt-0.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">{row.badge}</span> : null}
            </td>
            {isPlan ? (
              <>
                <td className="px-4 py-3 text-gray-700">{formatNumber(row.monthlyCredits)} / {formatNumber(row.yearlyCredits)}</td>
                <td className="px-4 py-3 text-gray-700">{formatCurrency(row.priceMonthlyAmount)}</td>
                <td className="px-4 py-3 text-gray-700">{formatCurrency(row.priceYearlyAmount)}</td>
                <td className="px-4 py-3 text-gray-700">{row.parallelTasks ?? '-'}</td>
              </>
            ) : (
              <>
                <td className="px-4 py-3 text-gray-700">{formatNumber(row.monthlyCredits)}</td>
                <td className="px-4 py-3 text-gray-700">{formatCurrency(row.priceOnetimeAmount)}</td>
              </>
            )}
            <td className="px-4 py-3">
              <button type="button" onClick={() => toggleStatus(row)}>
                <StatusPill label={row.status === 1 ? '启用' : '停用'} tone={row.status === 1 ? 'green' : 'gray'} />
              </button>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(row)} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-50">编辑</button>
                <button type="button" onClick={() => remove(row)} className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-50">删除</button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />

      {editing ? (
        <ProductEditModal
          product={editing === 'new' ? null : editing}
          defaultType={productType}
          onClose={() => setEditing(null)}
          onSuccess={() => { setEditing(null); load(); }}
        />
      ) : null}
    </div>
  );
}

function ProductEditModal({ product, defaultType, onClose, onSuccess }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(() => ({
    productType: product?.productType ?? defaultType,
    code: product?.code ?? '',
    name: product?.name ?? '',
    badge: product?.badge ?? '',
    positioning: product?.positioning ?? '',
    monthlyCredits: product?.monthlyCredits ?? 0,
    yearlyCredits: product?.yearlyCredits ?? 0,
    priceMonthlyAmount: product?.priceMonthlyAmount ?? 0,
    priceYearlyAmount: product?.priceYearlyAmount ?? 0,
    priceOnetimeAmount: product?.priceOnetimeAmount ?? 0,
    currency: product?.currency ?? 'usd',
    stripePriceMonthly: product?.stripePriceMonthly ?? '',
    stripePriceYearly: product?.stripePriceYearly ?? '',
    stripePriceOnetime: product?.stripePriceOnetime ?? '',
    parallelTasks: product?.parallelTasks ?? 0,
    buttonText: product?.buttonText ?? 'Buy Now',
    status: product?.status ?? 1,
    sort: product?.sort ?? 0,
    featuresText: (product?.features ?? []).join('\n'),
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isPlan = Number(form.productType) === PRODUCT_TYPE_PLAN;
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.code.trim() || !form.name.trim()) {
      setError('标识与名称必填');
      return;
    }
    const payload = {
      id: product?.id,
      productType: Number(form.productType),
      code: form.code.trim(),
      name: form.name.trim(),
      badge: form.badge.trim() || null,
      positioning: form.positioning.trim() || null,
      monthlyCredits: Number(form.monthlyCredits) || 0,
      yearlyCredits: Number(form.yearlyCredits) || 0,
      priceMonthlyAmount: Number(form.priceMonthlyAmount) || 0,
      priceYearlyAmount: Number(form.priceYearlyAmount) || 0,
      priceOnetimeAmount: Number(form.priceOnetimeAmount) || 0,
      currency: form.currency.trim() || 'usd',
      stripePriceMonthly: form.stripePriceMonthly.trim() || null,
      stripePriceYearly: form.stripePriceYearly.trim() || null,
      stripePriceOnetime: form.stripePriceOnetime.trim() || null,
      parallelTasks: Number(form.parallelTasks) || 0,
      buttonText: form.buttonText.trim() || null,
      status: Number(form.status),
      sort: Number(form.sort) || 0,
      features: form.featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    setSubmitting(true);
    try {
      if (isEdit) {
        await adminService.updateProduct(payload);
      } else {
        await adminService.createProduct(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err?.message || '保存失败');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900">{isEdit ? '编辑' : '新建'}{isPlan ? '套餐' : '积分包'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="类型">
              <select value={form.productType} onChange={set('productType')} className={inputCls} disabled={isEdit}>
                <option value={PRODUCT_TYPE_PLAN}>订阅套餐</option>
                <option value={PRODUCT_TYPE_PACK}>积分包</option>
              </select>
            </Field>
            <Field label="排序"><input type="number" value={form.sort} onChange={set('sort')} className={inputCls} /></Field>
            <Field label="标识 code"><input value={form.code} onChange={set('code')} placeholder="starter" className={inputCls} /></Field>
            <Field label="名称"><input value={form.name} onChange={set('name')} placeholder="Starter" className={inputCls} /></Field>
            <Field label="角标 badge"><input value={form.badge} onChange={set('badge')} placeholder="Most Popular" className={inputCls} /></Field>
            <Field label="按钮文案"><input value={form.buttonText} onChange={set('buttonText')} placeholder="Buy Now" className={inputCls} /></Field>
          </div>

          <Field label="定位副标题"><input value={form.positioning} onChange={set('positioning')} className={inputCls} /></Field>

          {isPlan ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="月度积分"><input type="number" value={form.monthlyCredits} onChange={set('monthlyCredits')} className={inputCls} /></Field>
              <Field label="年付每期积分"><input type="number" value={form.yearlyCredits} onChange={set('yearlyCredits')} className={inputCls} /></Field>
              <Field label="月付价格（分）"><input type="number" value={form.priceMonthlyAmount} onChange={set('priceMonthlyAmount')} className={inputCls} /></Field>
              <Field label="年付总价（分）"><input type="number" value={form.priceYearlyAmount} onChange={set('priceYearlyAmount')} className={inputCls} /></Field>
              <Field label="并发任务数"><input type="number" value={form.parallelTasks} onChange={set('parallelTasks')} className={inputCls} /></Field>
              <Field label="货币"><input value={form.currency} onChange={set('currency')} className={inputCls} /></Field>
              <Field label="Stripe 月付价格 ID"><input value={form.stripePriceMonthly} onChange={set('stripePriceMonthly')} placeholder="price_..." className={inputCls} /></Field>
              <Field label="Stripe 年付价格 ID"><input value={form.stripePriceYearly} onChange={set('stripePriceYearly')} placeholder="price_..." className={inputCls} /></Field>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="发放积分"><input type="number" value={form.monthlyCredits} onChange={set('monthlyCredits')} className={inputCls} /></Field>
              <Field label="一次性价格（分）"><input type="number" value={form.priceOnetimeAmount} onChange={set('priceOnetimeAmount')} className={inputCls} /></Field>
              <Field label="货币"><input value={form.currency} onChange={set('currency')} className={inputCls} /></Field>
              <Field label="Stripe 一次性价格 ID"><input value={form.stripePriceOnetime} onChange={set('stripePriceOnetime')} placeholder="price_..." className={inputCls} /></Field>
            </div>
          )}

          <Field label="特性列表（每行一条）">
            <textarea value={form.featuresText} onChange={set('featuresText')} rows={5} className={`${inputCls} font-mono text-xs`} placeholder={'4,500 fast generation points / month\n2 parallel tasks'} />
          </Field>

          <Field label="状态">
            <select value={form.status} onChange={set('status')} className={inputCls}>
              <option value={1}>启用</option>
              <option value={0}>停用</option>
            </select>
          </Field>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50">取消</button>
            <button type="submit" disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== SEO 管理 ====================

const SEO_GROUP_OPTIONS = [
  { value: '', label: '全部分组' },
  { value: 'static', label: '静态页' },
  { value: 'blog', label: '博客' },
  { value: 'model', label: '模型' },
  { value: 'effect', label: '特效' },
  { value: 'tool', label: '工具' },
  { value: 'template', label: '模板' },
];

function SeoSection({ navigateToPage }) {
  const [group, setGroup] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getSeoPage({ group, keyword, pageNo, pageSize });
      setData(result);
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [group, keyword, pageNo]);

  useEffect(() => { load(); }, [load]);

  const onSearch = (e) => {
    e.preventDefault();
    setPageNo(1);
    setKeyword(searchInput.trim());
  };

  const toggleStatus = async (row) => {
    try {
      await adminService.updateSeoStatus(row.id, row.status === 1 ? 0 : 1);
      load();
    } catch (err) {
      alert(err?.message || '操作失败');
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`确认删除「${row.pageKey}」？`)) return;
    try {
      await adminService.deleteSeo(row.id);
      load();
    } catch (err) {
      alert(err?.message || '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="SEO 管理"
        subtitle="按页面 key 覆盖 SEO 元信息，未配置的页面回退到前端静态数据"
        navigateToPage={navigateToPage}
        onRefresh={load}
        refreshing={loading}
        extraAction={(
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-xl bg-kiwi-green px-4 py-2.5 text-sm font-bold text-white transition hover:bg-kiwi-green-dark"
          >
            <Plus size={15} />
            新建覆盖
          </button>
        )}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={group}
          onChange={(e) => { setGroup(e.target.value); setPageNo(1); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-kiwi-green"
        >
          {SEO_GROUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <form onSubmit={onSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="按 key / 标题 / 路径搜索"
            className="w-56 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
          />
          <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">搜索</button>
        </form>
      </div>

      <TableShell
        loading={loading}
        error={error}
        empty={!loading && !error && data.list.length === 0}
        headers={['排序', 'Page Key', '分组', '路径', '标题', 'noindex', '状态', '操作']}
      >
        {data.list.map((row) => (
          <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/60">
            <td className="px-4 py-3 text-gray-400">{row.sort}</td>
            <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.pageKey}</td>
            <td className="px-4 py-3"><StatusPill label={row.pageGroup || 'static'} tone="blue" /></td>
            <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.path || '-'}</td>
            <td className="px-4 py-3 max-w-[280px] truncate text-gray-800" title={row.title || ''}>{row.title || '-'}</td>
            <td className="px-4 py-3">{row.noIndex === 1 ? <StatusPill label="noindex" tone="rose" /> : <span className="text-gray-300">-</span>}</td>
            <td className="px-4 py-3">
              <button type="button" onClick={() => toggleStatus(row)}>
                <StatusPill label={row.status === 1 ? '启用' : '停用'} tone={row.status === 1 ? 'green' : 'gray'} />
              </button>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(row)} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-50">编辑</button>
                <button type="button" onClick={() => remove(row)} className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-50">删除</button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />

      {editing ? (
        <SeoEditModal
          meta={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSuccess={() => { setEditing(null); load(); }}
        />
      ) : null}
    </div>
  );
}

function SeoEditModal({ meta, onClose, onSuccess }) {
  const isEdit = Boolean(meta);
  const [form, setForm] = useState(() => ({
    pageKey: meta?.pageKey ?? '',
    pageGroup: meta?.pageGroup ?? 'static',
    path: meta?.path ?? '',
    title: meta?.title ?? '',
    description: meta?.description ?? '',
    keywords: meta?.keywords ?? '',
    ogTitle: meta?.ogTitle ?? '',
    ogDescription: meta?.ogDescription ?? '',
    ogImage: meta?.ogImage ?? '',
    canonical: meta?.canonical ?? '',
    noIndex: meta?.noIndex ?? 0,
    status: meta?.status ?? 1,
    sort: meta?.sort ?? 0,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.pageKey.trim()) {
      setError('Page Key 必填');
      return;
    }
    const payload = {
      id: meta?.id,
      pageKey: form.pageKey.trim(),
      pageGroup: form.pageGroup.trim() || 'static',
      path: form.path.trim() || null,
      title: form.title.trim() || null,
      description: form.description.trim() || null,
      keywords: form.keywords.trim() || null,
      ogTitle: form.ogTitle.trim() || null,
      ogDescription: form.ogDescription.trim() || null,
      ogImage: form.ogImage.trim() || null,
      canonical: form.canonical.trim() || null,
      noIndex: Number(form.noIndex),
      status: Number(form.status),
      sort: Number(form.sort) || 0,
    };
    setSubmitting(true);
    try {
      if (isEdit) {
        await adminService.updateSeo(payload);
      } else {
        await adminService.createSeo(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err?.message || '保存失败');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900">{isEdit ? '编辑' : '新建'} SEO 覆盖</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Page Key"><input value={form.pageKey} onChange={set('pageKey')} placeholder="home / blog:my-slug" className={inputCls} disabled={isEdit} /></Field>
            <Field label="分组">
              <select value={form.pageGroup} onChange={set('pageGroup')} className={inputCls}>
                {SEO_GROUP_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="路径 path"><input value={form.path} onChange={set('path')} placeholder="/pricing" className={inputCls} /></Field>
          <Field label="标题 title"><input value={form.title} onChange={set('title')} className={inputCls} /></Field>
          <Field label="描述 description"><textarea value={form.description} onChange={set('description')} rows={3} className={inputCls} /></Field>
          <Field label="关键词 keywords"><input value={form.keywords} onChange={set('keywords')} placeholder="ai video, text to video" className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="OG 标题"><input value={form.ogTitle} onChange={set('ogTitle')} className={inputCls} /></Field>
            <Field label="OG 图片 URL"><input value={form.ogImage} onChange={set('ogImage')} className={inputCls} /></Field>
          </div>
          <Field label="OG 描述"><textarea value={form.ogDescription} onChange={set('ogDescription')} rows={2} className={inputCls} /></Field>
          <Field label="Canonical"><input value={form.canonical} onChange={set('canonical')} placeholder="https://lazykiwi.ai/pricing" className={inputCls} /></Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="排序"><input type="number" value={form.sort} onChange={set('sort')} className={inputCls} /></Field>
            <Field label="noindex">
              <select value={form.noIndex} onChange={set('noIndex')} className={inputCls}>
                <option value={0}>否</option>
                <option value={1}>是</option>
              </select>
            </Field>
            <Field label="状态">
              <select value={form.status} onChange={set('status')} className={inputCls}>
                <option value={1}>启用</option>
                <option value={0}>停用</option>
              </select>
            </Field>
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50">取消</button>
            <button type="submit" disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green disabled:bg-gray-50 disabled:text-gray-400';

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-500">{label}</label>
      {children}
    </div>
  );
}

// ==================== 模板页面管理 ====================

const TEMPLATE_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'video', label: '视频' },
  { value: 'image', label: '图片' },
];

const PAGE_STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: '1', label: '已发布' },
  { value: '0', label: '草稿' },
];

const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero 首屏' },
  { type: 'what_it_is', label: '功能卡片' },
  { type: 'scenarios', label: '应用场景' },
  { type: 'faq', label: '常见问题' },
  { type: 'cta', label: '行动号召' },
  { type: 'other_names', label: '关键词 / 别名' },
  { type: 'rich_text', label: '富文本' },
  { type: 'image', label: '单张图片' },
  { type: 'gallery', label: '图片画廊' },
  { type: 'heading', label: '小标题' },
  { type: 'spacer', label: '空白间距' },
];
const BLOCK_LABELS = Object.fromEntries(BLOCK_TYPES.map((b) => [b.type, b.label]));

function blockDefaultData(type) {
  switch (type) {
    case 'hero':
      return { title: '', description: '', image: '', image_before: '', image_after: '' };
    case 'what_it_is':
      return { eyebrow: '', title: '', intro: '', cards: [] };
    case 'scenarios':
      return { eyebrow: '', title: '', description: '', scenarios: [] };
    case 'faq':
      return { eyebrow: '', title: '', faqs: [] };
    case 'cta':
      return { headline: '', supporting_text: '', button_text: '' };
    case 'other_names':
      return { title: '', description: '', keywords: [] };
    case 'rich_text':
      return { markdown: '' };
    case 'image':
      return { url: '', alt: '', caption: '' };
    case 'gallery':
      return { images: [] };
    case 'heading':
      return { text: '' };
    default:
      return {};
  }
}

function makeBlock(type) {
  const rand = Math.random().toString(36).slice(2, 6);
  return { id: `b${Date.now().toString(36)}${rand}`, type, data: blockDefaultData(type) };
}

function PagesSection({ navigateToPage }) {
  const [view, setView] = useState('list'); // list | editor
  const [editingId, setEditingId] = useState(null); // number | 'new' | null

  const [templateType, setTemplateType] = useState('');
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getTemplatePagePage({
        templateType: templateType || undefined,
        status: status === '' ? undefined : Number(status),
        keyword,
        pageNo,
        pageSize,
      });
      setData(result);
    } catch (err) {
      setError(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [templateType, status, keyword, pageNo]);

  useEffect(() => { if (view === 'list') load(); }, [load, view]);

  const onSearch = (e) => {
    e.preventDefault();
    setPageNo(1);
    setKeyword(searchInput.trim());
  };

  const openEditor = (id) => { setEditingId(id); setView('editor'); };

  const togglePublish = async (row) => {
    try {
      await adminService.updateTemplatePageStatus(row.id, row.status === 1 ? 0 : 1);
      load();
    } catch (err) {
      alert(err?.message || '操作失败');
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`确认删除「${row.name || row.slug}」？`)) return;
    try {
      await adminService.deleteTemplatePage(row.id);
      load();
    } catch (err) {
      alert(err?.message || '删除失败');
    }
  };

  if (view === 'editor') {
    return (
      <TemplatePageEditor
        pageId={editingId === 'new' ? null : editingId}
        navigateToPage={navigateToPage}
        onBack={() => { setView('list'); setEditingId(null); }}
        onSaved={() => { setView('list'); setEditingId(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="模板页面"
        subtitle="用模块化区块构建 / 编辑模板落地页，发布后营销站服务端直接渲染，无需重新部署"
        navigateToPage={navigateToPage}
        onRefresh={load}
        refreshing={loading}
        extraAction={(
          <button
            type="button"
            onClick={() => openEditor('new')}
            className="inline-flex items-center gap-2 rounded-xl bg-kiwi-green px-4 py-2.5 text-sm font-bold text-white transition hover:bg-kiwi-green-dark"
          >
            <Plus size={15} />
            新建页面
          </button>
        )}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <select
            value={templateType}
            onChange={(e) => { setTemplateType(e.target.value); setPageNo(1); }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-kiwi-green"
          >
            {TEMPLATE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPageNo(1); }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-kiwi-green"
          >
            {PAGE_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <form onSubmit={onSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="按 slug / 名称搜索"
            className="w-56 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-kiwi-green"
          />
          <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black">搜索</button>
        </form>
      </div>

      <TableShell
        loading={loading}
        error={error}
        empty={!loading && !error && data.list.length === 0}
        headers={['排序', 'Slug', '名称', '类型', '状态', '更新时间', '操作']}
      >
        {data.list.map((row) => (
          <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/60">
            <td className="px-4 py-3 text-gray-400">{row.sort}</td>
            <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.slug}</td>
            <td className="px-4 py-3 max-w-[240px] truncate text-gray-800" title={row.name || ''}>{row.name || '-'}</td>
            <td className="px-4 py-3"><StatusPill label={row.templateType === 'image' ? '图片' : '视频'} tone={row.templateType === 'image' ? 'violet' : 'blue'} /></td>
            <td className="px-4 py-3">
              <button type="button" onClick={() => togglePublish(row)}>
                <StatusPill label={row.status === 1 ? '已发布' : '草稿'} tone={row.status === 1 ? 'green' : 'gray'} />
              </button>
            </td>
            <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(row.updateTime)}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => openEditor(row.id)} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-50">编辑</button>
                <button type="button" onClick={() => remove(row)} className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-50">删除</button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <Pagination pageNo={pageNo} pageSize={pageSize} total={data.total} onChange={setPageNo} />
    </div>
  );
}

function TemplatePageEditor({ pageId, onBack, onSaved }) {
  const isEdit = Boolean(pageId);
  const [tab, setTab] = useState('content'); // content | seo
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ slug: '', name: '', templateType: 'video', status: 0, sort: 0 });
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    if (!isEdit) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const page = await adminService.getTemplatePage(pageId);
        if (!mounted) return;
        setMeta({
          slug: page.slug || '',
          name: page.name || '',
          templateType: page.templateType || 'video',
          status: page.status ?? 0,
          sort: page.sort ?? 0,
        });
        let parsed = [];
        if (page.contentJson) {
          try {
            const json = JSON.parse(page.contentJson);
            if (Array.isArray(json?.blocks)) parsed = json.blocks;
          } catch { parsed = []; }
        }
        setBlocks(parsed.map((b) => ({ id: b.id || makeBlock(b.type).id, type: b.type, data: b.data || {} })));
      } catch (err) {
        if (mounted) setError(err?.message || '加载失败');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [pageId, isEdit]);

  const setMetaField = (key) => (e) => setMeta((prev) => ({ ...prev, [key]: e.target.value }));

  const addBlock = (type) => setBlocks((prev) => [...prev, makeBlock(type)]);
  const insertBelow = (index, type) => setBlocks((prev) => {
    const next = [...prev];
    next.splice(index + 1, 0, makeBlock(type));
    return next;
  });
  const updateBlockData = (index, nextData) => setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, data: nextData } : b)));
  const moveBlock = (index, dir) => setBlocks((prev) => {
    const target = index + dir;
    if (target < 0 || target >= prev.length) return prev;
    const next = [...prev];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const removeBlock = (index) => setBlocks((prev) => prev.filter((_, i) => i !== index));

  const save = async () => {
    setError('');
    if (!meta.slug.trim()) { setError('slug 必填'); setTab('content'); return; }
    if (!meta.name.trim()) { setError('名称必填'); setTab('content'); return; }
    const payload = {
      id: isEdit ? pageId : undefined,
      slug: meta.slug.trim(),
      name: meta.name.trim(),
      templateType: meta.templateType || 'video',
      status: Number(meta.status),
      sort: Number(meta.sort) || 0,
      contentJson: JSON.stringify({ blocks }),
    };
    setSaving(true);
    try {
      if (isEdit) {
        await adminService.updateTemplatePage(payload);
      } else {
        await adminService.createTemplatePage(payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.message || '保存失败');
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button type="button" onClick={onBack} className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-gray-900">
            <ArrowLeft size={14} /> 返回列表
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight">{isEdit ? '编辑模板页面' : '新建模板页面'}</h1>
          <p className="mt-1 text-sm text-gray-500">左侧选择区块添加到正文，每个区块为一行模块，可上下移动、删除</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={meta.slug ? `https://lazykiwi.ai/templates/${meta.slug}` : undefined}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 ${meta.slug ? '' : 'pointer-events-none opacity-40'}`}
          >
            预览 <ArrowUpRight size={15} />
          </a>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-kiwi-green px-5 py-2.5 text-sm font-bold text-white transition hover:bg-kiwi-green-dark disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            保存
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Slug"><input value={meta.slug} onChange={setMetaField('slug')} placeholder="360-rotation" className={inputCls} disabled={isEdit} /></Field>
          <Field label="名称"><input value={meta.name} onChange={setMetaField('name')} className={inputCls} /></Field>
          <Field label="类型">
            <select value={meta.templateType} onChange={setMetaField('templateType')} className={inputCls}>
              <option value="video">视频</option>
              <option value="image">图片</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="排序"><input type="number" value={meta.sort} onChange={setMetaField('sort')} className={inputCls} /></Field>
            <Field label="状态">
              <select value={meta.status} onChange={setMetaField('status')} className={inputCls}>
                <option value={0}>草稿</option>
                <option value={1}>已发布</option>
              </select>
            </Field>
          </div>
        </div>
      </section>

      <div className="flex gap-2 border-b border-gray-200">
        {[{ id: 'content', label: '内容' }, { id: 'seo', label: 'SEO' }].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px rounded-t-xl px-5 py-2.5 text-sm font-bold transition ${tab === t.id ? 'border-x border-t border-gray-200 bg-white text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <ErrorBlock message={error} /> : null}

      {tab === 'content' ? (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">区块面板</p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {BLOCK_TYPES.map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => addBlock(b.type)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:border-kiwi-green hover:bg-kiwi-light-green/40"
                  >
                    <Plus size={13} className="text-kiwi-green-dark" />
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            {blocks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
                从左侧区块面板选择模块添加到正文
              </div>
            ) : null}
            {blocks.map((block, index) => (
              <BlockCard
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                onChange={(nextData) => updateBlockData(index, nextData)}
                onMove={(dir) => moveBlock(index, dir)}
                onRemove={() => removeBlock(index)}
                onInsertBelow={(type) => insertBelow(index, type)}
              />
            ))}
          </div>
        </div>
      ) : (
        <TemplateSeoTab slug={meta.slug} name={meta.name} />
      )}
    </div>
  );
}

function BlockCard({ block, index, total, onChange, onMove, onRemove, onInsertBelow }) {
  const set = (key, value) => onChange({ ...block.data, [key]: value });
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">#{index + 1}</span>
          <span className="text-sm font-bold text-gray-800">{BLOCK_LABELS[block.type] || block.type}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" title="上移" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-30"><ArrowUp size={14} /></button>
          <button type="button" title="下移" disabled={index === total - 1} onClick={() => onMove(1)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-30"><ArrowDown size={14} /></button>
          <select
            value=""
            onChange={(e) => { if (e.target.value) { onInsertBelow(e.target.value); e.target.value = ''; } }}
            title="在下方插入"
            className="rounded-lg border border-gray-200 px-1.5 py-1.5 text-xs font-semibold text-gray-500 outline-none focus:border-kiwi-green"
          >
            <option value="">＋ 下方插入…</option>
            {BLOCK_TYPES.map((b) => <option key={b.type} value={b.type}>{b.label}</option>)}
          </select>
          <button type="button" title="删除" onClick={onRemove} className="rounded-lg border border-rose-200 p-1.5 text-rose-600 transition hover:bg-rose-50"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="p-4">
        <BlockFields type={block.type} data={block.data} set={set} onChange={onChange} />
      </div>
    </div>
  );
}

function BlockFields({ type, data, set, onChange }) {
  switch (type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <Field label="标题"><input value={data.title || ''} onChange={(e) => set('title', e.target.value)} className={inputCls} /></Field>
          <Field label="描述"><textarea value={data.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className={inputCls} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <ImageInput label="主图" value={data.image || ''} onChange={(v) => set('image', v)} />
            <ImageInput label="Before 图" value={data.image_before || ''} onChange={(v) => set('image_before', v)} />
            <ImageInput label="After 图" value={data.image_after || ''} onChange={(v) => set('image_after', v)} />
          </div>
        </div>
      );
    case 'what_it_is':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow"><input value={data.eyebrow || ''} onChange={(e) => set('eyebrow', e.target.value)} className={inputCls} /></Field>
            <Field label="标题"><input value={data.title || ''} onChange={(e) => set('title', e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="引言"><textarea value={data.intro || ''} onChange={(e) => set('intro', e.target.value)} rows={2} className={inputCls} /></Field>
          <RepeatableList
            label="卡片"
            items={data.cards || []}
            onChange={(items) => onChange({ ...data, cards: items })}
            newItem={() => ({ icon: 'sparkles', title: '', description: '' })}
            render={(item, upd) => (
              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <Field label="图标">
                  <select value={item.icon || 'sparkles'} onChange={(e) => upd({ ...item, icon: e.target.value })} className={inputCls}>
                    {['scene', 'subject', 'motion', 'camera', 'sparkles', 'magic', 'video'].map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </Field>
                <div className="space-y-2">
                  <input value={item.title || ''} onChange={(e) => upd({ ...item, title: e.target.value })} placeholder="标题" className={inputCls} />
                  <textarea value={item.description || ''} onChange={(e) => upd({ ...item, description: e.target.value })} rows={2} placeholder="描述" className={inputCls} />
                </div>
              </div>
            )}
          />
        </div>
      );
    case 'scenarios':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow"><input value={data.eyebrow || ''} onChange={(e) => set('eyebrow', e.target.value)} className={inputCls} /></Field>
            <Field label="标题"><input value={data.title || ''} onChange={(e) => set('title', e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="描述"><textarea value={data.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className={inputCls} /></Field>
          <RepeatableList
            label="场景"
            items={data.scenarios || []}
            onChange={(items) => onChange({ ...data, scenarios: items })}
            newItem={() => ({ image: '', title: '', category: '', description: '' })}
            render={(item, upd) => (
              <div className="space-y-2">
                <ImageInput label="配图" value={item.image || ''} onChange={(v) => upd({ ...item, image: v })} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={item.title || ''} onChange={(e) => upd({ ...item, title: e.target.value })} placeholder="标题" className={inputCls} />
                  <input value={item.category || ''} onChange={(e) => upd({ ...item, category: e.target.value })} placeholder="分类" className={inputCls} />
                </div>
                <textarea value={item.description || ''} onChange={(e) => upd({ ...item, description: e.target.value })} rows={2} placeholder="描述" className={inputCls} />
              </div>
            )}
          />
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow"><input value={data.eyebrow || ''} onChange={(e) => set('eyebrow', e.target.value)} className={inputCls} /></Field>
            <Field label="标题"><input value={data.title || ''} onChange={(e) => set('title', e.target.value)} className={inputCls} /></Field>
          </div>
          <RepeatableList
            label="问答"
            items={data.faqs || []}
            onChange={(items) => onChange({ ...data, faqs: items })}
            newItem={() => ({ question: '', answer: '' })}
            render={(item, upd) => (
              <div className="space-y-2">
                <input value={item.question || ''} onChange={(e) => upd({ ...item, question: e.target.value })} placeholder="问题" className={inputCls} />
                <textarea value={item.answer || ''} onChange={(e) => upd({ ...item, answer: e.target.value })} rows={2} placeholder="回答" className={inputCls} />
              </div>
            )}
          />
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-4">
          <Field label="标题"><input value={data.headline || ''} onChange={(e) => set('headline', e.target.value)} className={inputCls} /></Field>
          <Field label="辅助文案"><textarea value={data.supporting_text || ''} onChange={(e) => set('supporting_text', e.target.value)} rows={2} className={inputCls} /></Field>
          <Field label="按钮文案"><input value={data.button_text || ''} onChange={(e) => set('button_text', e.target.value)} placeholder="Start creating" className={inputCls} /></Field>
        </div>
      );
    case 'other_names':
      return (
        <div className="space-y-4">
          <Field label="标题"><input value={data.title || ''} onChange={(e) => set('title', e.target.value)} className={inputCls} /></Field>
          <Field label="描述"><textarea value={data.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className={inputCls} /></Field>
          <Field label="关键词（逗号分隔）">
            <input
              value={(data.keywords || []).join(', ')}
              onChange={(e) => set('keywords', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="ai video, motion, 360 spin"
              className={inputCls}
            />
          </Field>
        </div>
      );
    case 'rich_text':
      return (
        <Field label="Markdown（支持 # 标题、- 列表、空行分段）">
          <textarea value={data.markdown || ''} onChange={(e) => set('markdown', e.target.value)} rows={6} className={`${inputCls} font-mono`} />
        </Field>
      );
    case 'image':
      return (
        <div className="space-y-3">
          <ImageInput label="图片" value={data.url || ''} onChange={(v) => set('url', v)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Alt 文本"><input value={data.alt || ''} onChange={(e) => set('alt', e.target.value)} className={inputCls} /></Field>
            <Field label="图注"><input value={data.caption || ''} onChange={(e) => set('caption', e.target.value)} className={inputCls} /></Field>
          </div>
        </div>
      );
    case 'gallery':
      return (
        <RepeatableList
          label="图片"
          items={data.images || []}
          onChange={(items) => onChange({ ...data, images: items })}
          newItem={() => ({ url: '', alt: '' })}
          render={(item, upd) => (
            <div className="space-y-2">
              <ImageInput label="图片" value={item.url || ''} onChange={(v) => upd({ ...item, url: v })} />
              <input value={item.alt || ''} onChange={(e) => upd({ ...item, alt: e.target.value })} placeholder="Alt 文本" className={inputCls} />
            </div>
          )}
        />
      );
    case 'heading':
      return <Field label="小标题文本"><input value={data.text || ''} onChange={(e) => set('text', e.target.value)} className={inputCls} /></Field>;
    case 'spacer':
      return <p className="text-sm text-gray-400">空白间距区块，无需配置。</p>;
    default:
      return <p className="text-sm text-gray-400">未知区块类型：{type}</p>;
  }
}

function RepeatableList({ label, items, onChange, newItem, render }) {
  const list = Array.isArray(items) ? items : [];
  const update = (index, value) => onChange(list.map((it, i) => (i === index ? value : it)));
  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const remove = (index) => onChange(list.filter((_, i) => i !== index));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-bold text-gray-500">{label}（{list.length}）</label>
        <button type="button" onClick={() => onChange([...list, newItem()])} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-50">
          <Plus size={12} /> 添加
        </button>
      </div>
      <div className="space-y-3">
        {list.map((item, index) => (
          <div key={index} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">#{index + 1}</span>
              <div className="flex gap-1.5">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-md border border-gray-200 bg-white p-1 text-gray-500 transition hover:bg-gray-50 disabled:opacity-30"><ArrowUp size={12} /></button>
                <button type="button" disabled={index === list.length - 1} onClick={() => move(index, 1)} className="rounded-md border border-gray-200 bg-white p-1 text-gray-500 transition hover:bg-gray-50 disabled:opacity-30"><ArrowDown size={12} /></button>
                <button type="button" onClick={() => remove(index)} className="rounded-md border border-rose-200 bg-white p-1 text-rose-600 transition hover:bg-rose-50"><Trash2 size={12} /></button>
              </div>
            </div>
            {render(item, (value) => update(index, value))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageInput({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr('');
    setUploading(true);
    try {
      const url = await adminService.uploadFile(file);
      onChange(url);
    } catch (uploadErr) {
      setErr(uploadErr?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-500">{label}</label>
      {value ? (
        <div className="mb-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-28 w-full object-cover" />
        </div>
      ) : null}
      <div className="flex gap-2">
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="图片 URL" className={inputCls} />
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          上传
          <input type="file" accept="image/*" onChange={onFile} className="hidden" disabled={uploading} />
        </label>
      </div>
      {err ? <p className="mt-1 text-xs font-semibold text-rose-500">{err}</p> : null}
    </div>
  );
}

function TemplateSeoTab({ slug, name }) {
  const pageKey = slug ? `template:${slug}` : '';
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '', noIndex: 0, status: 1 });

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const result = await adminService.getSeoPage({ group: 'template', keyword: slug, pageSize: 50 });
        if (!mounted) return;
        const row = (result.list || []).find((r) => r.pageKey === pageKey) || null;
        setExisting(row);
        if (row) {
          setForm({
            title: row.title ?? '', description: row.description ?? '', keywords: row.keywords ?? '',
            ogTitle: row.ogTitle ?? '', ogDescription: row.ogDescription ?? '', ogImage: row.ogImage ?? '',
            canonical: row.canonical ?? '', noIndex: row.noIndex ?? 0, status: row.status ?? 1,
          });
        }
      } catch (err) {
        if (mounted) setError(err?.message || '加载失败');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug, pageKey]);

  const set = (key) => (e) => { setSaved(false); setForm((prev) => ({ ...prev, [key]: e.target.value })); };

  const save = async () => {
    if (!slug) { setError('请先填写 slug 并保存内容'); return; }
    setError('');
    const payload = {
      id: existing?.id,
      pageKey,
      pageGroup: 'template',
      path: `/templates/${slug}`,
      title: form.title.trim() || null,
      description: form.description.trim() || null,
      keywords: form.keywords.trim() || null,
      ogTitle: form.ogTitle.trim() || null,
      ogDescription: form.ogDescription.trim() || null,
      ogImage: form.ogImage.trim() || null,
      canonical: form.canonical.trim() || null,
      noIndex: Number(form.noIndex),
      status: Number(form.status),
      sort: existing?.sort ?? 0,
    };
    setSaving(true);
    try {
      if (existing) {
        await adminService.updateSeo(payload);
      } else {
        const id = await adminService.createSeo(payload);
        setExisting({ ...payload, id });
      }
      setSaved(true);
    } catch (err) {
      setError(err?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (!slug) {
    return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">请先在“内容”标签填写 slug 并保存，再配置 SEO</div>;
  }
  if (loading) return <LoadingBlock />;

  return (
    <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">页面 SEO</h2>
          <p className="mt-0.5 text-xs font-medium text-gray-400">Page Key：<span className="font-mono">{pageKey}</span>{existing ? '' : '（尚未创建，保存后生成）'}</p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
          保存 SEO
        </button>
      </div>
      <div className="space-y-4">
        <Field label="标题 title"><input value={form.title} onChange={set('title')} placeholder={name ? `${name} Template | LazyKiwi` : ''} className={inputCls} /></Field>
        <Field label="描述 description"><textarea value={form.description} onChange={set('description')} rows={3} className={inputCls} /></Field>
        <Field label="关键词 keywords"><input value={form.keywords} onChange={set('keywords')} className={inputCls} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="OG 标题"><input value={form.ogTitle} onChange={set('ogTitle')} className={inputCls} /></Field>
          <Field label="OG 图片 URL"><input value={form.ogImage} onChange={set('ogImage')} className={inputCls} /></Field>
        </div>
        <Field label="OG 描述"><textarea value={form.ogDescription} onChange={set('ogDescription')} rows={2} className={inputCls} /></Field>
        <Field label="Canonical"><input value={form.canonical} onChange={set('canonical')} placeholder={`https://lazykiwi.ai/templates/${slug}`} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="noindex">
            <select value={form.noIndex} onChange={set('noIndex')} className={inputCls}>
              <option value={0}>否</option>
              <option value={1}>是</option>
            </select>
          </Field>
          <Field label="状态">
            <select value={form.status} onChange={set('status')} className={inputCls}>
              <option value={1}>启用</option>
              <option value={0}>停用</option>
            </select>
          </Field>
        </div>
        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}
        {saved ? <p className="rounded-xl bg-kiwi-light-green px-3 py-2 text-sm font-semibold text-kiwi-green-dark">SEO 已保存</p> : null}
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle, navigateToPage, onRefresh, refreshing, refreshDisabled, extraAction }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-kiwi-green-dark">Admin Console</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {extraAction}
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshDisabled || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            刷新
          </button>
        ) : null}
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
  );
}

function LoadingBlock() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center gap-3 text-gray-400">
      <Loader2 size={28} className="animate-spin" />
      <p className="text-sm font-semibold">加载中…</p>
    </div>
  );
}

function ErrorBlock({ message }) {
  return (
    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600">
      {message}
    </div>
  );
}

function TableShell({ loading, error, empty, headers, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-400">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-12 text-center text-gray-400">
                  <Loader2 size={22} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-sm font-semibold text-red-500">{error}</td>
              </tr>
            ) : empty ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-gray-400">暂无数据</td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Pagination({ pageNo, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  if (total <= pageSize) {
    return total > 0 ? (
      <div className="mt-4 text-right text-xs font-medium text-gray-400">共 {formatNumber(total)} 条</div>
    ) : null;
  }
  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xs font-medium text-gray-400">共 {formatNumber(total)} 条 · 第 {pageNo} / {totalPages} 页</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pageNo <= 1}
          onClick={() => onChange(pageNo - 1)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          上一页
        </button>
        <button
          type="button"
          disabled={pageNo >= totalPages}
          onClick={() => onChange(pageNo + 1)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          下一页
        </button>
      </div>
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

function AdminSidebar({ navigateToPage, activeSection, onSelect }) {
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
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                  active
                    ? 'bg-kiwi-light-green text-kiwi-green-dark'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={17} />
                {section.label}
              </button>
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
