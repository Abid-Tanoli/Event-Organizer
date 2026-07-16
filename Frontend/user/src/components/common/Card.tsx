import React from 'react';
import { Card as ShadcnCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, hover = false }) => (
  <ShadcnCard
    className={cn('p-6', hover && 'cursor-pointer transition-shadow hover:shadow-lg', className)}
    onClick={onClick}
  >
    {children}
  </ShadcnCard>
);