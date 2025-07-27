import React from 'react';
import { ConfirmationModal } from './Modal';
import { useConfirmation } from '../../hooks/useConfirmation';

export interface ConfirmationDialogProps {
  // This component uses the useConfirmation hook internally
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = () => {
  const { isOpen, loading, options, handleConfirm, handleCancel } = useConfirmation();

  if (!options) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      loading={loading}
    />
  );
};

export default ConfirmationDialog;