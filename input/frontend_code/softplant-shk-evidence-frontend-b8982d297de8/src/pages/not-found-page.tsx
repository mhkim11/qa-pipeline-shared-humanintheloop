import { JSX } from 'react';

import { Link } from 'react-router-dom';
import tw from 'twin.macro';

import { styled } from '@/styles/transient-styled';

const Container = styled.main`
  ${tw`grid h-screen min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8`}
`;

const Content = styled.div`
  ${tw`text-center`}
`;

const Title = styled.h2`
  ${tw`text-2xl tracking-tight text-neutral-900 pretendard-semibold sm:text-3xl`}
`;

const LinkBox = styled.div`
  ${tw`mt-10 flex items-center justify-center gap-x-6`}
`;

const SLink = styled(Link)`
  ${tw`rounded-md bg-black px-14 py-2.5 text-sm text-white shadow-sm pretendard-semibold hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black`}
`;

/**
 * * not found 페이지 컴포넌트
 * @returns {JSX.Element} not found 페이지 컴포넌트 view
 */
const NotFoundPage = (): JSX.Element => {
  return (
    <Container>
      <Content>
        <Title>요청하신 페이지를 찾을 수 없습니다.</Title>
        <LinkBox>
          <SLink to={'/'}>홈으로 돌아가기</SLink>
        </LinkBox>
      </Content>
    </Container>
  );
};

export default NotFoundPage;
