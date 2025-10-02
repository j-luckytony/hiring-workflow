import React from 'react';
import { Play, GitBranch, Square, User, Bot, Zap } from 'lucide-react';

export const getNodeIcon = (type: string, _config?: any) => {
  switch (type) {
    case 'start':
      return React.createElement(Play, { className: "w-5 h-5" });
    case 'action':
      if (_config?.actionType === 'ai_interview' || _config?.actionType === 'ai_agent') {
        return React.createElement(Bot, { className: "w-5 h-5" });
      }
      if (_config?.actionType === 'schedule_interview' || _config?.actionType === 'collect_feedback') {
        return React.createElement(User, { className: "w-5 h-5" });
      }
      return React.createElement(Zap, { className: "w-5 h-5" });
    case 'decision':
      return React.createElement(GitBranch, { className: "w-5 h-5" });
    case 'terminal':
      return React.createElement(Square, { className: "w-5 h-5" });
    default:
      return React.createElement(Square, { className: "w-5 h-5" });
  }
};

export const getNodeStyles = (type: string, _config?: any) => {
  const baseStyles = {
    size: 'w-40 h-28', // Reduced from w-48 h-36 to be more reasonable
    shape: 'rounded-lg',
  };

  switch (type) {
    case 'start':
      return {
        ...baseStyles,
        bg: 'bg-gradient-to-br from-green-400 to-green-600',
        hover: 'hover:from-green-500 hover:to-green-700',
        text: 'text-white',
        icon: 'text-white',
        shape: 'rounded-full',
        size: 'w-32 h-32' // Reduced from w-40 h-40 for circular start nodes
      };
    case 'action':
      return {
        ...baseStyles,
        bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
        hover: 'hover:from-blue-500 hover:to-blue-700',
        text: 'text-white',
        icon: 'text-white',
        size: 'w-44 h-32' // Reduced from w-52 h-40 but still larger for integration info
      };
    case 'decision':
      return {
        ...baseStyles,
        bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        hover: 'hover:from-yellow-500 hover:to-yellow-700',
        text: 'text-white',
        icon: 'text-white',
        shape: 'transform rotate-45',
        size: 'w-28 h-28' // Reduced from w-36 h-36 for diamond decision nodes
      };
    case 'terminal':
      return {
        ...baseStyles,
        bg: 'bg-gradient-to-br from-red-400 to-red-600',
        hover: 'hover:from-red-500 hover:to-red-700',
        text: 'text-white',
        icon: 'text-white',
        size: 'w-40 h-28' // Reduced from w-48 h-36 for terminal nodes
      };
    default:
      return {
        ...baseStyles,
        bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
        hover: 'hover:from-gray-500 hover:to-gray-700',
        text: 'text-white',
        icon: 'text-white'
      };
  }
};

export const getNodeColors = (type: string) => {
  switch (type) {
    case 'start':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'action':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'decision':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'terminal':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};
