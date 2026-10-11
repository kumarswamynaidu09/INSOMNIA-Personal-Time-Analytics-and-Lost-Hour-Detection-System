import React from 'react';
import {
  Briefcase,
  BookOpen,
  Moon,
  Sparkles,
  Activity as ActivityIcon,
  Utensils,
  Navigation,
  Smartphone,
  Eye,
  ClockAlert,
  Clock,
  Laptop,
  Coffee,
  Heart,
  Folder,
  CircleDot,
} from 'lucide-react';

interface Props {
  name: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  BookOpen,
  Moon,
  Sparkles,
  Activity: ActivityIcon,
  Utensils,
  Navigation,
  Smartphone,
  Eye,
  ClockAlert,
  Clock,
  Laptop,
  Coffee,
  Heart,
  Folder,
};

export const CategoryIcon: React.FC<Props> = ({ name, className = 'w-4 h-4', size }) => {
  const IconComponent = iconMap[name] || CircleDot;
  return <IconComponent className={className} size={size} />;
};
