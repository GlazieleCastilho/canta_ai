import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SongCard = ({ 
  song, 
  isSelected = false, 
  onSelect, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onPlay,
  selectionMode = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuToggle = (e) => {
    e?.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action, e) => {
    e?.stopPropagation();
    setShowMenu(false);
    
    switch (action) {
      case 'edit':
        onEdit(song);
        break;
      case 'delete':
        onDelete(song);
        break;
      case 'duplicate':
        onDuplicate(song);
        break;
    }
  };

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect(song?.id);
    } else {
      onPlay(song);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const renderStars = (rating) => {
    return [...Array(5)]?.map((_, i) => (
      <Icon
        key={i}
        name="Star"
        size={12}
        className={i < rating ? 'text-accent fill-accent' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <div 
      className={`
        relative bg-card border border-border rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 hover:shadow-md hover:border-primary/50
        ${isSelected ? 'ring-2 ring-primary border-primary' : ''}
        ${selectionMode ? 'hover:bg-muted/30' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center
            ${isSelected 
              ? 'bg-primary border-primary' :'bg-background border-border hover:border-primary'
            }
          `}>
            {isSelected && (
              <Icon name="Check" size={12} className="text-primary-foreground" />
            )}
          </div>
        </div>
      )}
      {/* Cover art */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={song?.coverArt}
          alt={`Capa do álbum de ${song?.title}`}
          className="w-full h-full object-cover"
        />
        
        {/* Play overlay */}
        {!selectionMode && (
          <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="bg-primary rounded-full p-3">
              <Icon name="Play" size={20} className="text-primary-foreground ml-0.5" />
            </div>
          </div>
        )}

        {/* Menu button */}
        {!selectionMode && (
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
              className="w-8 h-8 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
            >
              <Icon name="MoreVertical" size={16} />
            </Button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-20">
                <button
                  onClick={(e) => handleMenuAction('edit', e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                >
                  <Icon name="Edit" size={14} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={(e) => handleMenuAction('duplicate', e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                >
                  <Icon name="Copy" size={14} />
                  <span>Duplicar</span>
                </button>
                <button
                  onClick={(e) => handleMenuAction('delete', e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive flex items-center space-x-2"
                >
                  <Icon name="Trash2" size={14} />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Song info */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate mb-1" title={song?.title}>
          {song?.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate mb-2" title={song?.artist}>
          {song?.artist}
        </p>
        
        {/* Rating and duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {renderStars(song?.rating)}
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {formatDuration(song?.duration)}
          </span>
        </div>

        {/* Genre tag */}
        <div className="mt-2">
          <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
            {song?.genre}
          </span>
        </div>
      </div>
      {/* Click overlay to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={(e) => {
            e?.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default SongCard;