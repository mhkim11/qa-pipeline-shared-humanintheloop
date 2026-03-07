import { useRef } from 'react';

import { PrivacyPolicySection } from '@/components/common/privacy-policy-section';

const PrivacyPolicyPage = () => {
  const privacyRef = useRef<HTMLDivElement>(null!);

  return (
    <div className='flex min-h-screen bg-white text-[#999] lg:ml-[5%] lg:min-w-[1920px]'>
      <div className='mt-20 leading-10 lg:max-w-[1200px]'>
        <PrivacyPolicySection privacyRef={privacyRef} />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
