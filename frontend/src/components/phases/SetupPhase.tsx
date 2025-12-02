import { Settings, Copy, QrCode } from 'lucide-react';
import PhaseHeader from '../common/PhaseHeader';
import ParticipantsList from '../common/ParticipantsList';
import { useRetroStore } from '../../store/useRetroStore';
import toast from 'react-hot-toast';

interface SetupPhaseProps {
  retroId: string;
  isFacilitator: boolean;
}

function SetupPhase({ retroId, isFacilitator }: SetupPhaseProps) {
  const retrospective = useRetroStore((state) => state.retrospective);

  const inviteCode = retrospective?.inviteCode;
  const qrCode = retrospective?.qrCode;
  const participants = retrospective?.participants || [];

  const handleCopyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success('Code d\'invitation copié !');
    }
  };

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien d\'invitation copié !');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PhaseHeader
        icon={<Settings className="w-8 h-8" />}
        title="Configuration"
        description="Invitez les participants et préparez la rétrospective"
        color="blue"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Invitation */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Inviter des participants
          </h3>

          <div className="space-y-4">
            <div>
              <label className="label">Code d'invitation</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="input flex-1 font-mono text-lg font-bold text-center"
                  value={inviteCode}
                  readOnly
                />
                <button
                  onClick={handleCopyInviteCode}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </button>
              </div>
            </div>

            <div>
              <label className="label">Lien d'invitation</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="input flex-1 text-sm"
                  value={`${window.location.origin}/join/${inviteCode}`}
                  readOnly
                />
                <button
                  onClick={handleCopyInviteLink}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </button>
              </div>
            </div>

            {qrCode && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="label mb-3 flex items-center justify-center">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </p>
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="mx-auto w-48 h-48 border-4 border-white shadow-md rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-3">
                  Scannez ce code pour rejoindre
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Participants & Info */}
        <div className="space-y-6">
          <ParticipantsList participants={participants} />

          <div className="card bg-primary-50 border border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">
              Informations de la rétrospective
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-primary-800">
                <span className="font-medium">Template :</span>{' '}
                {retrospective?.template}
              </p>
              <p className="text-primary-800">
                <span className="font-medium">Mode :</span>{' '}
                {retrospective?.isAnonymous ? 'Anonyme' : 'Public'}
              </p>
              <p className="text-primary-800">
                <span className="font-medium">Colonnes :</span>{' '}
                {retrospective?.columns?.length || 0}
              </p>
            </div>
          </div>

          {isFacilitator && (
            <div className="card bg-orange-50 border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">
                En tant que facilitateur
              </h3>
              <p className="text-sm text-orange-800">
                Utilisez les boutons de navigation en haut de la page pour démarrer la rétrospective
                et passer d'une phase à l'autre.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SetupPhase;
