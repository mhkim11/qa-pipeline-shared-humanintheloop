import { useEffect, useState } from 'react';

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useSearchParams } from 'react-router-dom';

import { MainHeader } from '@components/common';
import { useGetUserAnalysisMenuQuery } from '@/query/admin-ai-query';

const ContentRenderer = ({ selectedFileUrl }: { selectedFileUrl: string }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [fileType, setFileType] = useState<'html' | 'md' | ''>('');

  useEffect(() => {
    const fetchAndRender = async () => {
      if (!selectedFileUrl) return;

      const extension = selectedFileUrl.split('.').pop()?.toLowerCase();
      if (extension === 'md' || extension === 'markdown') {
        setFileType('md');

        try {
          const res = await fetch(selectedFileUrl);
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
  }, [selectedFileUrl]);

  if (!selectedFileUrl) {
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
        src={selectedFileUrl}
        width='100%'
        height='100%'
        scrolling='auto'
        style={{ minHeight: '500px', background: '#fff' }}
        title='AI 분석 결과'
      />
    </div>
  );
};

// 실제 API 응답 구조에 맞는 인터페이스 정의
interface IMenu {
  _id: string;
  menu_id: string;
  menu_nm: string;
  file_path: string;
  file_type: string;
  display_order: number;
  file_url: string;
}

interface IUserAnalysisCategory {
  project_id: string;
  category_nm: string;
  display_order: number;
  isEnabled: boolean;
  menus: IMenu[];
}

// API 응답 타입
interface IUserAnalysisMenuResponse {
  success: boolean;
  message: string;
  data: IUserAnalysisCategory[];
}

const AIPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project_id') || '';
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');

  // API로 메뉴 데이터 가져오기 - 타입 캐스팅으로 실제 응답 구조 사용
  const {
    data: menuData,
    isLoading,
    error,
  } = useGetUserAnalysisMenuQuery(projectId) as {
    data: IUserAnalysisMenuResponse | undefined;
    isLoading: boolean;
    error: any;
  };

  const BUCKET_BASE_URL = 'https://ailex.kr.object.ncloudstorage.com/';

  const handleMenuClick = (menu: IMenu) => {
    const url = menu.file_url || `${BUCKET_BASE_URL}${menu.file_path}`;
    setSelectedFileUrl(url);
    setSelectedMenuId(menu.menu_id);
  };

  // 메뉴 데이터가 로딩되면 첫 번째 메뉴를 자동으로 선택
  useEffect(() => {
    if (menuData?.data && !selectedFileUrl) {
      // 첫 번째 카테고리의 첫 번째 메뉴를 찾아서 자동 선택
      const firstCategory = menuData.data.find((category) => category.menus && category.menus.length > 0);
      if (firstCategory && firstCategory.menus.length > 0) {
        const firstMenu = firstCategory.menus[0];
        handleMenuClick(firstMenu);
      }
    }
  }, [menuData, selectedFileUrl]);

  const menuStyle = (isSelected: boolean) => {
    return `flex items-center gap-[8px] pt-[15px] text-[16px] cursor-pointer pl-[16px] ${
      isSelected ? 'text-[#004AA4] font-semibold' : 'text-[#BABABA]'
    }`;
  };

  if (error) {
    return <div>메뉴를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <>
      <MainHeader />
      <div className='flex justify-center pt-[180px]'>
        <div id='evidence-table-body' className='mb-[20px] h-[calc(100vh-220px-20px)] w-[90%]'>
          <div className='flex h-full rounded-[16px] border-y border-[#E5E5E5]'>
            <div className='flex h-full w-[303px] flex-col overflow-y-auto rounded-[16px] border-l bg-white px-[24px] py-[32px] scrollbar-hide'>
              {isLoading ? (
                <div>메뉴 로딩중...</div>
              ) : (
                menuData?.data?.map((category: IUserAnalysisCategory) => (
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
                ))
              )}
            </div>
            <div className='h-full flex-1 overflow-hidden rounded-r-[16px] border-r scrollbar-hide'>
              <div className='h-full w-full rounded-r-[16px] border-l border-r scrollbar-hide'>
                <ContentRenderer selectedFileUrl={selectedFileUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIPage;
