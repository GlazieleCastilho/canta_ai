import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionToolbar = ({ 
  selectedCount, 
  totalCount,
  onSelectAll, 
  onDeselectAll, 
  onDelete, 
  onMoveToPlaylist, 
  onBatchEdit,
  onExitSelection 
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Selection info and controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${allSelected 
                  ? 'bg-primary border-primary' 
                  : someSelected
                    ? 'bg-primary border-primary' :'bg-background border-border hover:border-primary'
                }
              `}
            >
              {allSelected && (
                <Icon name="Check" size={12} className="text-primary-foreground" />
              )}
              {someSelected && !allSelected && (
                <Icon name="Minus" size={12} className="text-primary-foreground" />
              )}
            </button>
            <span className="text-sm font-medium text-primary">
              {selectedCount} de {totalCount} selecionadas
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExitSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={16} className="mr-1" />
            Cancelar
          </Button>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBatchEdit}
            disabled={selectedCount === 0}
            className="text-xs"
          >
            <Icon name="Edit" size={14} className="mr-1" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onMoveToPlaylist}
            disabled={selectedCount === 0}
            className="text-xs"
          >
            <Icon name="ListPlus" size={14} className="mr-1" />
            Playlist
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={selectedCount === 0}
            className="text-xs"
          >
            <Icon name="Trash2" size={14} className="mr-1" />
            Excluir ({selectedCount})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;