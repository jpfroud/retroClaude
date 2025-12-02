import { useState } from 'react';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { retroApi } from '../../services/api.service';
import { useRetroStore } from '../../store/useRetroStore';
import toast from 'react-hot-toast';

interface ReviewActionsPhaseProps {
  retroId: string;
  isFacilitator: boolean;
}

function ReviewActionsPhase({ retroId, isFacilitator }: ReviewActionsPhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);
  const setRetrospective = useRetroStore((state) => state.setRetrospective);

  const actionItems = retrospective?.actionItems || [];

  const handleToggleAction = async (actionId: string, isDone: boolean) => {
    if (!isFacilitator) {
      toast.error('Seul le facilitateur peut marquer les actions');
      return;
    }

    try {
      await retroApi.updateActionItem(actionId, { isDone });

      // Mettre à jour localement
      if (retrospective) {
        const updatedItems = actionItems.map((item: any) =>
          item.id === actionId ? { ...item, isDone } : item
        );
        setRetrospective({
          ...retrospective,
          actionItems: updatedItems,
        });
      }

      toast.success(isDone ? 'Action marquée comme terminée' : 'Action réouverte');
    } catch (error) {
      console.error('Error updating action:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const completedCount = actionItems.filter((a: any) => a.isDone).length;

  return (
    <div className="max-w-4xl mx-auto">
      <PhaseHeader
        icon={<ListChecks className="w-8 h-8" />}
        title="Revue des Actions"
        description="Passons en revue les actions des rétrospectives précédentes"
        color="blue"
      />

      {actionItems.length === 0 ? (
        <div className="card text-center py-12">
          <ListChecks className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune action à revoir
          </h3>
          <p className="text-gray-600">
            Il n'y a pas d'actions des rétrospectives précédentes à revoir.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Actions à revoir ({actionItems.length})
            </h3>
            <div className="text-sm text-gray-600">
              {completedCount} / {actionItems.length} complétées
            </div>
          </div>

          <div className="space-y-3">
            {actionItems.map((action: any) => (
              <div
                key={action.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  action.isDone
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleToggleAction(action.id, !action.isDone)}
                    disabled={!isFacilitator}
                    className={`mt-1 flex-shrink-0 ${
                      isFacilitator ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    {action.isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h4
                      className={`font-semibold mb-1 ${
                        action.isDone
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {action.title}
                    </h4>
                    {action.description && (
                      <p
                        className={`text-sm mb-2 ${
                          action.isDone ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {action.description}
                      </p>
                    )}
                    {action.assignedTo && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Assigné à : {action.assignedTo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isFacilitator && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Seul le facilitateur peut marquer les actions comme complétées
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewActionsPhase;
