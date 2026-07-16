import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

export default Loader;