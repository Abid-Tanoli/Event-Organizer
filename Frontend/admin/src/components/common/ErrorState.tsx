import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
      <AlertTriangle className="w-8 h-8 text-destructive" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">Error</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} size="sm" variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
