import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';

const PerformanceSettings = ({
  isOpen = false,
  onClose,
  settings = {},
  onSettingsChange,
  className = ''
}) => {
  const [localSettings, setLocalSettings] = useState({
    keyTransposition: 0,
    tempoAdjustment: 100,
    pitchCorrection: 0,
    reverbLevel: 30,
    echoLevel: 20,
    noiseReduction: true,
    autoScroll: true,
    lyricsSize: 'medium',
    lyricsColor: 'white',
    backgroundColor: 'dark',
    visualEffects: true,
    recordPerformance: false,
    ...settings
  });

  const keyOptions = [
    { value: -12, label: '-12 (1 oitava abaixo)' },
    { value: -6, label: '-6 (meio tom abaixo)' },
    { value: -3, label: '-3' },
    { value: -1, label: '-1' },
    { value: 0, label: '0 (Original)' },
    { value: 1, label: '+1' },
    { value: 3, label: '+3' },
    { value: 6, label: '+6 (meio tom acima)' },
    { value: 12, label: '+12 (1 oitava acima)' }
  ];

  const lyricsSizeOptions = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' },
    { value: 'extra-large', label: 'Extra Grande' }
  ];

  const lyricsColorOptions = [
    { value: 'white', label: 'Branco' },
    { value: 'yellow', label: 'Amarelo' },
    { value: 'blue', label: 'Azul' },
    { value: 'green', label: 'Verde' },
    { value: 'red', label: 'Vermelho' }
  ];

  const backgroundOptions = [
    { value: 'dark', label: 'Escuro' },
    { value: 'light', label: 'Claro' },
    { value: 'gradient', label: 'Gradiente' },
    { value: 'animated', label: 'Animado' }
  ];

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleSave = () => {
    onSettingsChange?.(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      keyTransposition: 0,
      tempoAdjustment: 100,
      pitchCorrection: 0,
      reverbLevel: 30,
      echoLevel: 20,
      noiseReduction: true,
      autoScroll: true,
      lyricsSize: 'medium',
      lyricsColor: 'white',
      backgroundColor: 'dark',
      visualEffects: true,
      recordPerformance: false
    };
    setLocalSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1300] ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Settings panel */}
      <div className="absolute inset-x-4 top-4 bottom-4 md:inset-x-auto md:left-1/2 md:transform md:-translate-x-1/2 md:w-full md:max-w-2xl">
        <div className="bg-card border border-border rounded-xl h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <Icon name="Settings" size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Configurações de Performance</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fechar configurações"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Settings content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Audio Settings */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold flex items-center space-x-2">
                <Icon name="Volume2" size={18} className="text-primary" />
                <span>Configurações de Áudio</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Transposição de Tom"
                  description="Ajuste o tom da música"
                  options={keyOptions}
                  value={localSettings?.keyTransposition}
                  onChange={(value) => handleSettingChange('keyTransposition', value)}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ajuste de Tempo: {localSettings?.tempoAdjustment}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={localSettings?.tempoAdjustment}
                    onChange={(e) => handleSettingChange('tempoAdjustment', parseInt(e?.target?.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Correção de Tom: {localSettings?.pitchCorrection}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={localSettings?.pitchCorrection}
                    onChange={(e) => handleSettingChange('pitchCorrection', parseInt(e?.target?.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reverb: {localSettings?.reverbLevel}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={localSettings?.reverbLevel}
                    onChange={(e) => handleSettingChange('reverbLevel', parseInt(e?.target?.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Echo: {localSettings?.echoLevel}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={localSettings?.echoLevel}
                    onChange={(e) => handleSettingChange('echoLevel', parseInt(e?.target?.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="noiseReduction"
                  checked={localSettings?.noiseReduction}
                  onChange={(e) => handleSettingChange('noiseReduction', e?.target?.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
                <label htmlFor="noiseReduction" className="text-sm font-medium">
                  Redução de Ruído
                </label>
              </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold flex items-center space-x-2">
                <Icon name="Eye" size={18} className="text-primary" />
                <span>Configurações Visuais</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tamanho da Letra"
                  options={lyricsSizeOptions}
                  value={localSettings?.lyricsSize}
                  onChange={(value) => handleSettingChange('lyricsSize', value)}
                />

                <Select
                  label="Cor da Letra"
                  options={lyricsColorOptions}
                  value={localSettings?.lyricsColor}
                  onChange={(value) => handleSettingChange('lyricsColor', value)}
                />

                <Select
                  label="Fundo"
                  options={backgroundOptions}
                  value={localSettings?.backgroundColor}
                  onChange={(value) => handleSettingChange('backgroundColor', value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoScroll"
                    checked={localSettings?.autoScroll}
                    onChange={(e) => handleSettingChange('autoScroll', e?.target?.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                  <label htmlFor="autoScroll" className="text-sm font-medium">
                    Rolagem Automática das Letras
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="visualEffects"
                    checked={localSettings?.visualEffects}
                    onChange={(e) => handleSettingChange('visualEffects', e?.target?.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                  <label htmlFor="visualEffects" className="text-sm font-medium">
                    Efeitos Visuais
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="recordPerformance"
                    checked={localSettings?.recordPerformance}
                    onChange={(e) => handleSettingChange('recordPerformance', e?.target?.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                  <label htmlFor="recordPerformance" className="text-sm font-medium">
                    Gravar Performance
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleReset}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Restaurar Padrão
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                iconName="Check"
                iconPosition="left"
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default PerformanceSettings;