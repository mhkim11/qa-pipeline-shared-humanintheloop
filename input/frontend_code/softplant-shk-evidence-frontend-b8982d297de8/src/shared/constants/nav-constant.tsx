import React from 'react';

type TLinkNav = {
  link: string;
  text: string;
  subTab?: TLinkNav[];
  icon?: React.ReactNode;
};

export type TLogoutRoutingPath = {
  LOGOUT: 'logout';
};

export type TLoginRoutingPath = {
  EVIDENCE: {
    INDEX: 'evidence';
  };
  SETTING: {
    INDEX: 'setting';
  };

  MEMO: {
    INDEX: 'memo';
  };

  CID: {
    INDEX: 'cid';
  };
};

export const LOGOUT_ROUTING_PATH: TLogoutRoutingPath = {
  LOGOUT: 'logout',
};

export const LOGIN_ROUTING_PATH: TLoginRoutingPath = {
  EVIDENCE: {
    INDEX: 'evidence',
  },
  SETTING: {
    INDEX: 'setting',
  },

  CID: {
    INDEX: 'cid',
  },
  MEMO: {
    INDEX: 'memo',
  },
};

export const calendarNav: TLinkNav[] = [
  {
    link: '/',
    text: 'main',
  },
];

export const saleNav: TLinkNav[] = [
  {
    link: '#',
    text: '',
  },
];

export const evidenceNav: TLinkNav[] = [
  {
    link: `/${LOGIN_ROUTING_PATH.EVIDENCE.INDEX}`,
    text: '증거 목록',
  },

  {
    link: '#',
    text: '증거 목록2',
  },
];

export const inventoryNav: TLinkNav[] = [];

export const bankNav: TLinkNav[] = [];

export const analysisNav: TLinkNav[] = [];

export const smsNav: TLinkNav[] = [];

export const settingNav: TLinkNav[] = [
  {
    link: `/${LOGIN_ROUTING_PATH.SETTING.INDEX}`,
    text: '세팅',
  },
  {
    link: `/${LOGIN_ROUTING_PATH.MEMO.INDEX}`,
    text: '메모관리',
  },
];
