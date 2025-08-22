import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BottomTabNavigation = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      label: 'Início',
      path: '/dashboard-home',
      icon: 'Home',
      tooltip: 'Dashboard principal com acesso rápido a todas as funcionalidades'
    },
    {
      label: 'Biblioteca',
      path: '/music-library-management',
      icon: 'Music',
      tooltip: 'Gerencie sua coleção musical e edite letras'
    },
    {
      label: 'Cantar',
      path: '/karaoke-performance-mode',
      icon: 'Mic',
      tooltip: 'Modo performance e histórico de apresentações'
    },
    {
      label: 'Competições',
      path: '/competition-multiplayer-hub',
      icon: 'Trophy',
      tooltip: 'Desafios sociais e competições multiplayer',
      badge: 2
    }
  ];

  const handleTabClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/dashboard-home') {
      return location?.pathname === '/' || location?.pathname === '/dashboard-home';
    }
    return location?.pathname?.startsWith(path);
  };

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-[1000] bg-card border-t border-border ${className}`}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs?.map((tab) => {
          const active = isActive(tab?.path);
          
          return (
            <button
              key={tab?.path}
              onClick={() => handleTabClick(tab?.path)}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] min-h-[60px]
                transition-all duration-150 ease-out
                ${active 
                  ? 'text-primary bg-primary/10 scale-105' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
              title={tab?.tooltip}
              aria-label={tab?.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon 
                  name={tab?.icon} 
                  size={20} 
                  strokeWidth={active ? 2.5 : 2}
                  className="mb-1"
                />
                {tab?.badge && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {tab?.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium leading-none ${active ? 'font-semibold' : ''}`}>
                {tab?.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabNavigation;