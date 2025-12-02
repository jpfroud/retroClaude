import { useState } from 'react';
import { MessageSquare, Plus, Check } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';
import toast from 'react-hot-toast';

interface DiscussPhaseProps {
  retroId: string;
  userId: string;
  isFacilitator: boolean;
}

function DiscussPhase({ retroId, userId, isFacilitator }: DiscussPhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);
  const [actionForms, setActionForms] = useState<{ [key: string]: { title: string; description: string } }>({});

  const config = retrospective?.config || {};
  const voteConfig = config.voteConfig || {};
  const discussConfig = config.discussConfig || { discussMode: 'topN', topN: 5, anyoneCanPropose: true };
  const tickets = retrospective?.tickets || [];
  const ticketGroups = retrospective?.ticketGroups || [];
  const votes = retrospective?.votes || [];
  const actions = retrospective?.actions || [];

  const voteOnGroups = voteConfig.voteOnGroups !== false;
  const anyoneCanPropose = discussConfig.anyoneCanPropose !== false;
  const canProposeActions = anyoneCanPropose || isFacilitator;

  // Calculer le nombre de votes par item
  const getVoteCount = (itemId: string, isGroup: boolean) => {
    return votes.filter((v: any) =>
      isGroup ? v.groupId === itemId : v.ticketId === itemId
    ).length;
  };

  // Obtenir les items à discuter
  const getDiscussItems = () => {
    if (voteOnGroups) {
      return ticketGroups
        .map((group: any, index: number) => ({
          ...group,
          voteCount: getVoteCount(group.id, true),
          type: 'group',
          displayTitle: group.title || `Groupe ${index + 1}`,
        }))
        .sort((a, b) => b.voteCount - a.voteCount)
        .filter((item) => {
          if (discussConfig.discussMode === 'topN') {
            return ticketGroups.indexOf(item) < (discussConfig.topN || 5);
          }
          if (discussConfig.discussMode === 'voted') {
            return item.voteCount > 0;
          }
          return true; // 'all'
        });
    } else {
      return tickets
        .filter((t: any) => t.isRevealed && !t.groupId)
        .map((ticket: any) => ({
          ...ticket,
          voteCount: getVoteCount(ticket.id, false),
          type: 'ticket',
          displayTitle: ticket.content,
        }))
        .sort((a, b) => b.voteCount - a.voteCount)
        .filter((item) => {
          if (discussConfig.discussMode === 'topN') {
            return tickets.indexOf(item) < (discussConfig.topN || 5);
          }
          if (discussConfig.discussMode === 'voted') {
            return item.voteCount > 0;
          }
          return true;
        });
    }
  };

  const discussItems = getDiscussItems();

  const handleCreateAction = (itemId: string) => {
    const form = actionForms[itemId];
    if (!form || !form.title.trim()) {
      toast.error('Veuillez entrer un titre pour l\'action');
      return;
    }

    if (!canProposeActions) {
      toast.error('Seul le facilitateur peut proposer des actions');
      return;
    }

    socketService.createAction(retroId, {
      title: form.title,
      description: form.description,
      ticketId: itemId,
      status: 'proposed',
    });

    setActionForms({ ...actionForms, [itemId]: { title: '', description: '' } });
    toast.success('Action proposée');
  };

  const handleApproveAction = (actionId: string) => {
    if (!isFacilitator) {
      toast.error('Seul le facilitateur peut approuver les actions');
      return;
    }

    socketService.updateAction(retroId, actionId, { status: 'approved' });
    toast.success('Action approuvée');
  };

  const getItemActions = (itemId: string) => {
    return actions.filter((a: any) => a.ticketId === itemId);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PhaseHeader
        icon={<MessageSquare className="w-8 h-8" />}
        title="Discussion"
        description="Discutons des sujets les plus votés et définissons des actions"
        color="green"
      />

      {!canProposeActions && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800">
            ⚠️ Seul le facilitateur peut proposer des actions dans cette session
          </p>
        </div>
      )}

      <div className="space-y-6">
        {discussItems.map((item: any, index: number) => {
          const itemActions = getItemActions(item.id);
          const itemForm = actionForms[item.id] || { title: '', description: '' };

          return (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-3xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.displayTitle}
                    </h3>
                  </div>
                  {item.type === 'group' && (
                    <div className="ml-12 space-y-1">
                      {item.tickets?.slice(0, 3).map((ticket: any) => (
                        <p key={ticket.id} className="text-sm text-gray-600">
                          • {ticket.content}
                        </p>
                      ))}
                      {item.tickets?.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          Et {item.tickets.length - 3} ticket{item.tickets.length - 3 > 1 ? 's' : ''} de plus...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">
                    {item.voteCount}
                  </div>
                  <p className="text-sm text-gray-600">votes</p>
                </div>
              </div>

              {/* Actions existantes */}
              {itemActions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Actions proposées ({itemActions.length})
                  </h4>
                  <div className="space-y-2">
                    {itemActions.map((action: any) => (
                      <div
                        key={action.id}
                        className={`p-3 rounded-lg border ${
                          action.status === 'approved'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{action.title}</p>
                            {action.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {action.description}
                              </p>
                            )}
                          </div>
                          {action.status === 'proposed' && isFacilitator && (
                            <button
                              onClick={() => handleApproveAction(action.id)}
                              className="btn-primary btn-sm ml-3 flex items-center space-x-1"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approuver</span>
                            </button>
                          )}
                          {action.status === 'approved' && (
                            <span className="text-green-600 font-medium text-sm ml-3">
                              ✓ Approuvée
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulaire nouvelle action */}
              {canProposeActions && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Proposer une action
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="input"
                      placeholder="Titre de l'action *"
                      value={itemForm.title}
                      onChange={(e) =>
                        setActionForms({
                          ...actionForms,
                          [item.id]: { ...itemForm, title: e.target.value },
                        })
                      }
                    />
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Description (optionnel)"
                      value={itemForm.description}
                      onChange={(e) =>
                        setActionForms({
                          ...actionForms,
                          [item.id]: { ...itemForm, description: e.target.value },
                        })
                      }
                    />
                    <button
                      onClick={() => handleCreateAction(item.id)}
                      disabled={!itemForm.title.trim()}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Proposer cette action</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {discussItems.length === 0 && (
          <div className="card text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun sujet à discuter
            </h3>
            <p className="text-gray-600">
              Aucun ticket ou groupe n'a été voté.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscussPhase;
