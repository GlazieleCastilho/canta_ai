import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SongDetailModal = ({ isOpen, song, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: song?.title || '',
    artist: song?.artist || '',
    genre: song?.genre || '',
    language: song?.language || 'Português',
    difficulty: song?.difficulty || 'Médio',
    lyrics: song?.lyrics || '',
    coverArt: song?.coverArt || ''
  });

  const [activeTab, setActiveTab] = useState('info');
  const [isPlaying, setIsPlaying] = useState(false);

  const genreOptions = [
    { value: 'Rock', label: 'Rock' },
    { value: 'Pop', label: 'Pop' },
    { value: 'MPB', label: 'MPB' },
    { value: 'Sertanejo', label: 'Sertanejo' },
    { value: 'Funk', label: 'Funk' },
    { value: 'Samba', label: 'Samba' },
    { value: 'Forró', label: 'Forró' },
    { value: 'Eletrônica', label: 'Eletrônica' },
    { value: 'Hip Hop', label: 'Hip Hop' },
    { value: 'Reggae', label: 'Reggae' }
  ];

  const languageOptions = [
    { value: 'Português', label: 'Português' },
    { value: 'Inglês', label: 'Inglês' },
    { value: 'Espanhol', label: 'Espanhol' },
    { value: 'Francês', label: 'Francês' },
    { value: 'Italiano', label: 'Italiano' }
  ];

  const difficultyOptions = [
    { value: 'Fácil', label: 'Fácil' },
    { value: 'Médio', label: 'Médio' },
    { value: 'Difícil', label: 'Difícil' },
    { value: 'Expert', label: 'Expert' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave({
      ...song,
      ...formData
    });
    onClose();
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Editar Música</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Modifique as informações e configurações da música
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Info" size={16} className="mr-2 inline" />
              Informações
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'lyrics' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="FileText" size={16} className="mr-2 inline" />
              Letras
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Play" size={16} className="mr-2 inline" />
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cover art */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium mb-2">Capa do Álbum</label>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                  <Image
                    src={formData?.coverArt}
                    alt={`Capa de ${formData?.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  Alterar Capa
                </Button>
              </div>

              {/* Form fields */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Título da Música"
                    value={formData?.title}
                    onChange={(e) => handleInputChange('title', e?.target?.value)}
                    placeholder="Nome da música"
                    required
                  />
                  <Input
                    label="Artista"
                    value={formData?.artist}
                    onChange={(e) => handleInputChange('artist', e?.target?.value)}
                    placeholder="Nome do artista"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Gênero"
                    options={genreOptions}
                    value={formData?.genre}
                    onChange={(value) => handleInputChange('genre', value)}
                  />
                  <Select
                    label="Idioma"
                    options={languageOptions}
                    value={formData?.language}
                    onChange={(value) => handleInputChange('language', value)}
                  />
                  <Select
                    label="Dificuldade"
                    options={difficultyOptions}
                    value={formData?.difficulty}
                    onChange={(value) => handleInputChange('difficulty', value)}
                  />
                </div>

                {/* Song stats */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Estatísticas da Música</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {formatDuration(song?.duration)}
                      </div>
                      <div className="text-xs text-muted-foreground">Duração</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">
                        {song?.playCount || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Reproduções</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-success">
                        {song?.rating || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Avaliação</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">
                        {song?.bestScore || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Melhor Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lyrics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Letras da Música</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Icon name="Upload" size={16} className="mr-2" />
                    Importar LRC
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="Edit" size={16} className="mr-2" />
                    Editor Avançado
                  </Button>
                </div>
              </div>
              
              <textarea
                value={formData?.lyrics}
                onChange={(e) => handleInputChange('lyrics', e?.target?.value)}
                placeholder={`Digite as letras da música aqui...\n\nExemplo:\n[00:12.50] Primeira linha da música\n[00:18.20] Segunda linha da música\n[00:24.10] Terceira linha da música`}
                className="w-full h-96 p-4 bg-muted/30 border border-border rounded-lg resize-none font-mono text-sm"
              />
              
              <div className="text-xs text-muted-foreground">
                <p>• Use o formato [mm:ss.xx] para sincronização temporal</p>
                <p>• Cada linha deve começar com um timestamp</p>
                <p>• Use o Editor Avançado para sincronização visual</p>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Preview da Música</h3>
                <p className="text-muted-foreground mb-6">
                  Teste a reprodução e sincronização das letras
                </p>

                {/* Audio player mockup */}
                <div className="bg-muted/30 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                    >
                      <Icon name="SkipBack" size={20} />
                    </Button>
                    <Button
                      size="lg"
                      onClick={togglePlayback}
                      className="w-16 h-16 rounded-full"
                    >
                      <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                    >
                      <Icon name="SkipForward" size={20} />
                    </Button>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div className="bg-primary h-2 rounded-full w-1/3 transition-all duration-300"></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1:23</span>
                    <span>{formatDuration(song?.duration)}</span>
                  </div>
                </div>

                {/* Lyrics preview */}
                <div className="bg-background/50 rounded-lg p-6 border border-border">
                  <h4 className="font-medium mb-4">Preview das Letras</h4>
                  <div className="space-y-2 text-center">
                    <div className="text-muted-foreground">♪ Música instrumental ♪</div>
                    <div className="text-lg font-medium text-primary">
                      Esta é a linha atual sendo cantada
                    </div>
                    <div className="text-muted-foreground">Próxima linha da música</div>
                    <div className="text-muted-foreground opacity-50">Linha seguinte</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Última modificação: {new Date()?.toLocaleDateString('pt-BR')}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
            >
              <Icon name="Save" size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDetailModal;