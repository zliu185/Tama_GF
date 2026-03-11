import Image from 'next/image';
import { Pet } from '@/lib/pet/types';

interface PetCardProps {
  pet: Pet;
}

function getPetImage(pet: Pet): string {
  if (pet.stage === 'egg') return '/pet/egg.png';
  if (pet.stage === 'baby') return '/pet/baby.png';
  if (pet.mood < 40 || pet.health < 40) return '/pet/sad.png';
  return '/pet/happy.png';
}

function stageLabel(stage: Pet['stage']): string {
  switch (stage) {
    case 'egg':
      return 'Egg';
    case 'baby':
      return 'Baby';
    case 'child':
      return 'Child';
    case 'adult':
      return 'Adult';
    default:
      return stage;
  }
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <div className="rounded-3xl border border-rosemilk bg-white/95 p-5 shadow-soft">
      <div className="relative mx-auto mb-4 h-40 w-40 overflow-hidden rounded-2xl bg-blush">
        <Image src={getPetImage(pet)} alt={pet.name} fill priority className="object-cover" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-plum">{pet.name}</h1>
        <p className="mt-1 text-sm text-plum/70">Stage: {stageLabel(pet.stage)}</p>
      </div>
    </div>
  );
}
