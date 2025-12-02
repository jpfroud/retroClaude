import { useState } from 'react';
import { Heart, Frown, Meh, Smile, Laugh } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';

interface WelcomePhaseProps {
  retroId: string;
  userId: string;
}

const RATING_OPTIONS = [
  { value: 1, icon: Frown, label: 'Très mal', color: '#ef4444' },
  { value: 2, icon: Meh, label: 'Mal', color: '#f59e0b' },
  { value: 3, icon: Smile, label: 'Correct', color: '#eab308' },
  { value: 4, icon: Laugh, label: 'Bien', color: '#84cc16' },
  { value: 5, icon: Heart, label: 'Excellent', color: '#10b981' },
];

function WelcomePhase({ retroId, userId }: WelcomePhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);

  const question = retrospective?.config?.welcomeQuestion ||
    'Comment s\'est passée l\'itération ?';

  const votes = retrospective?.welcomeVotes || [];
  const userVote = votes.find((v: any) => v.userId === userId);

  const handleVote = (rating: number) => {
    socketService.submitWelcomeVote(retroId, userId, rating);
  };

  // Calculer la moyenne
  const average = votes.length > 0
    ? votes.reduce((acc: number, v: any) => acc + v.rating, 0) / votes.length
    : 0;

  // Compter les votes par rating
  const voteCounts = RATING_OPTIONS.map((option) => ({
    ...option,
    count: votes.filter((v: any) => v.rating === option.value).length,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <PhaseHeader
        icon={<Heart className="w-8 h-8" />}
        title="Welcome"
        description="Donnons notre ressenti sur l'itération"
        color="green"
      />

      <div className="card mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            {question}
          </h3>
        </div>

        {!userVote ? (
          <div>
            <p className="text-gray-600 mb-4 text-center">
              Choisissez votre note :
            </p>
            <div className="flex justify-center space-x-4">
              {RATING_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleVote(option.value)}
                    className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Icon
                      className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform"
                      style={{ color: option.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800">
              ✓ Vote enregistré : <strong>{RATING_OPTIONS.find((o) => o.value === userVote.rating)?.label}</strong>
            </p>
          </div>
        )}
      </div>

      {votes.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Résultats ({votes.length} votes)
          </h3>

          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-gray-900">
                {average.toFixed(1)} / 5
              </div>
              <p className="text-gray-600">Moyenne</p>
            </div>

            <div className="space-y-3">
              {voteCounts.map((option) => {
                const Icon = option.icon;
                const percentage = votes.length > 0
                  ? (option.count / votes.length) * 100
                  : 0;

                return (
                  <div key={option.value} className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 flex-shrink-0" style={{ color: option.color }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {option.label}
                        </span>
                        <span className="text-sm text-gray-600">
                          {option.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: option.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomePhase;
