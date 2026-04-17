import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import {
  hasPartnerToken,
  getCaseByCnr,
  refreshCase,
  downloadOrderPdf,
  triggerBlobDownload,
  asStringList,
  asArray,
  courtJudgmentOrders,
  courtInterimOrders,
  orderFilenameFromRow,
  pickNextHearingDateFromCaseDetail,
} from '../../modules/e-courts';
import { useEcourtsCache } from '../../context/EcourtsCacheContext';

function formatIn(d) {
  if (!d) return '—';
  const t = Date.parse(d);
  if (Number.isNaN(t)) return d;
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EcourtsCasePanel({ cnr, embedded = true }) {
  const { setSnapshot, getSnapshot, setRefreshHint } = useEcourtsCache();
  const key = String(cnr || '')
    .trim()
    .toUpperCase();

  const cached = key ? getSnapshot(key) : undefined;
  const [detail, setDetail] = useState(() => cached?.payload?.data ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  /** Which order row is downloading (`judgment-0`, `interim-1`, …) — blocks duplicate clicks. */
  const [orderDownloadKey, setOrderDownloadKey] = useState(null);
  const orderDownloadLock = useRef(false);
  const [openSections, setOpenSections] = useState({
    orders: false,
    ias: false,
    notices: false,
    docs: false,
    linked: false,
    fir: false,
    ai: true,
  });

  const load = useCallback(async () => {
    if (!key) return;
    if (!hasPartnerToken()) {
      setError('Add VITE_ECOURTS_API_TOKEN to your .env file to load live eCourts data.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await getCaseByCnr(key);
      setDetail(res?.data ?? null);
      setSnapshot(key, res);
    } catch (e) {
      setDetail(null);
      setError(e?.message || 'Failed to load case.');
    } finally {
      setLoading(false);
    }
  }, [key, setSnapshot]);

  useEffect(() => {
    if (!key) return;
    const snap = getSnapshot(key);
    if (snap?.payload?.data) {
      setDetail(snap.payload.data);
    } else {
      setDetail(null);
    }
  }, [key, getSnapshot]);

  useEffect(() => {
    if (!key) return;
    if (!hasPartnerToken()) return;
    const snap = getSnapshot(key);
    if (!snap?.payload) {
      load();
    }
  }, [key, getSnapshot, load]);

  const handleRefreshQueue = async () => {
    if (!key || !hasPartnerToken()) return;
    setRefreshing(true);
    setError('');
    try {
      const res = await refreshCase(key);
      const msg =
        res?.data?.message ||
        res?.data?.estimatedTime ||
        'Refresh queued. Data may take several minutes to update.';
      setRefreshHint(key, msg);
      setError('');
    } catch (e) {
      setError(e?.message || 'Refresh request failed.');
    } finally {
      setRefreshing(false);
    }
  };

  const hint = key ? getSnapshot(key)?.refreshHint : undefined;

  /** From GET /api/partner/case/{cnr} → `data.courtCaseData` (camelCase per docs; snake_case tolerated). */
  const court = detail?.courtCaseData ?? detail?.court_case_data;
  const ai = detail?.caseAiAnalysis;
  const entity = detail?.entityInfo;

  const petitionersList = court ? asStringList(court.petitioners) : [];
  const respondentsList = court ? asStringList(court.respondents) : [];

  const toggle = (id) => setOpenSections((s) => ({ ...s, [id]: !s[id] }));

  /**
   * PDF download is always the **second step** after case detail (same CNR):
   * 1) GET /api/partner/case/{cnr} → `courtCaseData.judgmentOrders[]` / `interimOrders[]` → each row’s `orderUrl`
   * 2) GET /api/partner/case/{cnr}/order/{filename} with that exact `orderUrl` value
   * We only pass rows rendered from `court` above — never invent filenames elsewhere.
   */
  const saveOrder = async (orderRow, downloadKey) => {
    if (orderDownloadLock.current || orderDownloadKey) return;
    const filename = orderFilenameFromRow(orderRow);
    if (!key || !filename) return;
    orderDownloadLock.current = true;
    setOrderDownloadKey(downloadKey);
    try {
      const { blob, filename: name } = await downloadOrderPdf(key, filename);
      const safeName = /\.pdf$/i.test(name) ? name : `${name}.pdf`;
      triggerBlobDownload(blob, safeName);
    } catch (e) {
      setError(e?.message || 'Could not download order.');
    } finally {
      orderDownloadLock.current = false;
      setOrderDownloadKey(null);
    }
  };

  if (!key) return null;

  const wrap = embedded ? 'space-y-3' : 'space-y-3 px-4 py-4';

  return (
    <div className={wrap}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading || !hasPartnerToken()}
          onClick={() => load()}
        >
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Loading…
            </>
          ) : (
            <>
              <RefreshCw size={14} /> Fetch latest
            </>
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={refreshing || !hasPartnerToken()}
          onClick={handleRefreshQueue}
        >
          {refreshing ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Queue refresh…
            </>
          ) : (
            <>
              <ScrollText size={14} /> Refresh case status (source)
            </>
          )}
        </Button>
      </div>

      {!hasPartnerToken() && (
        <Card className="bg-amber-50 border-amber-100">
          <div className="flex gap-2 items-start">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900">
              Set <code className="font-mono bg-amber-100/80 px-1 rounded">VITE_ECOURTS_API_TOKEN</code> in{' '}
              <code className="font-mono">advocate-client-app/.env</code> and restart Vite.
            </p>
          </div>
        </Card>
      )}

      {hint && (
        <Card className="bg-blue-50 border-blue-100">
          <p className="text-xs text-blue-900">
            <strong>Refresh:</strong> {hint}
          </p>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50 border-red-100">
          <div className="flex gap-2 items-start">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {loading && !court && (
        <Card>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw size={18} className="animate-spin text-navy-700" />
            Loading eCourts…
          </div>
        </Card>
      )}

      {court && (
        <>
          <Card>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">eCourts — live</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {petitionersList[0] || '—'} vs {respondentsList[0] || '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono">CNR {court.cnr}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-100 text-navy-800 font-medium">
                {court.caseStatus || '—'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-400">Next hearing</p>
                <p className="font-semibold text-gray-800">
                  {formatIn(pickNextHearingDateFromCaseDetail(detail))}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Registered</p>
                <p className="font-medium text-gray-800">{formatIn(court.registrationDate)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Court</p>
                <p className="font-medium text-gray-800">{court.courtName}</p>
              </div>
            </div>
            {entity?.dateModified && (
              <p className="text-[10px] text-gray-400 mt-2">Index updated {formatIn(entity.dateModified)}</p>
            )}
          </Card>

          {ai && (
            <Card className="bg-violet-50/80 border-violet-100">
              <button
                type="button"
                onClick={() => toggle('ai')}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-violet-900">
                  <Sparkles size={14} /> AI case summary
                </span>
                {openSections.ai ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openSections.ai && (
                <div className="mt-2 space-y-2 text-xs text-violet-950">
                  <p>{ai.caseSummary}</p>
                  {Array.isArray(ai.keyIssues) && ai.keyIssues.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5">
                      {ai.keyIssues.map((x) => (
                        <li key={String(x)}>{x}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Card>
          )}

          <Section
            id="orders"
            title="Judgment & interim orders"
            icon={<FileText size={14} />}
            open={openSections.orders}
            onToggle={() => toggle('orders')}
          >
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Judgments</p>
                {courtJudgmentOrders(court).length === 0 ? (
                  <p className="text-xs text-gray-500">None listed.</p>
                ) : (
                  <ul className="space-y-1">
                    {courtJudgmentOrders(court).map((o, i) => {
                      const fileName = orderFilenameFromRow(o);
                      return (
                      <li key={i} className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          {fileName ? (
                            <>
                              <p className="font-mono text-xs text-gray-900 break-all">{fileName}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {formatIn(o.orderDate ?? o.order_date)}
                                {(o.orderType || o.order_type) ? ` · ${o.orderType || o.order_type}` : ''}
                              </p>
                            </>
                          ) : (
                            <span>
                              {formatIn(o.orderDate ?? o.order_date)} — {o.orderType || o.order_type || 'Order'}
                            </span>
                          )}
                        </div>
                        {fileName ? (
                          <button
                            type="button"
                            disabled={orderDownloadKey !== null}
                            className="inline-flex items-center gap-1.5 text-navy-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                            onClick={() => saveOrder(o, `judgment-${i}`)}
                          >
                            {orderDownloadKey === `judgment-${i}` ? (
                              <>
                                <Loader2 size={12} className="animate-spin flex-shrink-0" />
                                <span>Downloading…</span>
                              </>
                            ) : (
                              'Download PDF'
                            )}
                          </button>
                        ) : null}
                      </li>
                    );
                    })}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Interim</p>
                {courtInterimOrders(court).length === 0 ? (
                  <p className="text-xs text-gray-500">None listed.</p>
                ) : (
                  <ul className="space-y-1">
                    {courtInterimOrders(court).map((o, i) => {
                      const fileName = orderFilenameFromRow(o);
                      return (
                      <li key={i} className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          {fileName ? (
                            <>
                              <p className="font-mono text-xs text-gray-900 break-all">{fileName}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {formatIn(o.orderDate ?? o.order_date)}
                                {(o.description || o.Description) ? ` · ${o.description || o.Description}` : ''}
                              </p>
                            </>
                          ) : (
                            <span>
                              {formatIn(o.orderDate ?? o.order_date)} — {o.description || o.Description || 'Interim'}
                            </span>
                          )}
                        </div>
                        {fileName ? (
                          <button
                            type="button"
                            disabled={orderDownloadKey !== null}
                            className="inline-flex items-center gap-1.5 text-navy-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                            onClick={() => saveOrder(o, `interim-${i}`)}
                          >
                            {orderDownloadKey === `interim-${i}` ? (
                              <>
                                <Loader2 size={12} className="animate-spin flex-shrink-0" />
                                <span>Downloading…</span>
                              </>
                            ) : (
                              'Download PDF'
                            )}
                          </button>
                        ) : null}
                      </li>
                    );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </Section>

          <Section
            id="ias"
            title="Interlocutory applications"
            icon={<FileText size={14} />}
            open={openSections.ias}
            onToggle={() => toggle('ias')}
            count={asArray(court.interlocutoryApplications).length}
          >
            {asArray(court.interlocutoryApplications).length === 0 ? (
              <p className="text-xs text-gray-500">None listed.</p>
            ) : (
              <ul className="space-y-2">
                {asArray(court.interlocutoryApplications).map((ia, i) => (
                  <li key={i} className="text-xs border-b border-gray-50 pb-2">
                    <p className="font-medium">{ia.regNo || ia.serialNumber}</p>
                    <p className="text-gray-600">{ia.particular}</p>
                    <p className="text-gray-400 mt-0.5">
                      {ia.status} · {formatIn(ia.filingDate)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            id="notices"
            title="Notices"
            icon={<FileText size={14} />}
            open={openSections.notices}
            onToggle={() => toggle('notices')}
            count={asArray(court.notices).length}
          >
            {asArray(court.notices).length === 0 ? (
              <p className="text-xs text-gray-500">None listed.</p>
            ) : (
              <ul className="space-y-2">
                {asArray(court.notices).map((n, i) => (
                  <li key={i} className="text-xs">
                    <p className="font-medium">{n.noticeType}</p>
                    <p className="text-gray-600">{n.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            id="docs"
            title="Filed documents"
            icon={<FileText size={14} />}
            open={openSections.docs}
            onToggle={() => toggle('docs')}
            count={asArray(court.filedDocuments).length}
          >
            {asArray(court.filedDocuments).length === 0 ? (
              <p className="text-xs text-gray-500">None listed.</p>
            ) : (
              <ul className="space-y-2">
                {asArray(court.filedDocuments).map((d, i) => (
                  <li key={i} className="text-xs">
                    <p className="font-medium">{d.documentFiled || d.documentNo}</p>
                    <p className="text-gray-500">{d.filedBy} · {formatIn(d.dateOfReceiving)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            id="linked"
            title="Linked / tagged matters"
            icon={<ExternalLink size={14} />}
            open={openSections.linked}
            onToggle={() => toggle('linked')}
            count={asArray(court.linkCases).length + asArray(court.taggedMatters).length}
          >
            {asArray(court.linkCases).length > 0 && (
              <ul className="text-xs space-y-1 mb-2">
                {asArray(court.linkCases).map((l, i) => (
                  <li key={i}>
                    {l?.caseNumber} · {l?.filingNumber}
                  </li>
                ))}
              </ul>
            )}
            {asArray(court.taggedMatters).length > 0 && (
              <ul className="text-xs space-y-1">
                {asArray(court.taggedMatters).map((t, i) => (
                  <li key={i}>
                    [{t?.type}] {t?.caseNumber} — {t?.status}
                  </li>
                ))}
              </ul>
            )}
            {asArray(court.linkCases).length === 0 && asArray(court.taggedMatters).length === 0 && (
              <p className="text-xs text-gray-500">None listed.</p>
            )}
          </Section>

          {court.firDetails && (court.firDetails.policeStation || court.firDetails.caseNumber) && (
            <Section
              id="fir"
              title="FIR details"
              icon={<FileText size={14} />}
              open={openSections.fir}
              onToggle={() => toggle('fir')}
            >
              <p className="text-xs text-gray-700">
                FIR: {court.firDetails.caseNumber || '—'} · PS: {court.firDetails.policeStation || '—'} · Year:{' '}
                {court.firDetails.year || '—'}
              </p>
            </Section>
          )}

          <Card>
            <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Parties & advocates</p>
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div>
                <p className="text-gray-400 mb-0.5">Petitioners</p>
                <p className="text-gray-800">{asStringList(court.petitioners).join(', ') || '—'}</p>
                <p className="text-navy-800 mt-1">{asStringList(court.petitionerAdvocates).join(', ') || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Respondents</p>
                <p className="text-gray-800">{asStringList(court.respondents).join(', ') || '—'}</p>
                <p className="text-gray-600 mt-1">{asStringList(court.respondentAdvocates).join(', ') || '—'}</p>
              </div>
              {court.actsAndSections != null && String(court.actsAndSections).trim() !== '' && (
                <div>
                  <p className="text-gray-400 mb-0.5">Acts & sections</p>
                  <p className="text-gray-700">
                    {Array.isArray(court.actsAndSections)
                      ? court.actsAndSections.join(', ')
                      : String(court.actsAndSections)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Section({ title, icon, open, onToggle, children, count }) {
  return (
    <Card padding={false} className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50/80"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-gray-800">
          <span className="text-navy-700">{icon}</span>
          {title}
          {typeof count === 'number' && count > 0 && (
            <span className="text-[10px] font-normal text-gray-400">({count})</span>
          )}
        </span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-0 border-t border-gray-50">{children}</div>}
    </Card>
  );
}
