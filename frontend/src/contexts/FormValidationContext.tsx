import React, { createContext, useContext, type ReactNode } from 'react';
import { useConfirmation } from '../hooks/useConfirmation';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';

interface FormValidationContextType {
  confirm: ReturnType<typeof useConfirmation>['confirm'];
}

const FormValidationContext = createContext<FormValidationContextType | undefined>(undefined);

export const useFormValidationContext = () => {
  const context = useContext(FormValidationContext);
  if (!context) {
    throw new Error('useFormValidationContext must be used within a FormValidationProvider');
  }
  return context;
};

interface FormValidationProviderProps {
  children: ReactNode;
}

export const FormValidationProvider: React.FC<FormValidationProviderProps> = ({ children }) => {
  const confirmation = useConfirmation();

  return (
    <FormValidationContext.Provider value={{ confirm: confirmation.confirm }}>
      {children}
      <ConfirmationDialog />
    </FormValidationContext.Provider>
  );
};