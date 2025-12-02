import { useState } from 'react';
import { Lightbulb, Plus, MessageCircle, Smile, Eye, EyeOff, Check } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';
import toast from 'react-hot-toast';

interface BrainstormPhaseProps {
  retroId: string;
  userId: string;
  isFacilitator: boolean;
}

const EMOJI_REACTIONS = ['👍', '👎', '❤️', '🎉', '🤔', '👀'];

function BrainstormPhase({ retroId, userId, isFacilitator }: BrainstormPhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);
  const [newTickets, setNewTickets] = useState<{ [key: string]: string }>({});
  const [commentingTicket, setCommentingTicket] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isReady, setIsReady] = useState(false);

  const columns = retrospective?.columns || [];
  const tickets = retrospective?.tickets || [];
  const config = retrospective?.config || {};
  const participants = retrospective?.participants || [];

  const showAuthor = config.showAuthor !== false && !retrospective?.isAnonymous;
  const revealImmediately = config.revealImmediately !== false;
  const colorMode = config.colorMode || 'by-person';

  const currentParticipant = participants.find((p: any) => p.userId === userId);

  const handleAddTicket = (columnId: string) => {
    const content = newTickets[columnId]?.trim();
    if (!content) return;

    socketService.createTicket(retroId, {
      retrospectiveId: retroId,
      columnId,
      authorId: userId,
      content,
      isRevealed: revealImmediately,
    });

    setNewTickets({ ...newTickets, [columnId]: '' });
    toast.success('Ticket ajouté');
  };

  const handleAddComment = (ticketId: string) => {
    if (!commentText.trim()) return;

    socketService.createComment(retroId, ticketId, userId, commentText);
    setCommentText('');
    setCommentingTicket(null);
    toast.success('Commentaire ajouté');
  };

  const handleAddReaction = (ticketId: string, emoji: string) => {
    socketService.addReaction(retroId, ticketId, emoji);
  };

  const handleToggleReady = () => {
    const newReadyStatus = !isReady;
    setIsReady(newReadyStatus);
    socketService.setParticipantReady(retroId, userId, newReadyStatus);
  };

  const handleRevealAll = () => {
    if (!isFacilitator) return;
    socketService.revealTickets(retroId);
    toast.success('Tous les tickets sont maintenant révélés');
  };

  const getTicketColor = (ticket: any) => {
    if (colorMode === 'by-person') {
      return ticket.author?.color;
    }
    if (colorMode === 'manual' && ticket.color) {
      return ticket.color;
    }
    // by-topic uses column color
    const column = columns.find((c: any) => c.id === ticket.columnId);
    return column?.color;
  };

  const readyCount = participants.filter((p: any) => p.isReady).length;

  return (
    <div className="max-w-7xl mx-auto">
      <PhaseHeader
        icon={<Lightbulb className="w-8 h-8" />}
        title="Brainstorm"
        description="Ajoutez vos idées et observations dans les différentes colonnes"
        color="orange"
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleReady}
            className={`btn ${
              isReady ? 'btn-primary' : 'btn-outline'
            } flex items-center space-x-2`}
          >
            {isReady && <Check className="w-4 h-4" />}
            <span>{isReady ? 'Je suis prêt' : 'Je suis terminé'}</span>
          </button>
          <span className="text-sm text-gray-600">
            {readyCount} / {participants.length} participants prêts
          </span>
        </div>

        {isFacilitator && !revealImmediately && (
          <button
            onClick={handleRevealAll}
            className="btn-primary flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Révéler tous les tickets</span>
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {columns.map((column: any) => {
          const columnTickets = tickets.filter(
            (t: any) => t.columnId === column.id && (t.isRevealed || t.authorId === userId)
          );

          return (
            <div key={column.id} className="flex flex-col">
              <div
                className="rounded-t-lg p-4 text-white font-semibold"
                style={{ backgroundColor: column.color }}
              >
                <h3 className="text-lg">{column.title}</h3>
                <span className="text-sm opacity-90">
                  {columnTickets.length} ticket{columnTickets.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex-1 bg-white border-x border-b border-gray-200 rounded-b-lg p-4 space-y-3">
                {/* Add ticket input */}
                <div className="mb-4">
                  <textarea
                    className="input text-sm"
                    rows={2}
                    placeholder="Ajouter un ticket..."
                    value={newTickets[column.id] || ''}
                    onChange={(e) =>
                      setNewTickets({ ...newTickets, [column.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddTicket(column.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddTicket(column.id)}
                    disabled={!newTickets[column.id]?.trim()}
                    className="btn-primary btn-sm mt-2 w-full flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>

                {/* Tickets */}
                {columnTickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="rounded-lg p-3 shadow-sm border-l-4 bg-white relative group"
                    style={{
                      borderLeftColor: getTicketColor(ticket),
                      opacity: ticket.isRevealed ? 1 : 0.6,
                    }}
                  >
                    {!ticket.isRevealed && (
                      <div className="absolute top-2 right-2">
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      </div>
                    )}

                    <p className="text-sm text-gray-900 mb-2">{ticket.content}</p>

                    {showAuthor && ticket.author && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: ticket.author.color }}
                        >
                          {ticket.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600">
                          {ticket.author.name}
                        </span>
                      </div>
                    )}

                    {/* Reactions */}
                    {ticket.reactions && ticket.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ticket.reactions.map((reaction: any) => (
                          <button
                            key={reaction.id}
                            onClick={() => handleAddReaction(ticket.id, reaction.emoji)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1"
                          >
                            {reaction.emoji} {reaction.count}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setCommentingTicket(ticket.id)}
                        className="text-xs text-gray-600 hover:text-primary-600 flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Commenter</span>
                      </button>
                      <div className="relative group/emoji">
                        <button className="text-xs text-gray-600 hover:text-primary-600 flex items-center space-x-1">
                          <Smile className="w-3 h-3" />
                          <span>Réagir</span>
                        </button>
                        <div className="hidden group-hover/emoji:block absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-lg p-2 z-10">
                          <div className="flex space-x-1">
                            {EMOJI_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(ticket.id, emoji)}
                                className="text-xl hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    {ticket.comments && ticket.comments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                        {ticket.comments.map((comment: any) => (
                          <div key={comment.id} className="text-xs">
                            <span className="font-semibold text-gray-700">
                              {comment.author?.name}:
                            </span>{' '}
                            <span className="text-gray-600">{comment.content}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add comment */}
                    {commentingTicket === ticket.id && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <input
                          type="text"
                          className="input text-xs"
                          placeholder="Ajouter un commentaire..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(ticket.id);
                            }
                            if (e.key === 'Escape') {
                              setCommentingTicket(null);
                              setCommentText('');
                            }
                          }}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BrainstormPhase;
