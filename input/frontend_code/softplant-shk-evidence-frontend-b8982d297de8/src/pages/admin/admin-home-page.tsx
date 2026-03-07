import { JSX } from 'react';

import { AdminDashBoard } from '@/components/common/header/admin-dash-board';
import { EvidenceTable } from '@/components/evidence/admin/table/evidence-main-table';

const AdminHomePage = (): JSX.Element => {
  return (
    <AdminDashBoard>
      <EvidenceTable />
    </AdminDashBoard>
  );
};

export default AdminHomePage;
