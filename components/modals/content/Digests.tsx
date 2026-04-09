'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, AlertCircle, Trash2, BarChart3, RefreshCw } from 'lucide-react';
import { useUserContext } from '@/components/providers/AuthProvider';
import { useDelete } from '@/components/providers/DeleteProvider';
import { useDigest } from '@/components/providers/DigestProvider';
import { parseErrorDetail } from '@/lib/api';
import type { DigestResponse } from '@/components/providers/DigestProvider';
import { formatDigestDate } from '@/lib/dateUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface DigestsContentProps {
  onOpenReview?: () => void;
}

export default function DigestsContent({ onOpenReview }: DigestsContentProps) {
  const { user } = useUserContext();
  const { requestDelete } = useDelete();
  const { loadDigestForReview, digestListVersion } = useDigest();

  const [digests, setDigests] = useState<DigestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchDigests = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setFetchError('You must be logged in to view digests.');
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`${API_URL}/v1/digest/list/${user.id}`);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setFetchError(parseErrorDetail(body, `Failed to load digests (${response.status})`));
        setDigests([]);
        return;
      }
      const data = await response.json();
      setDigests(data.digests ?? []);
    } catch {
      setFetchError('Unable to reach the server. Please check your connection.');
      setDigests([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDigests();
  }, [fetchDigests, digestListVersion]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === digests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(digests.map((d) => d.id)));
    }
  }, [digests, selectedIds.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    requestDelete([...selectedIds], 'digest');
    setSelectedIds(new Set());
  }, [selectedIds, requestDelete]);

  const handleReview = useCallback(async () => {
    if (selectedIds.size !== 1 || !user?.id) return;
    const digestId = [...selectedIds][0];
    await loadDigestForReview(user.id, digestId);
    onOpenReview?.();
  }, [selectedIds, user?.id, loadDigestForReview, onOpenReview]);

  const allSelected = digests.length > 0 && selectedIds.size === digests.length;
  const selectedDigest = selectedIds.size === 1 ? digests.find((d) => d.id === [...selectedIds][0]) ?? null : null;
  const canReview = selectedDigest?.status === 'completed';

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5" style={{ color: 'var(--dark-orange)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--black)' }}>
          Digests
        </h2>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12" style={{ color: 'var(--dark-gray)' }}>
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading digests…</span>
        </div>
      )}

      {fetchError && !loading && (
        <div
          className="flex items-center gap-2 p-4 rounded border-2"
          style={{
            backgroundColor: 'var(--white)',
            borderColor: 'var(--red)',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--red)' }} />
          <p className="text-sm" style={{ color: 'var(--black)' }}>{fetchError}</p>
        </div>
      )}

      {!loading && !fetchError && (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
              type="button"
              onClick={handleDelete}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: 'var(--rainbow-red)',
                color: 'var(--white)',
                border: '1px ridge var(--dark-gray)',
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <button
              type="button"
              onClick={fetchDigests}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: 'var(--cream)',
                color: 'var(--black)',
                border: '1px ridge var(--dark-gray)',
              }}
              aria-label="Refresh digest list"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>

            <button
              type="button"
              onClick={handleReview}
              disabled={!canReview}
              className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: 'var(--dark-blue)',
                color: 'var(--white)',
                border: '1px ridge var(--dark-gray)',
              }}
            >
              <BarChart3 className="w-4 h-4" />
              Review
            </button>
          </div>

          <div
            className="overflow-auto border-2 rounded"
            style={{
              backgroundColor: 'var(--white)',
              borderColor: 'var(--dark-gray)',
              borderStyle: 'ridge',
              maxHeight: 'calc(90vh - 14rem)',
            }}
          >
            {digests.length === 0 ? (
              <p className="p-4 text-sm" style={{ color: 'var(--dark-gray)' }}>
                No digests yet. Create one from <strong>New Digest</strong>.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--dark-blue)', color: 'var(--white)' }}>
                  <th className="w-10 px-2 py-2 border border-black">
                      <div className="flex items-center justify-center min-h-[1.5rem]">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all"
                          className="cursor-pointer checkbox-app"
                        />
                      </div>
                    </th>
                    <th className="text-left px-3 py-2 border border-black font-bold">NAME</th>
                    <th className="text-left px-3 py-2 border border-black font-bold whitespace-nowrap">CREATED AT</th>
                    <th className="text-left px-3 py-2 border border-black font-bold">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {digests.map((d, index) => (
                    <tr
                      key={d.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'var(--cream)' : 'var(--white)',
                      }}
                    >
                      <td className="px-2 py-1.5 border border-gray-400">
                        <div className="flex items-center justify-center min-h-[1.5rem]">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(d.id)}
                            onChange={() => toggleSelect(d.id)}
                            aria-label={`Select ${d.protein_name ?? d.id}`}
                            className="cursor-pointer checkbox-app"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>
                        {d.protein_name ?? '—'}
                      </td>
                      <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>
                        {formatDigestDate(d.created_at, 'display')}
                      </td>
                      <td className="px-3 py-1.5 border border-gray-400" style={{ color: 'var(--black)' }}>
                        {d.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}