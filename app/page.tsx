'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionButtons } from '@/components/ActionButtons';
import { DialogueBubble } from '@/components/DialogueBubble';
import { PetCard } from '@/components/PetCard';
import { StatusBars } from '@/components/StatusBars';
import { Pet, PetActionType } from '@/lib/pet/types';

interface PetPayload {
  pet: Pet;
  dialogue: string;
  note?: string;
  error?: string;
}

export default function HomePage() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [dialogue, setDialogue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testNow] = useState<Date>(() => new Date());

  const buildApiUrl = useCallback((path: string, now: Date) => {
    return `${path}?now=${encodeURIComponent(now.toISOString())}`;
  }, []);

  const fetchState = useCallback(
    async (now: Date) => {
      setStatus('loading');
      setMessage('正在唤醒 Mochi...');
      try {
        const response = await fetch(buildApiUrl('/api/pet/state', now), { cache: 'no-store' });
        const payload = (await response.json()) as PetPayload;
        if (!response.ok || !payload.pet) {
          throw new Error(payload.error ?? '拉取宠物状态失败');
        }
        setPet(payload.pet);
        setDialogue(payload.dialogue);
        setStatus('success');
        setMessage('');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '未知错误');
      }
    },
    [buildApiUrl]
  );

  useEffect(() => {
    void fetchState(testNow);
  }, [fetchState, testNow]);

  const runAction = useCallback(
    async (action: PetActionType) => {
      setIsSubmitting(true);
      setStatus('loading');
      try {
        const response = await fetch(buildApiUrl(`/api/pet/${action}`, testNow), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const payload = (await response.json()) as PetPayload;
        if (!response.ok || !payload.pet) {
          throw new Error(payload.error ?? `${action} 动作失败`);
        }
        setPet(payload.pet);
        setDialogue(payload.dialogue);
        setStatus('success');
        setMessage(payload.note ?? '照顾成功');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '请求失败');
      } finally {
        setIsSubmitting(false);
      }
    },
    [buildApiUrl, testNow]
  );

  const stats = useMemo(() => {
    if (!pet) return [];
    return [
      { label: 'Hunger', value: pet.hunger },
      { label: 'Mood', value: pet.mood },
      { label: 'Energy', value: pet.energy },
      { label: 'Cleanliness', value: pet.cleanliness },
      { label: 'Health', value: pet.health }
    ];
  }, [pet]);

  const displayTime = useMemo(() => {
    return testNow.toLocaleString('zh-CN', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [testNow]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8">
      <section className="w-full space-y-4 rounded-3xl border border-rosemilk bg-white/80 p-4 shadow-soft sm:p-6">
        <div className="rounded-2xl border border-rosemilk bg-white/90 px-4 py-3 shadow-soft">
          <p className="text-xs text-plum/70">当前时间</p>
          <p className="mt-1 text-base font-medium text-plum">{displayTime}</p>
        </div>

        {pet ? <PetCard pet={pet} /> : <div className="rounded-2xl bg-white p-6 text-center">加载中...</div>}

        <DialogueBubble text={dialogue || '今天也要一起照顾 Mochi。'} />

        {pet && <StatusBars stats={stats} />}

        <ActionButtons isSubmitting={isSubmitting} onAction={runAction} />

        {status === 'loading' && <p className="text-sm text-plum/70">处理中...</p>}
        {status === 'error' && <p className="text-sm text-red-500">{message}</p>}
        {status === 'success' && message && <p className="text-sm text-emerald-600">{message}</p>}
      </section>
    </main>
  );
}
