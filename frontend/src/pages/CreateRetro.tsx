import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { retroApi } from '../services/api.service';
import { useRetroStore } from '../store/useRetroStore';
import toast from 'react-hot-toast';

const RETRO_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Ce qui s\'est bien passé / Ce qui s\'est moins bien passé',
    columns: [
      { title: 'Ce qui s\'est bien passé 😊', color: '#10b981' },
      { title: 'Ce qui s\'est moins bien passé 😟', color: '#ef4444' },
      { title: 'Idées d\'amélioration 💡', color: '#3b82f6' },
    ],
  },
  {
    id: '4l',
    name: '4L',
    description: 'Learned, Liked, Lacked, Longed for',
    columns: [
      { title: 'Learned (Appris) 📚', color: '#8b5cf6' },
      { title: 'Liked (Aimé) ❤️', color: '#ec4899' },
      { title: 'Lacked (Manqué) 🔍', color: '#f59e0b' },
      { title: 'Longed for (Désiré) 🌟', color: '#06b6d4' },
    ],
  },
  {
    id: 'start-stop-continue',
    name: 'Start, Stop, Continue',
    description: 'Actions à commencer, arrêter et continuer',
    columns: [
      { title: 'Start (Commencer) 🚀', color: '#10b981' },
      { title: 'Stop (Arrêter) 🛑', color: '#ef4444' },
      { title: 'Continue (Continuer) ➡️', color: '#3b82f6' },
    ],
  },
  {
    id: 'custom',
    name: 'Personnalisé',
    description: 'Créez vos propres colonnes',
    columns: [],
  },
];

function CreateRetro() {
  const navigate = useNavigate();
  const setCurrentUser = useRetroStore((state) => state.setCurrentUser);
  const setRetrospective = useRetroStore((state) => state.setRetrospective);

  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [customColumns, setCustomColumns] = useState<Array<{ title: string; color: string }>>([
    { title: '', color: '#3b82f6' },
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddColumn = () => {
    setCustomColumns([...customColumns, { title: '', color: '#3b82f6' }]);
  };

  const handleRemoveColumn = (index: number) => {
    setCustomColumns(customColumns.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index: number, field: 'title' | 'color', value: string) => {
    const newColumns = [...customColumns];
    newColumns[index][field] = value;
    setCustomColumns(newColumns);
  };

  const handleCreate = async () => {
    if (!userName.trim() || !title.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsCreating(true);

    try {
      // Créer l'utilisateur
      const userResponse = await retroApi.createUser(userName);
      const user = userResponse.data;
      setCurrentUser(user);

      // Préparer les colonnes
      let columns;
      if (selectedTemplate === 'custom') {
        if (customColumns.some(col => !col.title.trim())) {
          toast.error('Veuillez remplir tous les titres de colonnes');
          setIsCreating(false);
          return;
        }
        columns = customColumns.map((col, index) => ({
          title: col.title,
          color: col.color,
          position: index,
        }));
      }

      // Créer la rétrospective
      const retroResponse = await retroApi.createRetrospective({
        title,
        description,
        template: selectedTemplate,
        isAnonymous,
        createdById: user.id,
        columns,
        config: {
          showAuthor: !isAnonymous,
          colorMode: 'by-person',
          revealImmediately: false,
        },
      });

      const retro = retroResponse.data;
      setRetrospective(retro);

      toast.success('Rétrospective créée avec succès !');
      navigate(`/retro/${retro.id}`);
    } catch (error) {
      console.error('Error creating retrospective:', error);
      toast.error('Erreur lors de la création de la rétrospective');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Créer une rétrospective
          </h1>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-20 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-20 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: User info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Informations personnelles
              </h2>
              <div>
                <label className="label">Votre nom *</label>
                <input
                  type="text"
                  className="input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!userName.trim()}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Retro details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Détails de la rétrospective
              </h2>
              <div>
                <label className="label">Titre *</label>
                <input
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sprint 23 - Retrospective"
                />
              </div>
              <div>
                <label className="label">Description (optionnel)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description de la rétrospective..."
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Mode anonyme</span>
                </label>
                <p className="text-sm text-gray-500 ml-6">
                  Les noms des auteurs ne seront pas affichés
                </p>
              </div>
              <div className="flex justify-between">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  Précédent
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setStep(3)}
                  disabled={!title.trim()}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Template selection */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Choisir un template
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {RETRO_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    {template.columns.length > 0 && (
                      <div className="space-y-1">
                        {template.columns.map((col, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: col.color }}
                            ></div>
                            <span className="text-xs text-gray-600">
                              {col.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedTemplate === 'custom' && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold text-gray-900">
                    Colonnes personnalisées
                  </h3>
                  {customColumns.map((column, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        className="input flex-1"
                        value={column.title}
                        onChange={(e) =>
                          handleColumnChange(index, 'title', e.target.value)
                        }
                        placeholder="Titre de la colonne"
                      />
                      <input
                        type="color"
                        value={column.color}
                        onChange={(e) =>
                          handleColumnChange(index, 'color', e.target.value)
                        }
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      {customColumns.length > 1 && (
                        <button
                          onClick={() => handleRemoveColumn(index)}
                          className="btn-danger p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddColumn}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter une colonne</span>
                  </button>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  Précédent
                </button>
                <button
                  className="btn-primary"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? 'Création...' : 'Créer la rétrospective'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateRetro;
