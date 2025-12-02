import { Users, Check } from 'lucide-react';

interface Participant {
  id: string;
  userId: string;
  role: string;
  isReady: boolean;
  user?: {
    id: string;
    name: string;
    color: string;
  };
}

interface ParticipantsListProps {
  participants: Participant[];
  showReady?: boolean;
}

function ParticipantsList({ participants, showReady = false }: ParticipantsListProps) {
  const readyCount = participants.filter((p) => p.isReady).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">
            Participants ({participants.length})
          </span>
        </div>
        {showReady && (
          <span className="text-sm text-gray-600">
            {readyCount}/{participants.length} prêts
          </span>
        )}
      </div>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: participant.user?.color }}
              >
                {participant.user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {participant.user?.name}
                </p>
                {participant.role === 'facilitator' && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    Facilitateur
                  </span>
                )}
              </div>
            </div>

            {showReady && participant.isReady && (
              <div className="flex items-center space-x-1 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Prêt</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParticipantsList;
