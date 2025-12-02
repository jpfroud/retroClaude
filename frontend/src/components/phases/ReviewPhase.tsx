import { useState } from 'react';
import { ClipboardCheck, UserPlus } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';
import toast from 'react-hot-toast';

interface ReviewPhaseProps {
  retroId: string;
  isFacilitator: boolean;
}

function ReviewPhase({ retroId, isFacilitator }: ReviewPhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);
  const [assigningAction, setAssigningAction] = useState<string | null>(null);

  const actions = retrospective?.actions || [];
  const participants = retrospective?.participants || [];

  const approvedActions = actions.filter((a: any) => a.status === 'approved');

  const handleAssignAction = (actionId: string, userId: string) => {
    if (!isFacilitator) {
      toast.error('Seul le facilitateur peut assigner des actions');
      return;
    }

    socketService.updateAction(retroId, actionId, { assignedToId: userId });
    setAssigningAction(null);
    toast.success('Action assignée');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PhaseHeader
        icon={<ClipboardCheck className="w-8 h-8" />}
        title="Review"
        description="Revoyons les actions et assignons-les aux membres de l'équipe"
        color="purple"
      />

      {!isFacilitator && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            ℹ️ Seul le facilitateur peut assigner les actions
          </p>
        </div>
      )}

      {approvedActions.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune action approuvée
          </h3>
          <p className="text-gray-600">
            Aucune action n'a été approuvée pendant la phase de discussion.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedActions.map((action: any, index: number) => (
            <div key={action.id} className="card">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  {action.description && (
                    <p className="text-gray-600 mb-3">{action.description}</p>
                  )}

                  {action.assignedTo ? (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: action.assignedTo.color }}
                      >
                        {action.assignedTo.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {action.assignedTo.name}
                        </p>
                        <p className="text-sm text-green-600">Assigné</p>
                      </div>
                      {isFacilitator && (
                        <button
                          onClick={() => setAssigningAction(action.id)}
                          className="btn-secondary btn-sm"
                        >
                          Changer
                        </button>
                      )}
                    </div>
                  ) : (
                    isFacilitator && (
                      <button
                        onClick={() => setAssigningAction(action.id)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Assigner</span>
                      </button>
                    )
                  )}

                  {/* Modal d'assignation */}
                  {assigningAction === action.id && isFacilitator && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Assigner à :
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {participants.map((participant: any) => (
                          <button
                            key={participant.id}
                            onClick={() => handleAssignAction(action.id, participant.userId)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white border border-gray-200 transition-colors"
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: participant.user?.color }}
                            >
                              {participant.user?.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {participant.user?.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setAssigningAction(null)}
                        className="btn-secondary btn-sm w-full mt-3"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-8 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          Résumé
        </h3>
        <div className="space-y-1 text-sm text-blue-800">
          <p>
            • Total des actions : <strong>{approvedActions.length}</strong>
          </p>
          <p>
            • Actions assignées : <strong>{approvedActions.filter((a: any) => a.assignedToId).length}</strong>
          </p>
          <p>
            • Actions non assignées : <strong>{approvedActions.filter((a: any) => !a.assignedToId).length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReviewPhase;
