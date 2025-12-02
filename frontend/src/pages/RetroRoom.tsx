import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRetroStore } from '../store/useRetroStore';
import { retroApi } from '../services/api.service';
import { socketService } from '../services/socket.service';
import toast from 'react-hot-toast';

function RetroRoom() {
  const { retroId } = useParams<{ retroId: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    retrospective,
    setRetrospective,
    isConnected,
  } = useRetroStore();

  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {retrospective.title}
            </h1>
            <p className="text-sm text-gray-600">
              Phase : <span className="font-semibold">{retrospective.currentPhase}</span>
              {isConnected ? (
                <span className="ml-4 text-green-600">● Connecté</span>
              ) : (
                <span className="ml-4 text-red-600">● Déconnecté</span>
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="card">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Phase : {retrospective.currentPhase}
            </h2>
            <p className="text-gray-600 mb-8">
              L'interface complète des phases sera implémentée prochainement.
            </p>

            {isFacilitator && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  En tant que facilitateur, vous pouvez changer de phase :
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['setup', 'icebreaker', 'welcome', 'review-actions', 'brainstorm', 'group', 'vote', 'discuss', 'review', 'closing'].map((phase) => (
                    <button
                      key={phase}
                      onClick={() => {
                        socketService.changePhase(retroId!, phase);
                      }}
                      className={`btn ${
                        retrospective.currentPhase === phase
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">
                Participants ({retrospective.participants?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {retrospective.participants?.map((participant: any) => (
                  <div
                    key={participant.id}
                    className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2"
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
                    {participant.role === 'facilitator' && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        Facilitateur
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">
                Colonnes
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {retrospective.columns?.map((column: any) => (
                  <div
                    key={column.id}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: column.color + '20' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: column.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">
                      {column.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetroRoom;
