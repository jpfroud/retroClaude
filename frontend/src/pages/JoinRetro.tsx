import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { retroApi } from '../services/api.service';
import { useRetroStore } from '../store/useRetroStore';
import toast from 'react-hot-toast';

function JoinRetro() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const setCurrentUser = useRetroStore((state) => state.setCurrentUser);
  const setRetrospective = useRetroStore((state) => state.setRetrospective);

  const [userName, setUserName] = useState('');
  const [retroInfo, setRetroInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      loadRetroInfo();
    }
  }, [inviteCode]);

  const loadRetroInfo = async () => {
    try {
      const response = await retroApi.getRetrospectiveByInviteCode(inviteCode!);
      setRetroInfo(response.data);
    } catch (error) {
      console.error('Error loading retrospective:', error);
      toast.error('Code d\'invitation invalide');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!userName.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }

    setIsJoining(true);

    try {
      // Créer l'utilisateur
      const userResponse = await retroApi.createUser(userName);
      const user = userResponse.data;
      setCurrentUser(user);

      // Rejoindre la rétrospective
      await retroApi.joinRetrospective(retroInfo.id, user.id);

      // Charger la rétrospective complète
      const retroResponse = await retroApi.getRetrospective(retroInfo.id);
      setRetrospective(retroResponse.data);

      toast.success('Vous avez rejoint la rétrospective !');
      navigate(`/retro/${retroInfo.id}`);
    } catch (error) {
      console.error('Error joining retrospective:', error);
      toast.error('Erreur lors de la connexion à la rétrospective');
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!retroInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rejoindre une rétrospective
            </h1>
            <p className="text-gray-600">
              Code d'invitation : <span className="font-mono font-bold text-primary-600">{inviteCode}</span>
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-1">
              {retroInfo.title}
            </h2>
            {retroInfo.description && (
              <p className="text-sm text-gray-600">{retroInfo.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
              <span>Template : <span className="font-semibold">{retroInfo.template}</span></span>
              {retroInfo.isAnonymous && (
                <span className="bg-primary-200 text-primary-800 px-2 py-1 rounded text-xs">
                  Anonyme
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="label">Votre nom *</label>
              <input
                type="text"
                className="input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userName.trim()) {
                    handleJoin();
                  }
                }}
                autoFocus
              />
            </div>

            <button
              className="btn-primary w-full"
              onClick={handleJoin}
              disabled={isJoining || !userName.trim()}
            >
              {isJoining ? 'Connexion...' : 'Rejoindre la rétrospective'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinRetro;
