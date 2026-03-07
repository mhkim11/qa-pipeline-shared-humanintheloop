import { ReactNode } from 'react';

import { QueryClient } from '@tanstack/react-query';
import { size } from 'lodash-es';
import { Helmet } from 'react-helmet-async';
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';

import { Error } from '@/components/common';
import { ScrollTop } from '@/components/utils';
import { useLoginStore } from '@/hooks/stores';
import AdminHomePage from '@/pages/admin/admin-home-page';
import CaseTapPage from '@/pages/case-evidence/case-tap-page';
import CaseViewerPage from '@/pages/case-evidence/case-viewer-page';
import CaseDocumentEditorPage from '@/pages/login/case-document-editor-page';
import CaseEvidenceHomePage from '@/pages/login/case-evidence-main-page';
import AdminTextViewer from '@/pages/login/evidence/admin-text-viewer-page';
import AdminViewer from '@/pages/login/evidence/admin-viewer-page';
import AdminEvidenceTextViewer from '@/pages/login/evidence/evidence-admin-text-viewer-page';
import AdminEvidenceViewer from '@/pages/login/evidence/evidence-admin-viewer-page';
import NotificationPage from '@/pages/login/evidence/evidence-notification-page';
import EvidenceSummaryPdfPage from '@/pages/login/evidence/evidence-summary-pdf-page';
import EvidenceSummaryViewer from '@/pages/login/evidence/evidence-summary-text-page';
import EvidenceTextViewer from '@/pages/login/evidence/evidence-text-viewer-page';
import EvidenceViewer from '@/pages/login/evidence/evidence-viewer-page';
import AIPage from '@/pages/login/evidence-ai-page';
import EvidenceMainPage from '@/pages/login/evidence-main-page';
import EvidencePreviewPage from '@/pages/login/evidence-preview-page';
import AIPreviewPage from '@/pages/login/evidence-setting/ai-preview-page';
import BillingSuccessPage from '@/pages/login/evidence-setting/bulling-success-page';
import MemoPage from '@/pages/login/evidence-setting/memo-page';
import BillingFailPage from '@/pages/login/evidence-setting/pay-fail-page';
import PaymentPage from '@/pages/login/evidence-setting/payment-page';
import SettingPage from '@/pages/login/evidence-setting/setting-page';
import SubscriptionPage from '@/pages/login/evidence-setting/subscription-page';
import HomePage from '@/pages/login/home-page';
import AuthFailedPage from '@/pages/logout/auth-failed-page';
import CertifyCompletePage from '@/pages/logout/certify-complete-page';
// ! DEMO START
import DemoAIPage from '@/pages/logout/demo/evidence-demo-ai-page';
import { DemoAuthorityTable } from '@/pages/logout/demo/evidence-demo-authority-table';
import { DemoHistoryTable } from '@/pages/logout/demo/evidence-demo-history-table';
import EvidenceDemoMainPage from '@/pages/logout/demo/evidence-demo-main-page';
import EvidenceDemoSummaryPdfPage from '@/pages/logout/demo/evidence-demo-summary-pdf-page';
import EvidenceDemoTable from '@/pages/logout/demo/evidence-demo-table';
import EvidenceDemoViewerPage from '@/pages/logout/demo/evidence-demo-viewer-page';
// ! DEMO END
import EmailPassPage from '@/pages/logout/email-pass-page';
import EvidenceRequestPage from '@/pages/logout/evidence-request-page';
import IdCertifyPage from '@/pages/logout/find-id-certify-page';
import FindIdPage from '@/pages/logout/find-id-page';
import GraphPageTest from '@/pages/logout/graph-page-test';
import LoginPage from '@/pages/logout/login-page';
import PolicyPage from '@/pages/logout/policy-page';
import RePwPage from '@/pages/logout/re-pw-page';
import RegisterCertifyPage from '@/pages/logout/register-certify-page';
import RegisterCompletePage from '@/pages/logout/register-complete-page';
import RegisterMarketingPage from '@/pages/logout/register-marketing-page';
import OfficeNamePage from '@/pages/logout/register-office-page';
import RegisterPage from '@/pages/logout/register-page';
import RegisterPwPage from '@/pages/logout/register-pw-page';
import ResRegisterPage from '@/pages/logout/res-register-page';
import ShowIdPage from '@/pages/logout/show-id-page';
import TermsPage from '@/pages/logout/terms-page';
import XMindGraph from '@/pages/logout/xmind-graph';
import NotFoundPage from '@/pages/not-found-page';
import { LOGIN_ROUTING_PATH, LOGOUT_ROUTING_PATH } from '@/shared/constants';

