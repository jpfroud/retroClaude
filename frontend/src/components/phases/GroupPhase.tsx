import { useState } from 'react';
import { Layers, Plus, Edit2, Check, X } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';
import toast from 'react-hot-toast';

interface GroupPhaseProps {
  retroId: string;
  userId: string;
  isFacilitator: boolean;
}

function GroupPhase({ retroId, userId, isFacilitator }: GroupPhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupTitle, setEditGroupTitle] = useState('');

  const tickets = retrospective?.tickets || [];
  const ticketGroups = retrospective?.ticketGroups || [];
  const columns = retrospective?.columns || [];
  const config = retrospective?.config || {};

  const facilitatorOnly = config.facilitatorOnly;
  const canGroup = !facilitatorOnly || isFacilitator;

  const ungroupedTickets = tickets.filter((t: any) => !t.groupId && t.isRevealed);

  const handleCreateGroup = () => {
    if (!canGroup) {
      toast.error('Seul le facilitateur peut créer des groupes');
      return;
    }

    socketService.createGroup(retroId, newGroupTitle || undefined);
    setNewGroupTitle('');
  };

  const handleAddToGroup = (groupId: string, ticketIds: string[]) => {
    if (!canGroup) {
      toast.error('Seul le facilitateur peut grouper les tickets');
      return;
    }

    socketService.groupTickets(retroId, ticketIds, groupId);
    setSelectedTickets([]);
    toast.success('Tickets groupés');
  };

  const handleToggleTicketSelection = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleGroupSelected = (groupId: string) => {
    if (selectedTickets.length === 0) {
      toast.error('Sélectionnez au moins un ticket');
      return;
    }
    handleAddToGroup(groupId, selectedTickets);
  };

  const getColumnColor = (columnId: string) => {
    const column = columns.find((c: any) => c.id === columnId);
    return column?.color || '#3b82f6';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PhaseHeader
        icon={<Layers className="w-8 h-8" />}
        title="Groupement"
        description="Regroupez les tickets similaires ensemble"
        color="purple"
      />

      {!canGroup && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800">
            ⚠️ Seul le facilitateur peut grouper les tickets dans cette session
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ungrouped tickets */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Tickets non groupés ({ungroupedTickets.length})
              </h3>
              {selectedTickets.length > 0 && (
                <span className="text-sm text-primary-600 font-medium">
                  {selectedTickets.length} sélectionné{selectedTickets.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {ungroupedTickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  onClick={() => canGroup && handleToggleTicketSelection(ticket.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTickets.includes(ticket.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${canGroup ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  <div className="flex items-start space-x-2">
                    <div
                      className="w-1 h-full rounded-full flex-shrink-0"
                      style={{ backgroundColor: getColumnColor(ticket.columnId) }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{ticket.content}</p>
                      {ticket.author && (
                        <p className="text-xs text-gray-500 mt-1">
                          {ticket.author.name}
                        </p>
                      )}
                    </div>
                    {selectedTickets.includes(ticket.id) && (
                      <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {ungroupedTickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tous les tickets ont été groupés
              </div>
            )}
          </div>
        </div>

        {/* Groups */}
        <div className="space-y-4">
          {/* Create new group */}
          {canGroup && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Créer un groupe
              </h3>
              <input
                type="text"
                className="input mb-2"
                placeholder="Titre du groupe (optionnel)"
                value={newGroupTitle}
                onChange={(e) => setNewGroupTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateGroup();
                  }
                }}
              />
              <button
                onClick={handleCreateGroup}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Créer</span>
              </button>
            </div>
          )}

          {/* Existing groups */}
          <div className="space-y-3">
            {ticketGroups.map((group: any) => (
              <div key={group.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  {editingGroup === group.id ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        className="input text-sm flex-1"
                        value={editGroupTitle}
                        onChange={(e) => setEditGroupTitle(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          // TODO: Update group title
                          setEditingGroup(null);
                        }}
                        className="btn-primary btn-sm p-1"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingGroup(null)}
                        className="btn-secondary btn-sm p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-semibold text-gray-900">
                        {group.title || `Groupe ${ticketGroups.indexOf(group) + 1}`}
                      </h4>
                      {canGroup && (
                        <button
                          onClick={() => {
                            setEditingGroup(group.id);
                            setEditGroupTitle(group.title || '');
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  {group.tickets?.length || 0} ticket{(group.tickets?.length || 0) > 1 ? 's' : ''}
                </div>

                <div className="space-y-2">
                  {group.tickets?.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="p-2 bg-gray-50 rounded text-sm text-gray-700"
                    >
                      {ticket.content}
                    </div>
                  ))}
                </div>

                {canGroup && selectedTickets.length > 0 && (
                  <button
                    onClick={() => handleGroupSelected(group.id)}
                    className="btn-outline btn-sm w-full mt-3"
                  >
                    Ajouter la sélection
                  </button>
                )}
              </div>
            ))}
          </div>

          {ticketGroups.length === 0 && (
            <div className="card text-center py-8">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun groupe créé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupPhase;
