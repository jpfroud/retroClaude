import { useNavigate } from 'react-router-dom';
import { Users, Plus, LogIn } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            RetroClaudeApp
          </h1>
          <p className="text-xl text-gray-600">
            Rétrospectives d'équipe collaboratives en temps réel
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="card hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => navigate('/create')}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Créer une rétrospective
              </h2>
              <p className="text-gray-600">
                Démarrez une nouvelle session de rétrospective avec votre équipe
              </p>
              <button className="btn-primary">
                Créer
              </button>
            </div>
          </div>

          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Rejoindre une rétrospective
              </h2>
              <p className="text-gray-600">
                Entrez un code d'invitation pour participer
              </p>
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Code d'invitation"
                  className="input mb-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      navigate(`/join/${e.currentTarget.value.toUpperCase()}`);
                    }
                  }}
                />
                <button
                  className="btn-primary w-full"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      navigate(`/join/${input.value.toUpperCase()}`);
                    }
                  }}
                >
                  Rejoindre
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 card max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Fonctionnalités
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Templates variés</h4>
                <p className="text-sm text-gray-600">
                  Classique, 4L, Start-Stop-Continue, ou personnalisé
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Temps réel</h4>
                <p className="text-sm text-gray-600">
                  Collaboration instantanée avec votre équipe
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Phases guidées</h4>
                <p className="text-sm text-gray-600">
                  Icebreaker, brainstorm, vote, discussion, et plus
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Actions trackées</h4>
                <p className="text-sm text-gray-600">
                  Suivez les actions et leur progression
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
