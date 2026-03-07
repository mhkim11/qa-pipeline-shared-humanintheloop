import { useState } from 'react';

import { CgClose } from 'react-icons/cg';

// interface IInputs {
//   detail: string;
// }
interface IQuickContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const Detail = [
  {
    detail: `# 진술서 주요내용

## 기본 정보
1. **진술인 확인**: 진술인은 정영훈 본인임.
2. **조사 방식**: 진술인은 영상 녹화를 요청.
3. **건강 상태**: 특별한 이상 없음.
4. **학력 및 경력**:
   - 1987년 서울 백석중학교 졸업.
   - 1990년 서울 화곡고등학교 졸업.
   - 1998년 연세대학교 경제학과 졸업.
   - 1994~1996년 카츄사 복무.
   - 1998~1999년 하나은행 근무.
   - 2000년부터 현재까지 KT에 재직 중.

## 가족관계
1. **가족 구성**: 부모, 아내, 아들 2명.
2. **아내 직업**: 공립고등학교 교사.
3. **부모와 거주 여부**: 따로 거주 중.
4. **형사처벌 및 수사 기관 조사 경력**: 없음, 단 서울중앙지방검찰청에서 참고인 조사 경험 있음.

## 현재 직무
1. **직위 및 역할**: KT 전략투자실 산하 전략투자1담당(상무보)로 전략투자 업무 담당.
2. **부서 경력**: 여러 부서를 순환하며 다양한 직무 수행.

## 조직 및 인적 구성 관련
1. **KT 전략투자실 역할**: 투자 기회 검토 및 실행, 사업부서 및 경영진 요청에 의해 활동.
2. **투자 기회 생성 여부**: 과거 일부 기업에 대해 투자 기회를 생성한 경험 있음, 현재는 없음.
3. **현대자동차와의 자사주 교환 관련**: 보안 사항으로 인해 정확한 계획 시점은 알지 못하지만, 변동 및 제휴 추진 경험 있음.
4. **KT Transformations 부문**: 여러 부서의 조직 구성 관련 사항 확인.
5. **KT Cloud/IDC 사업추진실 역할**: 클라우드 및 IDC 사업을 아우르는 부서.

## 스파크 인수 관련
1. **스파크 인수 검토 경과**: 스파크 인수 과정에서 다양한 인사들과의 회의를 거쳤으며, 경영권 확보 및 계약 연장 리스크에 대한 신중한 검토를 지속함.
2. **인수 의향서 제출**: 구속력 없는 인수의향서를 KT 전략투자실에서 제출, 중간 인수 주체로서의 법적 근거에 대해 논의.
3. **일정 조정 및 실사**: 스파크 인수의 일정 조정과 실사 관련 팀 구성에 대해 필요한 자료를 요청받음.
4. **실사 과정의 신속성**: 윤동식이 스파크 인수를 신속하게 실행하고자 했던 배경 설명.

## 추가 확인 사항
1. **유익한 추가 진술**: 없음.
2. **조서 내용 일치 여부**: 진술 내용과 상이한 부분 없음.
3. **추가 조사의 필요성**: 2023년 11월 8일에 추가 조사 받을 의사 확인.`,
  },
];

function QuickContactModal({ isOpen, onClose }: IQuickContactModalProps) {
  const [detail, setDetail] = useState<string>(Detail[0].detail); // 초기값 설정

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetail(e.target.value); // 사용자가 입력한 값 업데이트
  };
  return (
    <div className={`fixed inset-0 z-20 flex items-center justify-center bg-[#999] bg-opacity-80 ${isOpen ? '' : 'hidden'}`}>
      <div className='relative h-auto overflow-scroll bg-white p-8 shadow-lg lg:min-w-[900px] lg:max-w-[900px]'>
        <div className='absolute right-10 cursor-pointer text-[#334A49] hover:scale-110' onClick={onClose}>
          <CgClose className='text-2xl' />
        </div>
        <h2 className='mb-4 text-xl font-bold'>요약 </h2>

        <div>
          <textarea
            name='detail'
            value={detail} // 상태값을 textarea에 바인딩
            onChange={handleChange} // 입력값 변경 이벤트 핸들러
            className='mb-2 h-64 w-full border border-gray-300 p-2 focus:border-none focus:outline-none focus:ring focus:ring-gray-500'
          />
        </div>

        <div>
          <button className='mt-4 w-full rounded-lg bg-teal-500 p-2 text-white hover:font-bold'>저장</button>
        </div>
      </div>
    </div>
  );
}

export default QuickContactModal;
