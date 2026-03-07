import { Helmet } from 'react-helmet-async';

import medium from '@assets/fonts/Pretendard-Medium.subset.woff2';
import regular from '@assets/fonts/Pretendard-Regular.subset.woff2';
import semiBold from '@assets/fonts/Pretendard-SemiBold.subset.woff2';

/**
 * * 데이터를 미리 로드하는 컴포넌트
 * @returns {JSX.Element} 데이터를 미리 로드하는 컴포넌트
 */
const PreloadData = (): JSX.Element => {
  return (
    <Helmet>
      <link rel='preload' href={medium} as='font' type='font/woff2' />
      <link rel='preload' href={regular} as='font' type='font/woff2' />
      <link rel='preload' href={semiBold} as='font' type='font/woff2' />
    </Helmet>
  );
};

export default PreloadData;
