'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

interface EasterEggPayload {
  message?: string;
  error?: string;
}

const DAILY_DIALOGUES = {
  happy: ['今天的我元气满满，想和你贴贴。', '有你在身边，我今天超开心。', '心情很好，我们一起玩吧！'],
  hungry: ['肚子咕咕叫了，想吃点好吃的。', '我有点饿了，能喂我吗？', '闻到香香的味道了吗，我饿啦。'],
  sleepy: ['眼皮有点重，想靠着你休息。', '今天有点困，抱抱我吧。', '呼噜呼噜，我想睡一会儿。'],
  normal: ['今天也想和你一起度过。', '你来看我啦，我很安心。', '我在这里等你，一起慢慢长大。']
} as const;

type DialogueMood = keyof typeof DAILY_DIALOGUES;

function resolveDialogueMood(pet: Pet): DialogueMood {
  if (pet.hunger <= 30) return 'hungry';
  if (pet.energy <= 30 || pet.is_sleeping) return 'sleepy';
  if (pet.mood >= 70) return 'happy';
  return 'normal';
}

function pickDailyDialogue(pet: Pet, now: Date): string {
  const mood = resolveDialogueMood(pet);
  const messages = DAILY_DIALOGUES[mood];
  const dateKey = now.toISOString().slice(0, 10);
  const seedText = `${pet.id}-${dateKey}`;

  let hash = 0;
  for (let index = 0; index < seedText.length; index += 1) {
    hash = (hash * 31 + seedText.charCodeAt(index)) >>> 0;
  }

  return messages[hash % messages.length];
}

export default function HomePage() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [dialogue, setDialogue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testNow] = useState<Date>(() => new Date());
  const [imageTapCount, setImageTapCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggMessage, setEasterEggMessage] = useState('宝宝我爱你 - ZL');
  const tapResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildApiUrl = useCallback((path: string, now: Date) => {
    return `${path}?now=${encodeURIComponent(now.toISOString())}`;
  }, []);

  const showLoveMessage = useCallback(async () => {
    try {
      const response = await fetch('/api/pet/easter-egg-message', { cache: 'no-store' });
      const payload = (await response.json()) as EasterEggPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? '获取彩蛋文案失败');
      }
      setEasterEggMessage(payload.message?.trim() ? payload.message : '宝宝我爱你 - ZL');
    } catch {
      setEasterEggMessage('宝宝我爱你 - ZL');
    }

    setShowEasterEgg(true);
  }, []);

  const onPetImageClick = useCallback(() => {
    if (tapResetTimerRef.current) {
      clearTimeout(tapResetTimerRef.current);
    }

    setImageTapCount((previous) => {
      const next = previous + 1;
      if (next >= 5) {
        void showLoveMessage();
        return 0;
      }
      return next;
    });

    tapResetTimerRef.current = setTimeout(() => {
      setImageTapCount(0);
    }, 3000);
  }, [showLoveMessage]);

  useEffect(() => {
    return () => {
      if (tapResetTimerRef.current) {
        clearTimeout(tapResetTimerRef.current);
      }
    };
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
        setDialogue(pickDailyDialogue(payload.pet, now));
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

        {pet ? <PetCard pet={pet} onImageClick={onPetImageClick} /> : <div className="rounded-2xl bg-white p-6 text-center">加载中...</div>}

        <DialogueBubble text={dialogue || '今天也要一起照顾 Mochi。'} />

        {pet && <StatusBars stats={stats} />}

        <ActionButtons isSubmitting={isSubmitting} onAction={runAction} />

        {status === 'loading' && <p className="text-sm text-plum/70">处理中...</p>}
        {status === 'error' && <p className="text-sm text-red-500">{message}</p>}
        {status === 'success' && message && <p className="text-sm text-emerald-600">{message}</p>}

        {showEasterEgg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft">
              <p className="text-lg font-semibold text-plum">{easterEggMessage}</p>
              <button
                type="button"
                className="mt-4 rounded-lg bg-berry px-4 py-2 text-sm font-medium text-white hover:bg-berry/90"
                onClick={() => setShowEasterEgg(false)}
              >
                知道啦
              </button>
            </div>
          </div>
        )}

        {imageTapCount > 0 && (
          <p className="text-xs text-plum/50">彩蛋进度：{imageTapCount}/5</p>
        )}
      </section>
    </main>
  );
}
