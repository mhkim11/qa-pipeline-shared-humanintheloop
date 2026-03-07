import { Trash } from 'lucide-react';

import { Button } from '@/components/ui';

type TTableDeleteSmallButtonProps = {
  onClick: () => void;
};

export const TableDeleteSmallButton = ({ onClick }: TTableDeleteSmallButtonProps) => {
  return (
    <Button type='button' variant={'outline'} size={'small-icon'} onClick={onClick}>
      <Trash size={16} />
    </Button>
  );
};
