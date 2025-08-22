import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SongUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const supportedFormats = ['mp3', 'wav', 'midi', 'kar', 'mid'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files?.filter(file => {
      const extension = file?.name?.split('.')?.pop()?.toLowerCase();
      const isValidFormat = supportedFormats?.includes(extension);
      const isValidSize = file?.size <= maxFileSize;
      
      if (!isValidFormat) {
        alert(`Formato não suportado: ${file?.name}. Use: ${supportedFormats?.join(', ')}`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`Arquivo muito grande: ${file?.name}. Máximo: 50MB`);
        return false;
      }
      
      return true;
    });

    const newFiles = validFiles?.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file?.name,
      size: file?.size,
      type: file?.name?.split('.')?.pop()?.toLowerCase(),
      status: 'pending', // pending, uploading, completed, error
      progress: 0,
      metadata: {
        title: file?.name?.replace(/\.[^/.]+$/, ""),
        artist: '',
        genre: '',
        duration: 0
      }
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadFiles(prev => prev?.filter(f => f?.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress?.[fileId];
      return newProgress;
    });
  };

  const updateFileMetadata = (fileId, field, value) => {
    setUploadFiles(prev => prev?.map(file => 
      file?.id === fileId 
        ? { ...file, metadata: { ...file?.metadata, [field]: value } }
        : file
    ));
  };

  const simulateUpload = (file) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        
        setUploadProgress(prev => ({
          ...prev,
          [file.id]: Math.min(progress, 100)
        }));
      }, 200);
    });
  };

  const handleUploadAll = async () => {
    const pendingFiles = uploadFiles?.filter(f => f?.status === 'pending');
    
    for (const file of pendingFiles) {
      setUploadFiles(prev => prev?.map(f => 
        f?.id === file?.id ? { ...f, status: 'uploading' } : f
      ));
      
      try {
        await simulateUpload(file);
        setUploadFiles(prev => prev?.map(f => 
          f?.id === file?.id ? { ...f, status: 'completed' } : f
        ));
      } catch (error) {
        setUploadFiles(prev => prev?.map(f => 
          f?.id === file?.id ? { ...f, status: 'error' } : f
        ));
      }
    }

    // Simulate successful upload
    setTimeout(() => {
      const completedFiles = uploadFiles?.filter(f => f?.status === 'completed');
      onUpload(completedFiles);
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setUploadFiles([]);
    setUploadProgress({});
    setDragActive(false);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Icon name="Clock" size={16} className="text-muted-foreground" />;
      case 'uploading':
        return <Icon name="Loader2" size={16} className="text-primary animate-spin" />;
      case 'completed':
        return <Icon name="CheckCircle" size={16} className="text-success" />;
      case 'error':
        return <Icon name="XCircle" size={16} className="text-destructive" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Adicionar Músicas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Formatos suportados: {supportedFormats?.join(', ')?.toUpperCase()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Upload area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive 
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Icon name="Upload" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </h3>
            <p className="text-muted-foreground mb-4">
              Máximo 50MB por arquivo
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef?.current?.click()}
            >
              <Icon name="FolderOpen" size={16} className="mr-2" />
              Selecionar Arquivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={supportedFormats?.map(f => `.${f}`)?.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {uploadFiles?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">
                Arquivos Selecionados ({uploadFiles?.length})
              </h3>
              <div className="space-y-4">
                {uploadFiles?.map((file) => (
                  <div key={file?.id} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getStatusIcon(file?.status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{file?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file?.size)} • {file?.type?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file?.id)}
                        className="w-8 h-8"
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>

                    {/* Progress bar */}
                    {file?.status === 'uploading' && (
                      <div className="mb-3">
                        <div className="bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${uploadProgress?.[file?.id] || 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(uploadProgress?.[file?.id] || 0)}% enviado
                        </p>
                      </div>
                    )}

                    {/* Metadata fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="Título"
                        value={file?.metadata?.title}
                        onChange={(e) => updateFileMetadata(file?.id, 'title', e?.target?.value)}
                        placeholder="Nome da música"
                      />
                      <Input
                        label="Artista"
                        value={file?.metadata?.artist}
                        onChange={(e) => updateFileMetadata(file?.id, 'artist', e?.target?.value)}
                        placeholder="Nome do artista"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {uploadFiles?.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {uploadFiles?.filter(f => f?.status === 'completed')?.length} de {uploadFiles?.length} concluídos
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUploadAll}
                disabled={uploadFiles?.filter(f => f?.status === 'pending')?.length === 0}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Enviar Todas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongUploadModal;