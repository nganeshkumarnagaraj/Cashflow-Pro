import React from 'react';
import {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Film,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Coins,
  DollarSign,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Home':
      return <Home {...props} />;
    case 'ShoppingCart':
      return <ShoppingCart {...props} />;
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Film':
      return <Film {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Coins':
      return <Coins {...props} />;
    case 'DollarSign':
      return <DollarSign {...props} />;
    default:
      return <MoreHorizontal {...props} />;
  }
};
