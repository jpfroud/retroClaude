import { ChevronRight } from 'lucide-react';
import { socketService } from '../../services/socket.service';

interface PhaseNavigationProps {
  retroId: string;
  currentPhase: string;
  isFacilitator: boolean;
}

const PHASES = [
  { id: 'setup', name: 'Configuration' },
  { id: 'icebreaker', name: 'Icebreaker' },
  { id: 'welcome', name: 'Welcome' },
  { id: 'review-actions', name: 'Revue Actions' },
  { id: 'brainstorm', name: 'Brainstorm' },
  { id: 'group', name: 'Groupement' },
  { id: 'vote', name: 'Vote' },
  { id: 'discuss', name: 'Discussion' },
  { id: 'review', name: 'Review' },
  { id: 'closing', name: 'Clôture' },
];

function PhaseNavigation({ retroId, currentPhase, isFacilitator }: PhaseNavigationProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const nextPhase = PHASES[currentIndex + 1];
  const prevPhase = PHASES[currentIndex - 1];

  if (!isFacilitator) {
    return null;
  }

  const handleChangePhase = (phaseId: string) => {
    socketService.changePhase(retroId, phaseId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Navigation des phases</p>
          <div className="flex items-center space-x-2">
            {prevPhase && (
              <button
                onClick={() => handleChangePhase(prevPhase.id)}
                className="btn-secondary text-sm"
              >
                ← {prevPhase.name}
              </button>
            )}
            <span className="font-semibold text-gray-900">
              {PHASES[currentIndex]?.name}
            </span>
            {nextPhase && (
              <button
                onClick={() => handleChangePhase(nextPhase.id)}
                className="btn-primary text-sm flex items-center space-x-1"
              >
                <span>{nextPhase.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Phase {currentIndex + 1} / {PHASES.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / PHASES.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

export default PhaseNavigation;
