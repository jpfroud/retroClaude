import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRetroStore } from '../store/useRetroStore';
import { retroApi } from '../services/api.service';
import { socketService } from '../services/socket.service';
import toast from 'react-hot-toast';

// Components
import PhaseNavigation from '../components/common/PhaseNavigation';
import Timer from '../components/common/Timer';

// Phases
import SetupPhase from '../components/phases/SetupPhase';
import IcebreakerPhase from '../components/phases/IcebreakerPhase';
import WelcomePhase from '../components/phases/WelcomePhase';
import ReviewActionsPhase from '../components/phases/ReviewActionsPhase';
import BrainstormPhase from '../components/phases/BrainstormPhase';
import GroupPhase from '../components/phases/GroupPhase';
import VotePhase from '../components/phases/VotePhase';
import DiscussPhase from '../components/phases/DiscussPhase';
import ReviewPhase from '../components/phases/ReviewPhase';
import ClosingPhase from '../components/phases/ClosingPhase';

function RetroRoom() {
  const { retroId } = useParams<{ retroId: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    retrospective,
    setRetrospective,
    isConnected,
  } = useRetroStore();

  const isLoading = !retrospective;

  useEffect(() => {
    if (!currentUser) {
      toast.error('Vous devez vous connecter d\'abord');
      navigate('/');
      return;
    }

    loadRetrospective();
    connectToSocket();

    return () => {
      if (retroId && currentUser) {
        socketService.leaveRetro(retroId, currentUser.id);
      }
    };
  }, [retroId]);

  const loadRetrospective = async () => {
    if (!retroId) return;

    try {
      const response = await retroApi.getRetrospective(retroId);
      setRetrospective(response.data);
    } catch (error) {
      console.error('Error loading retrospective:', error);
      toast.error('Erreur lors du chargement de la rétrospective');
      navigate('/');
    }
  };

  const connectToSocket = () => {
    socketService.connect();
    if (retroId && currentUser) {
      socketService.joinRetro(retroId, currentUser.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la rétrospective...</p>
        </div>
      </div>
    );
  }

  if (!retrospective) {
    return null;
  }

  const isFacilitator = retrospective.participants?.some(
    (p: any) => p.userId === currentUser?.id && p.role === 'facilitator'
  );

  const renderPhase = () => {
    const phase = retrospective.currentPhase;

    switch (phase) {
      case 'setup':
        return <SetupPhase retroId={retroId!} isFacilitator={isFacilitator} />;

      case 'icebreaker':
        return <IcebreakerPhase retroId={retroId!} userId={currentUser!.id} />;

      case 'welcome':
        return <WelcomePhase retroId={retroId!} userId={currentUser!.id} />;

      case 'review-actions':
        return <ReviewActionsPhase retroId={retroId!} isFacilitator={isFacilitator} />;

      case 'brainstorm':
        return (
          <BrainstormPhase
            retroId={retroId!}
            userId={currentUser!.id}
            isFacilitator={isFacilitator}
          />
        );

      case 'group':
        return (
          <GroupPhase
            retroId={retroId!}
            userId={currentUser!.id}
            isFacilitator={isFacilitator}
          />
        );

      case 'vote':
        return <VotePhase retroId={retroId!} userId={currentUser!.id} />;

      case 'discuss':
        return (
          <DiscussPhase
            retroId={retroId!}
            userId={currentUser!.id}
            isFacilitator={isFacilitator}
          />
        );

      case 'review':
        return <ReviewPhase retroId={retroId!} isFacilitator={isFacilitator} />;

      case 'closing':
        return <ClosingPhase retroId={retroId!} userId={currentUser!.id} />;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Phase inconnue : {phase}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {retrospective.title}
              </h1>
              <p className="text-sm text-gray-600">
                {isConnected ? (
                  <span className="text-green-600">● Connecté</span>
                ) : (
                  <span className="text-red-600">● Déconnecté</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                {isFacilitator && (
                  <span className="text-xs text-primary-600 font-semibold">
                    Facilitateur
                  </span>
                )}
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: currentUser?.color }}
              >
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Navigation & Timer */}
          <div className="grid lg:grid-cols-2 gap-4">
            <PhaseNavigation
              retroId={retroId!}
              currentPhase={retrospective.currentPhase}
              isFacilitator={isFacilitator}
            />
            <Timer retroId={retroId!} isFacilitator={isFacilitator} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderPhase()}
      </div>
    </div>
  );
}

export default RetroRoom;
