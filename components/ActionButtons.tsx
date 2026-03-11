import { PetActionType } from '@/lib/pet/types';

interface ActionButtonsProps {
  isSubmitting: boolean;
  onAction: (action: PetActionType) => void;
}

const ACTIONS: Array<{ key: PetActionType; label: string }> = [
  { key: 'feed', label: '喂食' },
  { key: 'play', label: '玩耍' },
  { key: 'clean', label: '清洁' },
  { key: 'sleep', label: '睡觉' },
  { key: 'wake', label: '叫醒' }
];

export function ActionButtons({ isSubmitting, onAction }: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {ACTIONS.map((action) => (
        <button
          key={action.key}
          type="button"
          className="rounded-xl bg-berry px-3 py-2 text-sm font-medium text-white transition hover:bg-berry/90 disabled:cursor-not-allowed disabled:bg-berry/50"
          onClick={() => onAction(action.key)}
          disabled={isSubmitting}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