// ! login 라우터 모음

type TRouterReturn = ReturnType<typeof createBrowserRouter>;

type TRouter = {
  logoutRouter: TRouterReturn;
  loginRouter: TRouterReturn;
};

type TRouterProps = {
  queryClient: QueryClient;
};

export type TSuspenseProps = {
  router: ReactNode;
  title: string | string[];
};
const useIsAdmin = (): boolean => {
  const { login } = useLoginStore();
  return login?.data?.user?.role === 'ADMIN';
};
/**
 * * 로그아웃 Suspense
 * @param {TSuspenseProps} props 자식 컴포넌트
 * @returns {ReactElement} Suspense 컴포넌트
 */
const LogoutWrapper = ({ router, title }: TSuspenseProps): ReactNode => {
  return (
    <>
      <Helmet>
        <title>AiLex{size(title) === 0 ? '' : Array.isArray(title) ? ` | ${title.join(' | ')}` : ` | ${title}`}</title>
      </Helmet>
      <ScrollTop />
      {router}
    </>
  );
};

/**
 * * 로그인 Suspense
 * @param {TSuspenseProps} props 자식 컴포넌트
 * @returns {ReactNode} Suspense 컴포넌트
 */
const LoginWrapper = ({ router, title }: TSuspenseProps): ReactNode => {
  return (
    <>
      <Helmet>
        <title>AiLex{size(title) === 0 ? '' : Array.isArray(title) ? ` | ${title.join(' | ')}` : ` | ${title}`}</title>
      </Helmet>
      <ScrollTop />
      {router}
    </>
  );
};

/**
 * * 라우터 컴포넌트
 * @description 라우터 컴포넌트 입니다. 로그인 했을때와 로그아웃 했을때의 라우팅을 처리합니다.
 * @param {TRouterProps} props 라우터 컴포넌트 props
 * @returns {TRouter} 라우터 컴포넌트
 */
