import { useEffect, useState } from 'react';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

const ContentRenderer = ({ selectedFilePath }: { selectedFilePath: string }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [fileType, setFileType] = useState<'html' | 'md' | ''>('');

  // NOTE: public/ 아래 파일명이 NFD(분해형 한글)로 저장된 케이스가 있어
  // 브라우저 요청 경로도 NFD로 정규화해서 404를 방지한다.
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const normalizedPath = selectedFilePath ? selectedFilePath.normalize('NFD') : '';
  const resolvedUrl = normalizedPath ? `${baseUrl}${encodeURI(normalizedPath)}` : '';

  useEffect(() => {
    const fetchAndRender = async () => {
      if (!selectedFilePath) return;

      const extension = selectedFilePath.split('.').pop()?.toLowerCase();
      if (extension === 'md' || extension === 'markdown') {
        setFileType('md');

        try {
          const res = await fetch(resolvedUrl);
          const buffer = await res.arrayBuffer();

          let decodedText = '';
          try {
            // 1차 시도: UTF-8
            decodedText = new TextDecoder('utf-8').decode(buffer);
          } catch (e) {
            console.log(e);
            try {
              decodedText = new TextDecoder('euc-kr').decode(buffer);
            } catch {
              decodedText = '[디코딩 실패]';
            }
          }

          const html = DOMPurify.sanitize(marked(decodedText) as string);
          setHtmlContent(html);
        } catch (err) {
          console.error('Error fetching or rendering Markdown file:', err);
          setHtmlContent('<p style="color:red;">파일을 불러오는 중 오류가 발생했습니다.</p>');
        }
      } else {
        setFileType('html');
      }
    };

    fetchAndRender();
  }, [resolvedUrl, selectedFilePath]);

  if (!selectedFilePath) {
    return (
      <div className='flex h-full items-center justify-center overflow-auto text-gray-500' style={{ minHeight: 0, height: '100%' }}>
        왼쪽 메뉴에서 항목을 선택해주세요
      </div>
    );
  }

  if (fileType === 'md') {
    return <div className='prose h-full max-w-none overflow-auto rounded bg-white p-6' dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }

  return (
    <div className='h-full w-full overflow-auto'>
      <iframe
        src={resolvedUrl}
        width='100%'
        height='100%'
        scrolling='auto'
        style={{ minHeight: '500px', background: '#fff' }}
        title='AI 분석 결과'
      />
    </div>
  );
};

interface IMenu {
  menu_id: string;
  menu_nm: string;
  display_order: number;
  file_url: string; // DEMO: public 파일명(경로)만 저장
}

interface IUserAnalysisCategory {
  category_nm: string;
  display_order: number;
  menus: IMenu[];
}

const DemoAIPage = (): JSX.Element => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');

  // DEMO: 메뉴는 API 호출 없이 프론트에서 고정 (public/*.html 로 매핑)
  const menuData: IUserAnalysisCategory[] = [
    {
      category_nm: '사건 개요',
      display_order: 1,
      menus: [
        {
          menu_id: 'case_timeline',
          menu_nm: '사건 타임라인',
          display_order: 1,
          file_url: 'full-timeline-events.html',
        },
        {
          menu_id: 'case_summary',
          menu_nm: '전체 사건 요약',
          display_order: 2,
          file_url: 'full-incident-summary.html',
        },
      ],
    },
    {
      category_nm: '인물 분석',
      display_order: 2,
      menus: [
        {
          menu_id: 'people_relation_text',
          menu_nm: '사건 인물 관계',
          display_order: 1,
          file_url: 'event-person-relationship.html',
        },
        {
          menu_id: 'people_relation_graph',
          menu_nm: '주요 인물 관계도',
          display_order: 2,
          file_url: 'character-relationship-chart.html',
        },
      ],
    },
    {
      category_nm: '진술 분석',
      display_order: 3,
      menus: [
        {
          menu_id: 'statement_summary',
          menu_nm: '진술 증거 정리 및 요약',
          display_order: 1,
          file_url: 'organize-and-summarize-statement.html',
        },
        {
          menu_id: 'statement_conflict',
          menu_nm: '진술 증거 상충 분석',
          display_order: 2,
          file_url: 'conflict-analysis-evidence.html',
        },
      ],
    },
    {
      category_nm: '증거 분석',
      display_order: 4,
      menus: [
        {
          menu_id: 'evidence_procon',
          menu_nm: '증거 유불리 분석',
          display_order: 1,
          file_url: 'advantage-or-disadvantage.html',
        },
      ],
    },
  ];

  const handleMenuClick = (menu: IMenu) => {
    setSelectedFilePath(menu.file_url);
    setSelectedMenuId(menu.menu_id);
  };

  // 메뉴 데이터가 로딩되면 첫 번째 메뉴를 자동으로 선택
  useEffect(() => {
    if (selectedFilePath) return;
    const firstCategory = menuData.find((category) => category.menus && category.menus.length > 0);
    if (firstCategory && firstCategory.menus.length > 0) {
      const firstMenu = firstCategory.menus[0];
      handleMenuClick(firstMenu);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilePath]);

  const menuStyle = (isSelected: boolean) => {
    return `flex items-center gap-[8px] pt-[15px] text-[16px] cursor-pointer pl-[16px] ${
      isSelected ? 'text-[#004AA4] font-semibold' : 'text-[#BABABA]'
    }`;
  };

  return (
    <>
      <div className='flex justify-center pt-[180px]'>
        <div id='evidence-table-body' className='mb-[20px] h-[calc(100vh-220px-20px)] w-[90%]'>
          <div className='flex h-full rounded-[16px] border-y border-[#E5E5E5]'>
            <div className='flex h-full w-[303px] flex-col overflow-y-auto rounded-[16px] border-l bg-white px-[24px] py-[32px] scrollbar-hide'>
              {menuData.map((category: IUserAnalysisCategory) => (
                <div key={category.category_nm} className='mb-[15px] mt-[40px] first:mt-0'>
                  <div className='text-[18px] font-semibold text-[#5B5B5B]'>{category.category_nm}</div>
                  <ul>
                    {category.menus?.map((menu: IMenu) => (
                      <li key={menu.menu_id} className={menuStyle(selectedMenuId === menu.menu_id)} onClick={() => handleMenuClick(menu)}>
                        {menu.menu_nm}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className='h-full flex-1 overflow-hidden rounded-r-[16px] border-r scrollbar-hide'>
              <div className='h-full w-full rounded-r-[16px] border-l border-r scrollbar-hide'>
                <ContentRenderer selectedFilePath={selectedFilePath} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoAIPage;
