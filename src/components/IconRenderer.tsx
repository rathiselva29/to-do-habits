import React from 'react';
import { 
  Droplets, 
  Footprints, 
  Moon, 
  Brain, 
  Heart, 
  Target, 
  Flame, 
  Sun, 
  Smile, 
  Sparkles, 
  Coffee, 
  Activity, 
  Apple, 
  Dumbbell, 
  BookOpen, 
  Check, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Calendar, 
  Bed, 
  Music, 
  ShieldCheck, 
  TrendingUp, 
  Sparkle,
  Compass
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.FC<any>> = {
  Droplets,
  Footprints,
  Moon,
  Brain,
  Heart,
  Target,
  Flame,
  Sun,
  Smile,
  Sparkles,
  Coffee,
  Activity,
  Apple,
  Dumbbell,
  BookOpen,
  Check,
  CheckCircle2,
  Zap,
  Clock,
  Calendar,
  Bed,
  Music,
  ShieldCheck,
  TrendingUp,
  Sparkle,
  Compass,
};

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5', size }) => {
  const Component = ICON_MAP[name] || Sparkles;
  return <Component className={className} size={size} />;
};
