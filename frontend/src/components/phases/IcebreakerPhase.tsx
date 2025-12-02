import { useState } from 'react';
import { Smile, Send } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';

interface IcebreakerPhaseProps {
  retroId: string;
  userId: string;
}

function IcebreakerPhase({ retroId, userId }: IcebreakerPhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);
  const [response, setResponse] = useState('');

  const question = retrospective?.config?.icebreakerQuestion ||
    'Quelle est votre glace préférée ?';

  const responses = retrospective?.icebreakers || [];
  const userResponse = responses.find((r: any) => r.userId === userId);

  const handleSubmit = () => {
    if (response.trim()) {
      socketService.submitIcebreaker(retroId, userId, response);
      setResponse('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PhaseHeader
        icon={<Smile className="w-8 h-8" />}
        title="Icebreaker"
        description="Brisons la glace avec une question rigolote !"
        color="purple"
      />

      <div className="card mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-purple-900 mb-2">
            Question :
          </h3>
          <p className="text-lg text-purple-700">{question}</p>
        </div>

        {!userResponse ? (
          <div className="space-y-4">
            <label className="label">Votre réponse</label>
            <textarea
              className="input"
              rows={3}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Entrez votre réponse..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!response.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Envoyer</span>
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              ✓ Votre réponse a été enregistrée : <strong>{userResponse.response}</strong>
            </p>
          </div>
        )}
      </div>

      {responses.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Réponses des participants ({responses.length})
          </h3>
          <div className="space-y-3">
            {responses.map((resp: any) => (
              <div
                key={resp.id}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: resp.user?.color }}
                >
                  {resp.user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{resp.user?.name}</p>
                  <p className="text-gray-700 mt-1">{resp.response}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default IcebreakerPhase;
