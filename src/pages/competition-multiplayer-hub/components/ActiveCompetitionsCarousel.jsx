import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ActiveCompetitionsCarousel = ({ onJoinCompetition }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const competitions = [
    {
      id: 1,
      title: "Torneio de Rock Nacional",
      description: "Competição especial com clássicos do rock brasileiro",
      thumbnail: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800",
      prize: "R$ 5.000",
      participants: 234,
      maxParticipants: 500,
      deadline: new Date('2025-01-15'),
      difficulty: "Intermediário",
      category: "Rock",
      entryFee: "Gratuito",
      status: "Inscrições Abertas"
    },
    {
      id: 2,
      title: "Copa MPB 2025",
      description: "Celebre a música popular brasileira nesta competição épica",
      thumbnail: "https://images.pixabay.com/photo/2016/11/23/15/48/audience-1853662_960_720.jpg",
      prize: "R$ 8.000",
      participants: 156,
      maxParticipants: 300,
      deadline: new Date('2025-01-20'),
      difficulty: "Avançado",
      category: "MPB",
      entryFee: "R$ 25",
      status: "Inscrições Abertas"
    },
    {
      id: 3,
      title: "Duetos de Sertanejo",
      description: "Competição em duplas com sucessos do sertanejo",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
      prize: "R$ 3.500",
      participants: 89,
      maxParticipants: 200,
      deadline: new Date('2025-01-25'),
      difficulty: "Iniciante",
      category: "Sertanejo",
      entryFee: "R$ 15",
      status: "Inscrições Abertas"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % competitions?.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, competitions?.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % competitions?.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + competitions?.length) % competitions?.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const getDaysUntilDeadline = (deadline) => {
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-success bg-success/10';
      case 'Intermediário': return 'text-warning bg-warning/10';
      case 'Avançado': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  return (
    <div className="relative bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Competições Ativas</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="h-8 w-8"
            aria-label="Competição anterior"
          >
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="h-8 w-8"
            aria-label="Próxima competição"
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>
      </div>
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {competitions?.map((competition) => (
            <div key={competition?.id} className="w-full flex-shrink-0">
              <div className="relative">
                <div className="aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
                  <Image
                    src={competition?.thumbnail}
                    alt={competition?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(competition?.difficulty)}`}>
                          {competition?.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {competition?.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {competition?.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {competition?.description}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <Icon name="Trophy" size={14} className="text-warning" />
                          <span className="text-foreground font-medium">{competition?.prize}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Icon name="Users" size={14} className="text-primary" />
                          <span className="text-foreground">
                            {competition?.participants}/{competition?.maxParticipants}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Icon name="Calendar" size={14} className="text-accent" />
                          <span className="text-foreground">
                            {getDaysUntilDeadline(competition?.deadline)} dias
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Icon name="CreditCard" size={14} className="text-success" />
                          <span className="text-foreground">{competition?.entryFee}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        <Icon name="Info" size={16} className="mr-2" />
                        Detalhes
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onJoinCompetition(competition)}
                        className="whitespace-nowrap"
                      >
                        <Icon name="Trophy" size={16} className="mr-2" />
                        Participar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Slide indicators */}
      <div className="flex justify-center space-x-2 p-4">
        {competitions?.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              currentSlide === index ? 'bg-primary' : 'bg-muted'
            }`}
            aria-label={`Ir para competição ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveCompetitionsCarousel;