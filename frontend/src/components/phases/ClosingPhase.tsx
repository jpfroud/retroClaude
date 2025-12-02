import { Star, TrendingUp } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';

interface ClosingPhaseProps {
  retroId: string;
  userId: string;
}

const ROTI_OPTIONS = [
  { value: 1, label: '1 - Temps perdu', color: '#ef4444', emoji: '😞' },
  { value: 2, label: '2 - Pas terrible', color: '#f59e0b', emoji: '😕' },
  { value: 3, label: '3 - Correct', color: '#eab308', emoji: '😐' },
  { value: 4, label: '4 - Bien', color: '#84cc16', emoji: '🙂' },
  { value: 5, label: '5 - Excellent !', color: '#10b981', emoji: '😃' },
];

function ClosingPhase({ retroId, userId }: ClosingPhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);

  const rotiVotes = retrospective?.rotiVotes || [];
  const actions = retrospective?.actions || [];
  const userVote = rotiVotes.find((v: any) => v.userId === userId);

  const handleVote = (rating: number) => {
    socketService.submitROTIVote(retroId, userId, rating);
  };

  // Calculer la moyenne
  const average = rotiVotes.length > 0
    ? rotiVotes.reduce((acc: number, v: any) => acc + v.rating, 0) / rotiVotes.length
    : 0;

  // Compter les votes par rating
  const voteCounts = ROTI_OPTIONS.map((option) => ({
    ...option,
    count: rotiVotes.filter((v: any) => v.rating === option.value).length,
  }));

  const approvedActions = actions.filter((a: any) => a.status === 'approved');
  const assignedActions = approvedActions.filter((a: any) => a.assignedToId);

  return (
    <div className="max-w-4xl mx-auto">
      <PhaseHeader
        icon={<Star className="w-8 h-8" />}
        title="Clôture - ROTI"
        description="Return On Time Invested - Cette rétrospective était-elle utile ?"
        color="orange"
      />

      {/* Résumé de la rétro */}
      <div className="card mb-6 bg-gradient-to-r from-primary-50 to-purple-50">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary-600" />
          Résumé de la rétrospective
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {retrospective?.tickets?.filter((t: any) => t.isRevealed).length || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Tickets créés</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {approvedActions.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Actions définies</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {assignedActions.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Actions assignées</p>
          </div>
        </div>

        {approvedActions.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Actions à réaliser :</h4>
            <ul className="space-y-2">
              {approvedActions.slice(0, 5).map((action: any) => (
                <li key={action.id} className="flex items-start space-x-2 text-sm">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <div className="flex-1">
                    <span className="text-gray-900">{action.title}</span>
                    {action.assignedTo && (
                      <span className="text-gray-500 ml-2">
                        ({action.assignedTo.name})
                      </span>
                    )}
                  </div>
                </li>
              ))}
              {approvedActions.length > 5 && (
                <li className="text-sm text-gray-500 italic">
                  Et {approvedActions.length - 5} action{approvedActions.length - 5 > 1 ? 's' : ''} de plus...
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ROTI Vote */}
      <div className="card mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Votez pour le ROTI
        </h3>
        <p className="text-gray-600 mb-6">
          Sur une échelle de 1 à 5, cette rétrospective était-elle un bon investissement de votre temps ?
        </p>

        {!userVote ? (
          <div className="space-y-3">
            {ROTI_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleVote(option.value)}
                className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all text-left flex items-center space-x-4 group hover:shadow-md"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: option.color }}
                >
                  {option.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{option.label}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-3">
              {ROTI_OPTIONS.find((o) => o.value === userVote.rating)?.emoji}
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Merci pour votre feedback !
            </p>
            <p className="text-green-800">
              Vous avez voté : <strong>{ROTI_OPTIONS.find((o) => o.value === userVote.rating)?.label}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Résultats ROTI */}
      {rotiVotes.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Résultats ROTI ({rotiVotes.length} votes)
          </h3>

          <div className="mb-6 text-center">
            <div className="inline-block p-6 bg-primary-50 rounded-lg">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {average.toFixed(1)}
              </div>
              <p className="text-gray-600">Note moyenne / 5</p>
            </div>
          </div>

          <div className="space-y-3">
            {voteCounts.reverse().map((option) => {
              const percentage = rotiVotes.length > 0
                ? (option.count / rotiVotes.length) * 100
                : 0;

              return (
                <div key={option.value} className="flex items-center space-x-3">
                  <div className="text-2xl">{option.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {option.value} - {option.label.split(' - ')[1]}
                      </span>
                      <span className="text-sm text-gray-600">
                        {option.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-300"
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
      )}

      {/* Message de fin */}
      <div className="mt-8 text-center p-6 bg-gradient-to-r from-primary-100 to-purple-100 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Merci pour votre participation ! 🎉
        </h3>
        <p className="text-gray-700">
          Cette rétrospective est maintenant terminée. À la prochaine !
        </p>
      </div>
    </div>
  );
}

export default ClosingPhase;
