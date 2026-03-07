import { MainHeader } from '@components/common';
import { NotificationTable } from '@/components/evidence';

const notificationPage = (): JSX.Element => {
  return (
    <>
      <MainHeader />
      <NotificationTable />
    </>
  );
};

export default notificationPage;
