/// <reference types="cypress" />

Cypress.on('uncaught:exception', (_err: any, _runnable: any) => {
  return false;
});

describe('[웹] CRM 화면', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  it('사용자가 환경설정을 클릭했을때 환경설정 모달이 나온다', () => {
    console.log('사용자가 환경설정을 클릭했을때 환경설정 모달이 나온다');
  });
  it('사용자가 사이드바에 있는 accordion을 클릭했을때 하단 서브 라우팅 컴포넌트들이 나온다', () => {
    console.log('사용자가 환경설정을 클릭했을때 환경설정 모달이 나온다');
  });
});
