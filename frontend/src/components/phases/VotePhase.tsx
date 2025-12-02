import { useState } from 'react';
import { Vote as VoteIcon, Check } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import { socketService } from '../../services/socket.service';
import { useRetroStore } from '../../store/useRetroStore';
import toast from 'react-hot-toast';

interface VotePhaseProps {
  retroId: string;
  userId: string;
}

function VotePhase({ retroId, userId }: VotePhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);

  const config = retrospective?.config || {};
  const voteConfig = config.voteConfig || { maxVotes: 3, voteOnGroups: true, showResults: false };
  const tickets = retrospective?.tickets || [];
  const ticketGroups = retrospective?.ticketGroups || [];
  const votes = retrospective?.votes || [];

  const voteOnGroups = voteConfig.voteOnGroups !== false;
  const maxVotes = voteConfig.maxVotes || 3;
  const showResults = voteConfig.showResults || false;

  const userVotes = votes.filter((v: any) => v.userId === userId);
  const votesLeft = maxVotes - userVotes.length;

  const handleVote = (itemId: string, isGroup: boolean) => {
    if (votesLeft <= 0) {
      toast.error(`Vous avez déjà utilisé tous vos votes (${maxVotes})`);
      return;
    }

    // Vérifier si déjà voté sur cet item
    const alreadyVoted = userVotes.some((v: any) =>
      isGroup ? v.groupId === itemId : v.ticketId === itemId
    );

    if (alreadyVoted) {
      toast.error('Vous avez déjà voté sur cet élément');
      return;
    }

    socketService.castVote(
      retroId,
      userId,
      isGroup ? undefined : itemId,
      isGroup ? itemId : undefined
    );

    toast.success('Vote enregistré');
  };

  const getVoteCount = (itemId: string, isGroup: boolean) => {
    return votes.filter((v: any) =>
      isGroup ? v.groupId === itemId : v.ticketId === itemId
    ).length;
  };

  const hasUserVoted = (itemId: string, isGroup: boolean) => {
    return userVotes.some((v: any) =>
      isGroup ? v.groupId === itemId : v.ticketId === itemId
    );
  };

  const renderTickets = () => {
    const revealedTickets = tickets.filter((t: any) => t.isRevealed && !t.groupId);

    return (
      <div className="space-y-3">
        {revealedTickets.map((ticket: any) => {
          const voteCount = getVoteCount(ticket.id, false);
          const userHasVoted = hasUserVoted(ticket.id, false);

          return (
            <div
              key={ticket.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                userHasVoted
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{ticket.content}</p>
                  {ticket.author && (
                    <p className="text-sm text-gray-500">{ticket.author.name}</p>
                  )}
                </div>

                <div className="flex flex-col items-center space-y-2 ml-4">
                  {showResults && (
                    <div className="text-2xl font-bold text-gray-900">
                      {voteCount}
                    </div>
                  )}
                  {!userHasVoted && votesLeft > 0 ? (
                    <button
                      onClick={() => handleVote(ticket.id, false)}
                      className="btn-primary btn-sm"
                    >
                      Voter
                    </button>
                  ) : userHasVoted ? (
                    <div className="flex items-center space-x-1 text-primary-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Voté</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGroups = () => {
    return (
      <div className="space-y-4">
        {ticketGroups.map((group: any, index: number) => {
          const voteCount = getVoteCount(group.id, true);
          const userHasVoted = hasUserVoted(group.id, true);

          return (
            <div
              key={group.id}
              className={`card ${
                userHasVoted ? 'border-2 border-primary-500 bg-primary-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  {group.title || `Groupe ${index + 1}`}
                </h4>

                <div className="flex flex-col items-center space-y-2">
                  {showResults && (
                    <div className="text-3xl font-bold text-gray-900">
                      {voteCount}
                    </div>
                  )}
                  {!userHasVoted && votesLeft > 0 ? (
                    <button
                      onClick={() => handleVote(group.id, true)}
                      className="btn-primary"
                    >
                      Voter
                    </button>
                  ) : userHasVoted ? (
                    <div className="flex items-center space-x-1 text-primary-600">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Voté</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                {group.tickets?.length || 0} ticket{(group.tickets?.length || 0) > 1 ? 's' : ''}
              </div>

              <div className="space-y-2">
                {group.tickets?.slice(0, 3).map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="p-2 bg-white rounded text-sm text-gray-700"
                  >
                    {ticket.content}
                  </div>
                ))}
                {group.tickets?.length > 3 && (
                  <p className="text-xs text-gray-500 italic">
                    Et {group.tickets.length - 3} ticket{group.tickets.length - 3 > 1 ? 's' : ''} de plus...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PhaseHeader
        icon={<VoteIcon className="w-8 h-8" />}
        title="Vote"
        description="Votez pour les sujets les plus importants à discuter"
        color="blue"
      />

      <div className="card mb-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <p className="text-sm text-blue-600 font-medium">
              Votes disponibles
            </p>
            <p className="text-2xl font-bold text-blue-900">
              {votesLeft} / {maxVotes}
            </p>
          </div>
          {!showResults && (
            <div className="text-sm text-blue-700">
              Les résultats seront révélés à la phase suivante
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {voteOnGroups ? 'Groupes' : 'Tickets'}
        </h3>
        {voteOnGroups ? renderGroups() : renderTickets()}
      </div>
    </div>
  );
}

export default VotePhase;
