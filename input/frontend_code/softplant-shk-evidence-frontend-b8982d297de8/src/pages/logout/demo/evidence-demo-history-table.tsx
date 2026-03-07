import { useCallback, useEffect, useMemo, useState } from 'react';

import { debounce } from 'lodash';
import { FiCheck, FiSearch } from 'react-icons/fi';
import { IoIosWarning, IoIosArrowDown, IoMdCloseCircle } from 'react-icons/io';
import { TbChessQueenFilled } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';

import HistoryFilter from '@/components/evidence/filter/history-filter';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { DEMO_PROJECT_ID } from '@/pages/logout/demo/demo-constants';
import 'react-datepicker/dist/react-datepicker.css';

type TListHistoryActionFilterData = {
  category_nm: string;
  types: { type: string }[];
};
export const DemoHistoryTable = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const _projectId = searchParams.get('project_id') || DEMO_PROJECT_ID;
  const _officeId = searchParams.get('officeId') || '';
  const fontSizeAdjustment = 0;

  const [itemsPerPage, setItemsPerPage] = useState(50);
  const itemsPerPageOptions = [50, 100, 150, 200];
  const [tempInput, setTempInput] = useState<string>('');
  // DEMO: API 호출 제거 (로컬 더미 데이터)
  const HistoryFilters = useMemo(
    () => [
      {
        user_id: 'demo_user_ailex',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail: false,
        thumbnail_url: '',
        isMe: true,
        isManager: true,
      },
    ],
    [],
  );

  const actionFilters: TListHistoryActionFilterData[] = useMemo(
    () => [
      { category_nm: '문서', types: [{ type: '태그 삭제' }, { type: '위치이동' }] },
      { category_nm: '검색', types: [{ type: '파워검색' }, { type: '간편검색' }] },
      { category_nm: '계정', types: [{ type: '로그인' }] },
    ],
    [],
  );
  // !페이지네이션 관련 상태
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [contentLength, setContentLength] = useState(50);
  const [titleLength, setTitleLength] = useState(60);
  const [searchKeyword, setSearchKeyword] = useState<string>(''); // 검색어 필터
  const [selectedPeriod, setSelectedPeriod] = useState<string>(''); // 기본값 7일
  const [selectedHistoryTypes, setSelectedHistoryTypes] = useState<string[]>([]);
  const [dateRangeText, setDateRangeText] = useState<string>('전체기간');
  const [contentOverflows, setContentOverflows] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // 폰트 크기 조정 옵션
  const fontSizeClasses = {
    18: ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    16: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    14: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
    12: ['text-2xs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  } as const;
  //  폰크크기 조정 클래스 선택
  const getFontSizeClass = (baseSize: keyof typeof fontSizeClasses, adjustment: number) => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    const index = steps.indexOf(adjustment);
    return fontSizeClasses[baseSize][index !== -1 ? index : 3]; // 기본값(0%)은 index 3
  };
  const colorPalette = {
    green: '#406CFF',
    brown: '#B6753F',
    orange: '#FF6B1B',
    yellow: '#F3AA00',
    lightgreen: '#3BBC07',
    darkgreen: '#799C19',
    skyblue: '#43A5FF',
    purple: '#AC58FF',
    pink: '#E739D5',
  };
  const getUserColor = (color: string) => {
    return colorPalette[color as keyof typeof colorPalette] || color;
  };

  const refetch = useCallback(() => {
    // DEMO: no-op (API 제거)
  }, []);

  const baseHistories = useMemo(
    () => [
      {
        history_id: 'demo_h_1',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '문서',
        type: '태그 삭제',
        title: '증거번호 1 고소장',
        content: '태그 삭제: 진술조서 (#F7F8F8)',
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-06T12:15:00+09:00',
      },
      {
        history_id: 'demo_h_2',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '검색',
        type: '파워검색',
        title: '',
        content: `포함:'피해자'`,
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-06T11:19:00+09:00',
      },
      {
        history_id: 'demo_h_3',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '계정',
        type: '로그인',
        title: '',
        content: '로그인했습니다.',
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-06T00:16:00+09:00',
      },
      {
        history_id: 'demo_h_4',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '계정',
        type: '로그인',
        title: '',
        content: '로그인했습니다.',
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-05T23:58:00+09:00',
      },
      {
        history_id: 'demo_h_5',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '문서',
        type: '위치이동',
        title: '증거번호 7 피해자 문동운 3차 진술...',
        content: '증거번호 2 언론 보도자료(문동운의 사건 관련 기사) 아래로 이동',
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-05T15:40:00+09:00',
      },
      {
        history_id: 'demo_h_6',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '검색',
        type: '간편검색',
        title: '',
        content: `포함:'상해'`,
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-05T14:20:00+09:00',
      },
      {
        history_id: 'demo_h_7',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '검색',
        type: '파워검색',
        title: '',
        content: `포함:'피해자' OR 포함:'진술'`,
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-05T13:11:00+09:00',
      },
      {
        history_id: 'demo_h_8',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '문서',
        type: '태그 삭제',
        title: '증거번호 3 진술조서',
        content: '태그 삭제: 고소장 (#F7F8F8)',
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-04T10:08:00+09:00',
      },
      {
        history_id: 'demo_h_9',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '검색',
        type: '간편검색',
        title: '',
        content: `포함:'문동운'`,
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-03T19:02:00+09:00',
      },
      {
        history_id: 'demo_h_10',
        user_nm: 'Ailex',
        nickname: 'A',
        user_color: 'green',
        thumbnail_url: '',
        category: '검색',
        type: '파워검색',
        title: '',
        content: `포함:'피해자' AND 포함:'상해'`,
        prev_content: '',
        related_id: '',
        reg_dt: '2026-01-02T09:25:00+09:00',
      },
    ],
    [],
  );
  const handleViewDocument = async (_evidenceId: string) => {
    // DEMO: API 없이 UI만 유지
    onMessageToast({
      message: '데모에서는 문서 보기를 지원하지 않습니다.',
      icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
    });
  };
  // 동적 폰트 크기 조정

  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };
  const formatDateTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // 요일 배열 (한글)
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = weekdays[dateObj.getDay()];

    // 날짜 형식 변경 (YYYY.MM.DD)
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    // 시간 형식 (HH:MM)
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day}(${dayOfWeek}) ${hours}:${minutes}`;
  };
  const formatDateOnly = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\./g, '')
      .trim();
  };

  const formatDateRange = (histories: any[]) => {
    if (!histories?.length) return '데이터 없음';

    const dates = histories.map((h) => new Date(h.reg_dt));
    const oldestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    return `${formatDateOnly(oldestDate)} ~ ${formatDateOnly(latestDate)}`;
  };
  const calculateStartDate = (period: string): { from: string; to: string } => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999); // 종료 날짜를 오늘 23:59:59로 설정

    const startDate = new Date(today);

    switch (period) {
      case 'all':
        return { from: '', to: '' };

      case 'yesterday': {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);

        return {
          from: yesterday.toISOString(),
          to: yesterdayEnd.toISOString(),
        };
      }

      case '3days':
        startDate.setDate(today.getDate() - 3);
        startDate.setHours(0, 0, 0, 0);
        break;

      case '7days':
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;

      case '1month':
        startDate.setMonth(today.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      default:
        return { from: '', to: '' };
    }

    return {
      from: startDate.toISOString(),
      to: endDate.toISOString(), // 전체 시간 포함
    };
  };

  // DEMO: 서버 필터링/페이지네이션을 로컬에서 흉내냄
  const filteredHistoriesAll = useMemo(() => {
    const keyword = (searchKeyword || '').trim();

    const byUser = selectedUserIds.length === 0 ? [] : selectedUserIds;

    const { from, to } = selectedPeriod && selectedPeriod !== 'all' ? calculateStartDate(selectedPeriod) : { from: '', to: '' };
    const fromTime = from ? new Date(from).getTime() : null;
    const toTime = to ? new Date(to).getTime() : null;

    return baseHistories
      .filter((h: any) => {
        if (byUser.length > 0 && !byUser.includes('demo_user_ailex')) return false;

        if (selectedHistoryTypes.length > 0 && !selectedHistoryTypes.includes(h.type)) return false;

        if (fromTime && toTime) {
          const t = new Date(h.reg_dt).getTime();
          if (Number.isFinite(t) && (t < fromTime || t > toTime)) return false;
        }

        if (keyword.length >= 2) {
          const k = keyword.toLowerCase();
          return (
            String(h.content || '')
              .toLowerCase()
              .includes(k) ||
            String(h.user_nm || '')
              .toLowerCase()
              .includes(k) ||
            String(h.category || '')
              .toLowerCase()
              .includes(k) ||
            String(h.type || '')
              .toLowerCase()
              .includes(k) ||
            String(h.title || '')
              .toLowerCase()
              .includes(k)
          );
        }

        return true;
      })
      .sort((a: any, b: any) => new Date(b.reg_dt).getTime() - new Date(a.reg_dt).getTime());
  }, [baseHistories, searchKeyword, selectedHistoryTypes, selectedPeriod, selectedUserIds]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(filteredHistoriesAll.length / Math.max(1, itemsPerPage));
    return Math.max(1, pages);
  }, [filteredHistoriesAll.length, itemsPerPage]);

  useEffect(() => {
    if (selectedPage > totalPages) setSelectedPage(1);
  }, [selectedPage, totalPages]);

  const filteredHistories = useMemo(() => {
    const start = (selectedPage - 1) * itemsPerPage;
    return filteredHistoriesAll.slice(start, start + itemsPerPage);
  }, [filteredHistoriesAll, itemsPerPage, selectedPage]);

  const HistoryList = useMemo(() => {
    return {
      histories: filteredHistories,
      pagination: {
        total: filteredHistoriesAll.length,
        total_pages: totalPages,
      },
    };
  }, [filteredHistories, filteredHistoriesAll.length, totalPages]);
  // 날짜 필터 핸들러 수정
  const handleDateFilter = (period: string) => {
    setSelectedPeriod(period);
    setSelectedPage(1);

    if (period === 'all') {
      setDateRangeText('전체기간');
    } else {
      setDateRangeText(
        period === 'yesterday'
          ? '어제'
          : period === '3days'
            ? '3일'
            : period === '7days'
              ? '1주일'
              : period === '1month'
                ? '1개월'
                : '전체기간',
      );
    }

    refetch();
  };

  const handleCheckboxChange = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };
  // ! 페이지네이션 함수
  const handlePageMove = (page = selectedPage) => {
    const totalPagesCount = HistoryList?.pagination?.total_pages ?? 1;
    if (page < 1 || page > totalPagesCount) {
      onMessageToast({
        message: `1 ~ ${totalPagesCount} 사이의 숫자를 입력해주세요.`,
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }
    setSelectedPage(page);
    refetch();
  };

  // const totalActions = HistoryFilters?.reduce((sum, filter) => sum + filter.count, 0) || 0;

  const handleSearchChange = debounce((value: string) => {
    if (value.length >= 2) {
      setSearchKeyword(value);
      refetch();
    } else {
      setSearchKeyword('');
    }
  }, 500);

  const getDateRangeText = (period: string): string => {
    const today = new Date();
    const startDate = new Date(today);

    switch (period) {
      case 'all':
        return HistoryList?.histories ? formatDateRange(HistoryList.histories) : '전체기간';
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        return formatDateOnly(startDate);
      case '3days':
        startDate.setDate(today.getDate() - 3);
        return `${formatDateOnly(startDate)} ~ ${formatDateOnly(today)}`;
      case '7days':
        startDate.setDate(today.getDate() - 7);
        return `${formatDateOnly(startDate)} ~ ${formatDateOnly(today)}`;
      case '1month':
        startDate.setMonth(today.getMonth() - 1);
        return `${formatDateOnly(startDate)} ~ ${formatDateOnly(today)}`;
      default:
        return '전체기간';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tempInput.length >= 2) {
        setSearchKeyword(tempInput);
        refetch();
      } else if (tempInput.length === 0) {
        setSearchKeyword('');
        refetch();
      } else {
        onMessageToast({
          message: '검색어는 2글자 이상 입력해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    }
  };

  //  검색 버튼 클릭 함수
  const handleSearchClick = () => {
    if (tempInput.length >= 2) {
      setSearchKeyword(tempInput);
      refetch();
    } else if (tempInput.length === 0) {
      setSearchKeyword('');
      refetch();
    } else {
      onMessageToast({
        message: '검색어는 2글자 이상 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  const limitTitleLength = (title: string) => {
    return title.length > 20 ? `${title.substring(0, 20)}...` : title;
  };
  //  클리어 버튼 함수
  const handleClearInput = () => {
    setTempInput('');
    setSearchKeyword('');
    refetch();
  };
  const MAX_TEXT_LENGTH = 80;
  const checkTextOverflow = (title: string, content: string, prevContent: string, historyId: string) => {
    const fullContent = `${title} ${content}${prevContent ? ` (기존메모: ${prevContent})` : ''}`;
    const isOverflowing = fullContent.length > MAX_TEXT_LENGTH;

    // 상태 업데이트 (변경된 경우에만)
    if (isOverflowing !== contentOverflows[historyId]) {
      setContentOverflows((prev) => ({
        ...prev,
        [historyId]: isOverflowing,
      }));
    }

    return isOverflowing;
  };
  //  입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempInput(value);
    // 기존 디바운스 로직 유지
    handleSearchChange(value);
  };
  // DEMO: filteredHistories는 위에서(로컬) 계산됨

  const handleShowMore = (historyId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [historyId]: !prev[historyId],
    }));
  };

  useEffect(() => {
    if (selectAll) {
      setSelectedUserIds(HistoryFilters?.map((filter) => filter.user_id) || []);
    } else {
      setSelectedUserIds([]);
    }
  }, [selectAll, HistoryFilters]);

  useEffect(() => {
    /*    setSelectedPage(1);  */
    refetch();
  }, [itemsPerPage, selectedPage, selectedPeriod, selectedHistoryTypes, selectedUserIds, searchKeyword, refetch]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 2560)
        setContentLength(60); // 2xl
      else if (window.innerWidth >= 1920) setContentLength(30);
      else if (window.innerWidth >= 1680) setContentLength(20);
      else if (window.innerWidth >= 1280)
        setContentLength(20); // xl
      else setContentLength(20); // 기본
    };
    const handleTitleResize = () => {
      if (window.innerWidth >= 2560)
        setTitleLength(60); // 2xl
      else if (window.innerWidth >= 1920) setTitleLength(60);
      else if (window.innerWidth >= 1680) setTitleLength(40);
      else if (window.innerWidth >= 1280) setTitleLength(40);
      else setTitleLength(30); // 기본
    };

    handleResize(); // 초기 설정
    handleTitleResize(); // 초기 설정
    window.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleTitleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleTitleResize);
    };
  }, []);
  return (
    <>
      <div className='flex justify-center pt-[180px]'>
        <div id='historyBody' className='w-[90%]'>
          <div className='w-full'>
            <div className='relative top-[-60px] z-10 flex rounded-[5px] bg-white'>
              <div className='absolute right-0 hidden items-center justify-end lg:flex'>
                <div className='relative'>
                  <FiSearch
                    className='absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer text-[25px] text-gray-500'
                    onClick={handleSearchClick}
                  />
                  <input
                    type='text'
                    className='ml-4 h-[48px] w-[280px] rounded-md border border-gray-300 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#0050B3]'
                    placeholder='검색어를 입력해주세요'
                    value={tempInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                  {tempInput && (
                    <IoMdCloseCircle
                      className='absolute right-12 top-1/2 -translate-y-1/2 transform cursor-pointer text-xl text-gray-500'
                      onClick={handleClearInput}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='max-w-[320px ] h-full max-h-[calc(100vh-300px)] min-h-[calc(100vh-300px)] min-w-[150px] overflow-y-auto rounded-l-[8px] border-y border-l bg-white lg:min-w-[290px]'>
              <div className='flex h-[52px] items-center border-b p-[16px]'>
                <input
                  type='checkbox'
                  className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#0050B3] outline-none focus:ring-0'
                  checked={selectAll}
                  onChange={() => setSelectAll((prev) => !prev)}
                />
                <div
                  className={`ml-2 w-full justify-between lg:flex hidden${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  <div className='hidden w-full text-[14px] text-[#252525] lg:flex'>전체 {HistoryFilters?.length}명</div>
                  <div className='flex w-full justify-end text-[12px] text-[#1890FF]'> {selectedUserIds.length}명 선택</div>
                </div>
              </div>

              {HistoryFilters?.map((filter) => (
                <div key={filter.user_id} className='flex h-[50px] items-center justify-between px-4'>
                  <div className='flex h-[50px] w-full items-center'>
                    <input
                      type='checkbox'
                      className='h-[20px] w-[20px] rounded-[2px] border-[#CCD0D1] text-[#0050B3] outline-none focus:ring-0'
                      checked={selectedUserIds.includes(filter.user_id)}
                      onChange={() => handleCheckboxChange(filter.user_id)}
                    />
                    <div className='flex w-full items-center'>
                      <div className='ml-2 flex items-center'>
                        {filter.thumbnail ? (
                          <div className='relative h-[24px] w-[24px]'>
                            <img
                              className='h-[24px] w-[24px] rounded-full'
                              src={filter.thumbnail_url}
                              alt=''
                              onError={(e) => {
                                // 이미지 로딩 실패 시 디버깅 정보 출력
                                console.error('Filter image loading failed:', {
                                  url: filter.thumbnail_url,
                                  error: e,
                                  user: filter.user_nm,
                                });

                                // 이미지 로딩 실패 시 기본 아바타로 대체
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallbackAvatar = document.createElement('div');
                                  fallbackAvatar.className =
                                    'flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] text-white';
                                  fallbackAvatar.style.backgroundColor = getUserColor(filter.user_color);
                                  fallbackAvatar.textContent = filter.nickname
                                    ? filter.nickname?.charAt(0)
                                    : filter.user_nm
                                      ? filter.user_nm?.slice(1, 2)
                                      : '';
                                  parent.appendChild(fallbackAvatar);
                                }
                              }}
                              onLoad={() => {
                                // 이미지 로딩 성공 시 로그
                                console.log('Filter image loaded successfully:', filter.thumbnail_url);
                              }}
                            />
                            <div
                              className='absolute top-0 h-[24px] w-[24px] rounded-full border-2'
                              style={{
                                borderColor: getUserColor(filter.user_color),
                              }}
                            ></div>
                          </div>
                        ) : (
                          <div
                            className='flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] text-white'
                            style={{
                              backgroundColor: getUserColor(filter.user_color),
                            }}
                          >
                            {filter.nickname ? filter.nickname?.charAt(0) : filter.user_nm ? filter.user_nm?.slice(1, 2) : ''}
                          </div>
                        )}
                      </div>

                      <div
                        className={`ml-2 max-w-[70px] truncate ${getFontSizeClass(14, fontSizeAdjustment)}`}
                        style={{ fontSize: `${getAdjustedSize(14)}px` }}
                      >
                        {filter.user_nm}
                      </div>

                      <div className='flex items-center'>
                        {(filter.isMe || filter.isManager) && (
                          <div className='flex items-center text-[14px]'>
                            {filter.isMe && filter.isManager ? (
                              <div className='flex items-center'>
                                <div className='ml-1 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F5F5F5] text-[12px]'>
                                  나
                                </div>
                                <div className='ml-1 flex h-[26px] w-[96px] items-center justify-center rounded-full bg-[#545454] text-[12px] text-white'>
                                  <TbChessQueenFilled className='mr-1 text-[12px]' />
                                  사건관리자{' '}
                                </div>
                              </div>
                            ) : filter.isMe ? (
                              <div className='ml-1 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F5F5F5] text-[12px]'>
                                나
                              </div>
                            ) : filter.isManager ? (
                              <div className='ml-1 flex h-[26px] w-[96px] items-center justify-center rounded-full bg-[#545454] text-[12px] text-white'>
                                <TbChessQueenFilled className='mr-1 text-[12px]' />
                                사건관리자
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='evidence-table-scroll max-h-[calc(100vh-300px)] min-h-[calc(100vh-300px)] w-full overflow-y-auto rounded-r-[8px] border 2xl:max-h-[calc(100vh-300px)] 2xl:min-h-[calc(100vh-300px)]'>
              <table className='w-full'>
                <thead className='sticky top-0 z-10 h-[55px] bg-[#E6EFFF]'>
                  <tr className=''>
                    <th
                      scope='col'
                      className={`w-[15%] pl-[24px] text-left text-sm font-semibold text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(12)}px` }}
                    >
                      이름
                    </th>
                    <th scope='col' className='flex h-[55px] items-center text-left text-sm font-semibold text-gray-900'>
                      <HistoryFilter
                        column='액션'
                        options={actionFilters}
                        onFilter={(values) => {
                          setSelectedHistoryTypes(values);
                        }}
                      />
                    </th>
                    <th
                      className={`w-[50%] items-center text-left text-sm font-semibold text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(12)}px` }}
                    >
                      액션 상세
                    </th>
                    <th
                      scope='col'
                      className={`relative w-[30%] text-left text-sm font-semibold text-[#252525] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                      style={{ fontSize: `${getAdjustedSize(12)}px` }}
                    >
                      <Popover>
                        <PopoverTrigger className='flex w-[230px] items-center'>
                          날짜 {selectedPeriod === 'all' ? `(${dateRangeText})` : `(${getDateRangeText(selectedPeriod)})`}
                          <IoIosArrowDown className='h-4 w-4 text-[15px] text-[#8e8e8e]' />
                        </PopoverTrigger>

                        <PopoverContent className='p-0' align='start'>
                          <div className='flex flex-col'>
                            <button
                              className={`h-[44px] rounded-t-[8px] pl-[16px] text-left ${
                                selectedPeriod === 'all' ? 'bg-[#F4FAFB] font-medium' : 'hover:bg-[#F4FAFB]'
                              }`}
                              onClick={() => handleDateFilter('all')}
                            >
                              <div className='flex items-center justify-between'>
                                <div>전체기간</div>
                                {selectedPeriod === 'all' && <FiCheck className='mr-[18px] h-4 w-4 text-[#000]' />}
                              </div>
                            </button>
                            <button
                              className={`h-[44px] pl-[16px] text-left ${
                                selectedPeriod === 'yesterday' ? 'bg-[#F4FAFB] font-medium' : 'hover:bg-[#F4FAFB]'
                              }`}
                              onClick={() => handleDateFilter('yesterday')}
                            >
                              <div className='flex items-center justify-between'>
                                <div>어제</div>
                                {selectedPeriod === 'yesterday' && <FiCheck className='mr-[18px] h-4 w-4 text-[#000]' />}
                              </div>
                            </button>
                            <button
                              className={`h-[44px] pl-[16px] text-left ${
                                selectedPeriod === '3days' ? 'bg-[#F4FAFB] font-medium' : 'hover:bg-[#F4FAFB]'
                              }`}
                              onClick={() => handleDateFilter('3days')}
                            >
                              <div className='flex items-center justify-between'>
                                <div>3일</div>
                                {selectedPeriod === '3days' && <FiCheck className='mr-[18px] h-4 w-4 text-[#000]' />}
                              </div>
                            </button>
                            <button
                              className={`h-[44px] pl-[16px] text-left ${
                                selectedPeriod === '7days' ? 'bg-[#F4FAFB] font-medium' : 'hover:bg-[#F4FAFB]'
                              }`}
                              onClick={() => handleDateFilter('7days')}
                            >
                              <div className='flex items-center justify-between'>
                                <div>1주일</div>
                                {selectedPeriod === '7days' && <FiCheck className='mr-[18px] h-4 w-4 text-[#000]' />}
                              </div>
                            </button>
                            <button
                              className={`h-[44px] rounded-b-[8px] pl-[16px] text-left ${
                                selectedPeriod === '1month' ? 'bg-[#F4FAFB] font-medium' : 'hover:bg-[#F4FAFB]'
                              }`}
                              onClick={() => handleDateFilter('1month')}
                            >
                              <div className='flex items-center justify-between'>
                                <div>1개월</div>
                                {selectedPeriod === '1month' && <FiCheck className='mr-[18px] h-4 w-4 text-[#000]' />}
                              </div>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </th>
                  </tr>
                </thead>
                <tbody className=''>
                  {/* 데이터가 없을 때 */}
                  {filteredHistories?.length === 0 && selectedPage > 1 ? (
                    <tr className='h-[400px] w-full'>
                      <td colSpan={4} className='px-10 py-10 text-center text-sm text-gray-500'>
                        <div className='flex flex-col items-center gap-2'>
                          <p>현재 페이지에 표시할 히스토리가 없습니다.</p>
                          <button
                            onClick={() => {
                              setSelectedPage(1);
                              refetch();
                            }}
                            className='rounded-md bg-[#0050B3] px-4 py-2 text-sm text-white hover:bg-[#004AA4]'
                          >
                            1페이지로 이동
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredHistories?.length === 0 ? (
                    <tr className='h-[400px] w-full'>
                      <td colSpan={4} className='px-10 py-10 text-center text-sm text-gray-500'>
                        <p>히스토리 내용이 없습니다.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistories?.map((history) => (
                      <tr key={history.history_id} className='h-[48px] border-b'>
                        <td className='w-[15%] whitespace-nowrap pl-[24px] text-sm font-medium text-gray-900'>
                          <div className='flex items-center'>
                            {history.thumbnail_url &&
                            history.thumbnail_url !== '' &&
                            history.thumbnail_url !== 'https://kr.object.ncloudstorage.com/ailex-bucket/' ? (
                              <div className='relative h-[24px] w-[24px]'>
                                <img
                                  src={history.thumbnail_url}
                                  alt='profile'
                                  className='h-full w-full rounded-full'
                                  onError={(e) => {
                                    // 이미지 로딩 실패 시 디버깅 정보 출력
                                    console.error('Image loading failed:', {
                                      url: history.thumbnail_url,
                                      error: e,
                                      user: history.user_nm,
                                    });

                                    // 이미지 로딩 실패 시 기본 아바타로 대체
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const fallbackAvatar = document.createElement('div');
                                      fallbackAvatar.className =
                                        'flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] text-white';
                                      fallbackAvatar.style.backgroundColor = getUserColor(history.user_color);
                                      fallbackAvatar.textContent = history.nickname
                                        ? history.nickname.charAt(0)
                                        : history.user_nm
                                          ? history.user_nm.slice(1, 2)
                                          : '';
                                      parent.appendChild(fallbackAvatar);
                                    }
                                  }}
                                  onLoad={() => {
                                    // 이미지 로딩 성공 시 로그
                                    console.log('Image loaded successfully:', history.thumbnail_url);
                                  }}
                                />
                                <div
                                  className='absolute top-0 h-[24px] w-[24px] rounded-full border-2'
                                  style={{
                                    borderColor: getUserColor(history.user_color),
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                style={{
                                  backgroundColor: getUserColor(history.user_color),
                                }}
                                className='flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] text-white'
                              >
                                {history.nickname ? history.nickname.charAt(0) : history.user_nm ? history.user_nm.slice(1, 2) : ''}
                              </div>
                            )}
                            <div
                              className={`max-w-[80px] truncate pl-[8px] text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                              style={{ fontSize: `${getAdjustedSize(14)}px` }}
                            >
                              {history.user_nm}
                            </div>
                          </div>
                        </td>
                        <td
                          className={`w-[20%] whitespace-nowrap text-sm text-gray-500 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {history.type}
                        </td>
                        {history.prev_content ? (
                          <td className='w-[50%] pr-[40px] text-sm text-gray-500'>
                            <div className='relative'>
                              {(() => {
                                // 렌더링 시 오버플로우 확인
                                const isOverflow = checkTextOverflow(
                                  history.title || '',
                                  history.content || '',
                                  history.prev_content || '',
                                  history.history_id,
                                );

                                if (expandedItems[history.history_id]) {
                                  // 확장된 상태 - 모든 내용 표시
                                  return (
                                    <div className='text-[14px] text-[#252525]'>
                                      <strong
                                        className='mr-1 cursor-pointer font-normal text-[#1890FF] underline'
                                        onClick={() => handleViewDocument(history.related_id || '')}
                                      >
                                        {limitTitleLength(history.title || '')}
                                      </strong>
                                      {history.content} (기존메모: {history.prev_content})
                                      <span
                                        className='ml-1 inline cursor-pointer text-[#1890FF]'
                                        onClick={() => handleShowMore(history.history_id)}
                                      >
                                        접기
                                      </span>
                                    </div>
                                  );
                                } else {
                                  const fullContent = `${history.title} ${history.content} (기존메모: ${history.prev_content})`;
                                  const displayContent = isOverflow ? `${fullContent.substring(0, MAX_TEXT_LENGTH)}... ` : fullContent;
                                  console.log(displayContent);
                                  return (
                                    <div className='line-clamp-2 text-[14px] text-[#252525]'>
                                      <strong
                                        className='mr-1 cursor-pointer font-normal text-[#1890FF] underline'
                                        onClick={() => handleViewDocument(history.related_id || '')}
                                      >
                                        {limitTitleLength(history.title || '')}
                                      </strong>
                                      {isOverflow ? `${history.content.substring(0, contentLength)}...` : history.content} (기존메모:{' '}
                                      {isOverflow ? `${history.prev_content.substring(10, contentLength)}...` : history.prev_content})
                                      {isOverflow && (
                                        <span
                                          className='ml-1 inline cursor-pointer text-[#1890FF]'
                                          onClick={() => handleShowMore(history.history_id)}
                                        >
                                          더보기
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </td>
                        ) : (
                          // prev_content가 없는 경우 부분을 다음과 같이 수정
                          <td className='w-[50%] text-sm text-gray-500'>
                            <div className='pr-[40px]'>
                              <div className='relative'>
                                {(() => {
                                  // 렌더링 시 오버플로우 확인 (빈 문자열 전달)
                                  const isOverflow = checkTextOverflow(
                                    history.title || '',
                                    history.content || '',
                                    '', // 빈 문자열 전달
                                    history.history_id,
                                  );

                                  if (expandedItems[history.history_id]) {
                                    // 확장된 상태 - 모든 내용 표시
                                    return (
                                      <div className='text-[14px] text-[#252525]'>
                                        <strong
                                          className='mr-1 cursor-pointer font-normal text-[#1890FF] underline'
                                          onClick={() => handleViewDocument(history.related_id || '')}
                                        >
                                          {limitTitleLength(history.title || '')}
                                        </strong>
                                        {history.content}
                                        <span
                                          className='ml-1 inline cursor-pointer text-[#1890FF]'
                                          onClick={() => handleShowMore(history.history_id)}
                                        >
                                          접기
                                        </span>
                                      </div>
                                    );
                                  } else {
                                    // 축소된 상태
                                    return (
                                      <div className='line-clamp-2 text-[14px] text-[#252525]'>
                                        <strong
                                          className='mr-1 cursor-pointer font-normal text-[#1890FF] underline'
                                          onClick={() => handleViewDocument(history.related_id || '')}
                                        >
                                          {limitTitleLength(history.title || '')}
                                        </strong>
                                        {isOverflow ? `${history.content.substring(0, titleLength)}... ` : history.content}
                                        {isOverflow && (
                                          <span
                                            className='inline cursor-pointer text-[#1890FF]'
                                            onClick={() => handleShowMore(history.history_id)}
                                          >
                                            더보기
                                          </span>
                                        )}
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </td>
                        )}

                        <td
                          className={`w-[30%] whitespace-nowrap text-sm text-gray-500 ${getFontSizeClass(14, fontSizeAdjustment)}`}
                          style={{ fontSize: `${getAdjustedSize(14)}px` }}
                        >
                          {formatDateTime(history.reg_dt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className='fixed bottom-0 flex h-[78px] w-full items-center justify-center bg-white shadow-inner'>
        <div className='flex w-[85%] items-center justify-between 2xl:w-[70%]'>
          <div className='hidden items-center justify-center text-[12px] lg:flex'>
            <p className='text-[#5b5b5b]'>전체 히스토리 </p>
            <p className='pl-[4px] text-[#212121]'>{HistoryList?.pagination.total}개</p>
          </div>
          <div className='flex items-center justify-center'>
            <EvidencePagination
              currentPage={selectedPage}
              totalPages={HistoryList?.pagination.total_pages || 0}
              onPageChange={(page) => {
                setSelectedPage(page);
                refetch();
              }}
            />
            <div className='ml-[24px] hidden items-center justify-center lg:flex'>
              <input
                type='text'
                value={selectedPage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setSelectedPage(Number(value));
                  }
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value);

                  handlePageMove(value);
                }}
                placeholder='페이지 번호 입력'
                className='h-[32px] w-[50px] rounded border border-[#C0D5DE] border-gray-400 p-2 text-[14px] focus:border-[#2B7994] focus:outline-none focus:ring-0'
              />
              <span className='pl-[8px] pr-2 text-[14px]'>/</span>
              <span className='text-[14px]'>{HistoryList?.pagination.total_pages || 0}</span>
              <button
                onClick={() => handlePageMove(selectedPage)}
                className='ml-2 h-[32px] w-[50px] rounded border text-[14px] text-[#313131]'
              >
                이동
              </button>
            </div>
          </div>

          {/* 페이지당 문서 개수 선택 드롭다운 */}
          <Select
            defaultValue='50'
            value={itemsPerPage?.toString()}
            onValueChange={(value) => {
              const newValue = Number(value);
              setItemsPerPage(newValue);
              setSelectedPage(1);
              refetch();
            }}
          >
            <SelectTrigger className='h-[32px] w-[120px]'>
              <SelectValue placeholder='페이지당 개수' />
            </SelectTrigger>
            <SelectContent className='w-[200px]'>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  <p className='text-[12px]'>{option}개씩 보기</p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
