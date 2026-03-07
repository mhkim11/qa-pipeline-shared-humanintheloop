import { useRef, useState, useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import { Header, MainHeader } from '@components/common';
import { EvidenceTable, HistoryTable, AuthorityTable, SettingTable, PaymentTable, SubscriptionTable } from '@components/evidence';
import AIPage from '@/pages/login/evidence-ai-page';

const HomePage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<
    'evidence' | 'history' | 'setting' | 'authority' | 'payment' | 'ai' | 'subscription'
  >('evidence');

  const handlerRefs = useRef<{
    authorityHandler?: () => void;
    settingHandler?: () => void;
    historyHandler?: () => void;
    aiHandler?: () => void;
    subscriptionHandler?: () => void;
  }>({});
  useEffect(() => {
    // URL에서 active 파라미터 확인
    const activeParam = searchParams.get('active');
    if (activeParam === 'authority') {
      setActiveComponent('authority');
    } else if (activeParam === 'payment') {
      setActiveComponent('payment');
    } else if (activeParam === 'setting') {
      setActiveComponent('setting');
    } else if (activeParam === 'subscription') {
      setActiveComponent('subscription');
    }
  }, [searchParams]);

  return (
    <>
      <>
        <MainHeader />
        <Header
          setActiveComponent={setActiveComponent}
          onActionClick={(action) => {
            if (action === 'historyHandler') {
              setActiveComponent('history');
            }

            if (action === 'authorityHandler') {
              setActiveComponent('authority');
            }
            if (action === 'aiHandler') {
              setActiveComponent('ai');
            }
            handlerRefs.current[action]?.();
          }}
        />
      </>

      {activeComponent === 'evidence' ? (
        <EvidenceTable registerHandlers={(handlers) => Object.assign(handlerRefs.current, handlers)} />
      ) : activeComponent === 'history' ? (
        <HistoryTable />
      ) : activeComponent === 'authority' ? (
        <AuthorityTable />
      ) : activeComponent === 'setting' ? (
        <SettingTable />
      ) : activeComponent === 'payment' ? (
        <PaymentTable />
      ) : activeComponent === 'subscription' ? (
        <SubscriptionTable />
      ) : activeComponent === 'ai' ? (
        <AIPage />
      ) : null}
    </>
  );
};

export default HomePage;