const Router = ({ queryClient: _queryClient }: TRouterProps): TRouter => {
  const isAdmin = useIsAdmin(); // 어드민 여부 확인
  // ! router 모음
  const logoutRouter = createBrowserRouter([
    {
      path: '/',
      element: <Outlet />,
      errorElement: <Error />,
      children: [
        {
          index: true,
          element: <LogoutWrapper router={<LoginPage />} title={''} />,
          errorElement: <Error />,
        },
        {
          path: LOGOUT_ROUTING_PATH.LOGOUT,
          element: <Navigate to='/' replace={true} />,
          errorElement: <Error />,
        },
      ],
    },
    {
      path: 'terms',
      element: <TermsPage />,
      errorElement: <Error />,
    },
    {
      path: 'register',
      element: <Outlet />,
      errorElement: <Error />,
      children: [
        {
          index: true,
          element: <RegisterPage />,
          errorElement: <Error />,
        },
        {
          path: 'certify',
          element: <RegisterCertifyPage />,
          errorElement: <Error />,
        },
      ],
    },
    {
      path: 'demo',
      element: <EvidenceDemoMainPage />,
      errorElement: <Error />,
    },
    {
      path: 'demo-summary-pdf',
      element: <Navigate to='/demo' replace={true} />,
      errorElement: <Error />,
    },
    {
      path: 'demo-summary-pdf/:evidenceId',
      element: <EvidenceDemoSummaryPdfPage />,
      errorElement: <Error />,
    },
    {
      path: 'demo-table',
      element: <EvidenceDemoTable />,
      errorElement: <Error />,
    },
    {
      path: 'demo-history',
      element: <DemoHistoryTable />,
      errorElement: <Error />,
    },
    {
      path: 'demo-authority',
      element: <DemoAuthorityTable />,
      errorElement: <Error />,
    },
    {
      path: 'demo-ai',
      element: <DemoAIPage />,
      errorElement: <Error />,
    },
    {
      path: 'id_certify',
      element: <IdCertifyPage />,
      errorElement: <Error />,
    },
    {
      path: 'evidence-request',
      element: <EvidenceRequestPage />,
      errorElement: <Error />,
    },
    {
      path: 'certify_complete',
      element: <CertifyCompletePage />,
      errorElement: <Error />,
    },
    {
      path: 'register_email',
      element: <EmailPassPage />,
      errorElement: <Error />,
    },
    {
      path: 'register_pw',
      element: <RegisterPwPage />,
      errorElement: <Error />,
    },
    {
      path: 'register_office',
      element: <OfficeNamePage />,
      errorElement: <Error />,
    },
    {
      path: 'auth_failed',
      element: <AuthFailedPage />,
      errorElement: <Error />,
    },
    {
      path: 'show_id',
      element: <ShowIdPage />,
      errorElement: <Error />,
    },
    {
      path: 'reset_password',
      element: <RePwPage />,
      errorElement: <Error />,
    },

    {
      path: 'find_id',
      element: <FindIdPage />,
      errorElement: <Error />,
    },
    {
      path: 'register_complete',
      element: <RegisterCompletePage />,
      errorElement: <Error />,
    },
    {
      path: 'policy',
      element: <PolicyPage />,
      errorElement: <Error />,
    },
    {
      path: 'graph',
      element: <GraphPageTest />,
      errorElement: <Error />,
    },
    {
      path: 'xmind',
      element: <XMindGraph />,
      errorElement: <Error />,
    },
    {
      path: 'les-signup-ailex-authentication',
      element: <Navigate to='/' replace={true} />,
      errorElement: <Error />,
    },
    {
      path: 'event-signup-ailex-authentication',
      element: <ResRegisterPage />,
      errorElement: <Error />,
    },
    {
      path: 'demo-viewer',
      element: <Navigate to='/demo' replace={true} />,
      errorElement: <Error />,
    },
    {
      path: 'demo-viewer/:evidenceId',
      element: <EvidenceDemoViewerPage />,
      errorElement: <Error />,
    },
    {
      path: 'register_marketing',
      element: <RegisterMarketingPage />,
      errorElement: <Error />,
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ]);
  // ! 어드민 전용 라우터
  const adminRouter = createBrowserRouter([
    {
      path: '/',
      element: <Outlet />,
      errorElement: <Error />,
      children: [
        {
          index: true,
          element: <LoginWrapper router={<AdminHomePage />} title={'어드민 메인'} />,
        },

        {
          path: 'admin/evidence/pdf',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              index: true,
              element: <LoginWrapper router={<AdminEvidenceViewer />} title={'어드민 PDF 뷰어'} />,
              errorElement: <Error />,
            },
            {
              path: ':evidenceId', // 동적 파라미터 추가
              element: <LoginWrapper router={<AdminEvidenceViewer />} title={'어드민 PDF 뷰어'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: 'admin/evidence/text',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              index: true,
              element: <LoginWrapper router={<AdminEvidenceTextViewer />} title={'어드민 OCR 뷰어'} />,
              errorElement: <Error />,
            },
            {
              path: ':evidenceId', // 동적 파라미터 추가
              element: <LoginWrapper router={<AdminEvidenceTextViewer />} title={'어드민 OCR 뷰어'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: 'admin/evidence-document/pdf',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              index: true,
              element: <LoginWrapper router={<AdminViewer />} title={'어드민 PDF 뷰어'} />,
              errorElement: <Error />,
            },
            {
              path: ':evidenceId', // 동적 파라미터 추가
              element: <LoginWrapper router={<AdminViewer />} title={'어드민 PDF 뷰어'} />,
              errorElement: <Error />,
            },
          ],
        },

        {
          path: 'admin/evidence-preview',
          element: <LoginWrapper router={<EvidencePreviewPage />} title={'사용자 증거목록 미리보기'} />,
          errorElement: <Error />,
        },

        {
          path: 'admin/ai-preview',
          element: <LoginWrapper router={<AIPreviewPage />} title={'AI화면 미리보기'} />,
          errorElement: <Error />,
        },
        {
          path: 'admin/evidence-preview/pdf',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              path: ':evidenceId',
              element: <LoginWrapper router={<EvidenceViewer />} title={'사용자 문서 미리보기'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: 'admin/evidence-preview/text',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              path: ':evidenceId',
              element: <LoginWrapper router={<EvidenceTextViewer />} title={'사용자 문서 미리보기'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: 'admin/evidence-preview/summaryPdf',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              path: ':evidenceId',
              element: <LoginWrapper router={<EvidenceSummaryPdfPage />} title={'사용자 요약PDF보기'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: 'pdf',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              path: ':evidenceId',
              element: <LoginWrapper router={<EvidenceViewer />} title={'사용자 문서 미리보기'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: 'summary',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              path: ':evidenceId',
              element: <LoginWrapper router={<EvidenceSummaryViewer />} title={'사용자 요약보기'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: 'summaryPdf',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              path: ':evidenceId',
              element: <LoginWrapper router={<EvidenceSummaryPdfPage />} title={'사용자 요약PDF보기'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: 'admin/evidence-document/text',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              index: true,
              element: <LoginWrapper router={<AdminTextViewer />} title={'어드민 PDF 뷰어'} />,
              errorElement: <Error />,
            },
            {
              path: ':evidenceId', // 동적 파라미터 추가
              element: <LoginWrapper router={<AdminTextViewer />} title={'어드민 PDF 뷰어'} />,
              errorElement: <Error />,
            },
          ],
        },
      ],
    },
    {
      path: 'demo',
      element: <EvidenceDemoMainPage />,
      errorElement: <Error />,
    },
    {
      path: 'demo-viewer',
      element: <Navigate to='/demo' replace={true} />,
      errorElement: <Error />,
    },
    {
      path: 'demo-viewer/:evidenceId',
      element: <EvidenceDemoViewerPage />,
      errorElement: <Error />,
    },
    {
      path: 'demo-summary-pdf',
      element: <Navigate to='/demo' replace={true} />,
      errorElement: <Error />,
    },
    {
      path: 'demo-summary-pdf/:evidenceId',
      element: <EvidenceDemoSummaryPdfPage />,
      errorElement: <Error />,
    },
  ]);

  const userRouter = createBrowserRouter([
    {
      path: '/',
      element: <Outlet />,
      errorElement: <Error />,
      children: [
        {
          index: true,
          element: <LoginWrapper router={<HomePage />} title={'사건목록'} />,
          errorElement: <Error />,
        },

        {
          path: ':id',
          element: <LoginWrapper router={<HomePage />} title={'사건목록'} />,
          errorElement: <Error />,
        },
        {
          path: 'settings',
          element: <LoginWrapper router={<SettingPage />} title={'세팅'} />,
          errorElement: <Error />,
        },
        {
          path: 'notifications',
          element: <LoginWrapper router={<NotificationPage />} title={'알림'} />,
          errorElement: <Error />,
        },
        {
          path: 'payment',
          element: <LoginWrapper router={<PaymentPage />} title={'결제관리'} />,
          errorElement: <Error />,
        },
        {
          path: 'subscription',
          element: <LoginWrapper router={<SubscriptionPage />} title={'구독관리'} />,
          errorElement: <Error />,
        },
        {
          path: 'case-list',
          element: <Outlet />,
          errorElement: <Error />,
          children: [
            {
              index: true,
              element: <LoginWrapper router={<CaseEvidenceHomePage />} title={'민사 사건'} />,
              errorElement: <Error />,
            },
            {
              path: 'editor',
              element: <LoginWrapper router={<CaseDocumentEditorPage />} title={'서면 작성'} />,
              errorElement: <Error />,
            },
          ],
        },

        {
          path: LOGIN_ROUTING_PATH.MEMO.INDEX,
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <LoginWrapper router={<MemoPage />} title={'메모관리'} />,
              errorElement: <Error />,
            },
          ],
        },
        {
          path: LOGIN_ROUTING_PATH.EVIDENCE.INDEX,
          element: <Outlet />,
          children: [
            {
              path: 'list',
              element: <LoginWrapper router={<EvidenceMainPage />} title={'증거목록'} />,
              errorElement: <Error />,
            },
            {
              path: 'search',
              element: <LoginWrapper router={<EvidenceMainPage />} title={'증거검색'} />,
              errorElement: <Error />,
            },

            {
              path: 'pdf',
              element: <Outlet />,
              errorElement: <Error />,
              children: [
                {
                  path: ':evidenceId',
                  element: <LoginWrapper router={<EvidenceViewer />} title={'문서보기'} />,
                  errorElement: <Error />,
                },
              ],
            },
            {
              path: 'case-viewer',
              element: <Outlet />,
              errorElement: <Error />,
              children: [
                {
                  path: ':evidenceId',
                  element: <LoginWrapper router={<CaseViewerPage />} title={'문서보기'} />,
                  errorElement: <Error />,
                },
              ],
            },
            {
              path: 'case-tap',
              element: <Outlet />,
              errorElement: <Error />,
              children: [
                {
                  path: ':evidenceId',
                  element: <LoginWrapper router={<CaseTapPage />} title={'문서보기'} />,
                  errorElement: <Error />,
                },
              ],
            },
            {
              path: 'summary',
              element: <Outlet />,
              errorElement: <Error />,
              children: [
                {
                  path: ':evidenceId',
                  element: <LoginWrapper router={<EvidenceSummaryViewer />} title={'요약보기'} />,
                  errorElement: <Error />,
                },
              ],
            },
            {
              path: 'summaryPdf',
              element: <Outlet />,
              errorElement: <Error />,
              children: [
                {
                  path: ':evidenceId',
                  element: <LoginWrapper router={<EvidenceSummaryPdfPage />} title={'요약PDF보기'} />,
                  errorElement: <Error />,
                },
              ],
            },
            {
              path: 'text',
              element: <Outlet />,
              errorElement: <Error />,
              children: [
                {
                  path: ':evidenceId',
                  element: <LoginWrapper router={<EvidenceTextViewer />} title={'문서보기'} />,
                  errorElement: <Error />,
                },
              ],
            },
          ],
        },
        {
          path: LOGOUT_ROUTING_PATH.LOGOUT,
          element: <Navigate to='/' />,
          errorElement: <Error />,
        },
        {
          path: 'billing/success',
          element: <LoginWrapper router={<BillingSuccessPage />} title={'결제 성공'} />,
          errorElement: <Error />,
        },
        {
          path: 'billing/fail',
          element: <LoginWrapper router={<BillingFailPage />} title={'결제 실패'} />,
          errorElement: <Error />,
        },
      ],
    },
    {
      path: 'demo',
      element: <EvidenceDemoMainPage />,
      errorElement: <Error />,
    },
    {
      path: 'demo-viewer',
      element: <Navigate to='/demo' replace={true} />,
      errorElement: <Error />,
    },
    {
      path: 'demo-viewer/:evidenceId',
      element: <EvidenceDemoViewerPage />,
      errorElement: <Error />,
    },
    {
      path: 'demo-summary-pdf',
      element: <Navigate to='/demo' replace={true} />,
      errorElement: <Error />,
    },
    {
      path: 'demo-summary-pdf/:evidenceId',
      element: <EvidenceDemoSummaryPdfPage />,
      errorElement: <Error />,
    },
    {
      path: '/ai',
      element: <LoginWrapper router={<AIPage />} title={'AI'} />,
      errorElement: <Error />,
    },
    {
      path: 'policy',
      element: <PolicyPage />,
      errorElement: <Error />,
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ]);

  const loginRouter = isAdmin ? adminRouter : userRouter;

  return { loginRouter, logoutRouter };
};

export default Router;
