import { RefObject } from 'react';

interface IPrivacyPolicySectionProps {
  privacyRef: RefObject<HTMLDivElement>;
}

/**
 * 개인정보처리방침 섹션 컴포넌트
 */
export const PrivacyPolicySection = ({ privacyRef }: IPrivacyPolicySectionProps) => {
  return (
    <section id='service' ref={privacyRef}>
      <h1 className='mt-10 text-[23px] font-bold'>(필수) 개인정보처리방침</h1>
      <h2 className='mt-10 text-[23px] font-bold'>A2D2 개인정보처리방침</h2>
      <p className='pt-4'>
        주식회사 A2D2(이하 '회사')는 정보통신서비스 제공자가 준수하여야 하는 『개인정보 보호법』, 『정보통신망 이용촉진 및 정보보호 등에
        관한 법률 등 개인정보보호 관련 법령』을 준수하여 이용자의 동의를 기반으로 개인정보를 수집·이용·제공합니다. 개인정보처리방침에
        변동사항이 생길 경우 사이트 내에 고지할 것입니다.
      </p>

      <div className='mt-10'>
        <h3 className='text-lg font-bold'>1. 개인정보 이용 목적</h3>
        <p className='pt-4'>
          회사는 다음과 같은 목적을 위해 개인정보를 처리합니다. 회사는 정보의 활용 범위를 해당 목적에 한정하며, 목적 변경 시에는 관련 법령에
          따라 이용자에게 사전 동의를 구합니다.
        </p>

        <h4 className='text-md mt-6 font-bold'>1.1 회원 관리 및 서비스 운영</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>회원 가입 및 탈퇴 절차의 처리.</li>
          <li>본인 인증, 연령 확인, 법적 동의 요건 충족.</li>
          <li>서비스 약관 및 법령 위반 방지를 위한 이용자 식별 및 관리.</li>
          <li>불법·부정 사용 방지 및 계정 보호.</li>
          <li>공지사항 전달 및 이용자 문의 대응.</li>
        </ul>

        <h4 className='text-md mt-6 font-bold'>1.2 서비스 제공 및 개선</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>계약 체결 및 서비스 제공을 위한 필수 정보 처리.</li>
          <li>결제 및 정산, 거래 내역 확인, 영수증 발급.</li>
          <li>서비스 사용 통계 분석을 통한 운영 효율화.</li>
          <li>신규 기능 개발 및 맞춤형 서비스 제공.</li>
        </ul>

        <h4 className='text-md mt-6 font-bold'>1.3 민원 관리 및 분쟁 대응</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>이용자 요청사항 확인 및 문제 해결.</li>
          <li>민원 처리 과정에서의 신원 확인 및 결과 안내.</li>
          <li>분쟁 상황에서의 관련 자료 기록 및 보존.</li>
        </ul>

        <h4 className='text-md mt-6 font-bold'>1.4 마케팅 및 커뮤니케이션 (선택 동의)</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>이벤트 및 프로모션 정보 제공.</li>
          <li>이용자 특성에 맞는 광고 및 마케팅 메시지 전달.</li>
          <li>설문조사와 피드백 수집을 통한 서비스 개선.</li>
        </ul>

        <h3 className='mt-10 text-lg font-bold'>2. 개인정보 관리 기간 및 파기</h3>
        <h4 className='text-md mt-6 font-bold'>1. 개인정보의 관리 기간</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>
            회사는 이용자의 개인정보를 수집·이용 시 동의 받은 기간 내에서 처리 및 보유하며, 처리 목적이 달성된 경우 지체 없이 파기합니다.
          </li>
          <li>
            회원가입 및 서비스 제공을 위한 개인정보는 원칙적으로 회원 탈퇴 시까지 보유되며, 다음의 경우에는 예외적으로 법령에 따라 일정 기간
            보유할 수 있습니다:
          </li>
        </ul>
        <div className='pl-8 pt-2'>
          <p className='font-bold'>전자상거래 등에서의 소비자 보호에 관한 법률</p>
          <ul className='list-disc pl-5 pt-2'>
            <li>표시·광고 관련 기록: 6개월</li>
            <li>소비자 불만 및 분쟁처리 관련 기록: 3년</li>
            <li>계약 및 청약철회 관련 기록: 5년</li>
            <li>대금결제 및 재화 공급 관련 기록: 5년</li>
          </ul>
          <ul className='list-disc pl-5 pt-2'>
            <li>통신비밀보호법: 서비스 접속 기록: 3개월</li>
            <li>전자금융거래법: 전자금융 거래 기록: 5년</li>
            <li>회원 탈퇴 후 이름, 전화번호, 생년월일, 이메일주소는 부정 이용 방지 목적으로 1년간 보유</li>
          </ul>
        </div>

        <h4 className='text-md mt-6 font-bold'>2. 개인정보의 파기</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>
            <strong>파기 절차</strong>
            <br />
            개인정보는 처리 목적이 달성되거나 보유 기간이 종료된 경우, 별도의 DB로 옮겨 법령에 따라 일정 기간 안전하게 보관한 후 파기합니다.
            해당 정보는 법적 근거가 없는 한 다른 목적으로 사용되지 않습니다.
          </li>
          <li>
            <strong>파기 기한</strong>
            <br />
            개인정보는 보유 기간이 만료된 날 또는 처리 목적 달성 후 5일 이내에 파기됩니다.
          </li>
          <li>
            <strong>파기 방법</strong>
            <ul className='list-disc pl-5 pt-2'>
              <li>전자적 파일: 복구할 수 없도록 기술적 방법으로 삭제</li>
              <li>종이 문서: 분쇄하거나 소각</li>
            </ul>
          </li>
        </ul>

        <h3 className='mt-10 text-lg font-bold'>3. 개인정보의 제3자 제공 및 이전</h3>
        <p className='pt-4'>
          회사는 서비스 제공을 위해 최소한의 범위에서 개인정보를 외부에 위탁하거나 제공할 수 있습니다. 이 과정에서 관계 법령에 따라 개인정보
          보호 조치를 준수하며, 관련 사항은 아래와 같습니다. 위탁 또는 제공 내용에 변경이 있을 경우, 본 개인정보처리방침을 통해
          안내드립니다.
        </p>

        <h4 className='text-md mt-6 font-bold'>개인정보 국내처리 위탁현황</h4>
        <table className='mt-4 w-full overflow-hidden border border-gray-300'>
          <thead>
            <tr className='border bg-[#e7f1fd] text-[#252525]'>
              <th className='border border-gray-300 p-2 text-left'>위탁 대상자</th>
              <th className='border border-gray-300 p-2 text-left'>위탁 업무 내용</th>
              <th className='border border-gray-300 p-2 text-left'>개인정보의 보유 및 이용기간</th>
            </tr>
          </thead>
          <tbody>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>네이버클라우드 주식회사</td>
              <td className='border border-gray-300 p-2'>데이터 저장 및 인프라 운영</td>
              <td className='border border-gray-300 p-2'>회원 탈퇴 시 혹은 위탁 계약 종료 시 까지</td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>한국마이크로소프트(유)</td>
              <td className='border border-gray-300 p-2'>데이터 저장 및 인프라 운영</td>
              <td className='border border-gray-300 p-2'>회원 탈퇴 시 혹은 위탁 계약 종료 시 까지</td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>토스페이먼츠</td>
              <td className='border border-gray-300 p-2'>요금 결제</td>
              <td className='border border-gray-300 p-2'>회원 탈퇴 시 혹은 위탁 계약 종료 시 까지</td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>솔라피(주)</td>
              <td className='border border-gray-300 p-2'>카카오톡 알림톡 발송</td>
              <td className='border border-gray-300 p-2'>회원 탈퇴 시 혹은 위탁 계약 종료 시 까지</td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>채널코퍼레이션</td>
              <td className='border border-gray-300 p-2'>고객 상담 서비스, 마케팅 및 광고</td>
              <td className='border border-gray-300 p-2'>회원 탈퇴 시 혹은 위탁 계약 종료 시 까지</td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>구글</td>
              <td className='border border-gray-300 p-2'>업로드된 파일의 OCR</td>
              <td className='border border-gray-300 p-2'>회원 탈퇴 시 혹은 위탁 계약 종료 시 까지</td>
            </tr>
          </tbody>
        </table>

        <h4 className='text-md mt-6 font-bold'>개인정보 국외이전 처리 위탁</h4>
        <table className='mt-4 w-full overflow-hidden border border-gray-300'>
          <thead>
            <tr className='border bg-[#e7f1fd] text-[#252525]'>
              <th className='border border-gray-300 p-2 text-left'>관련 근거</th>
              <th className='border border-gray-300 p-2 text-left'>이전되는 개인정보 항목</th>
              <th className='border border-gray-300 p-2 text-left'>이전되는 국가, 이전 시기 및 방법</th>
              <th className='border border-gray-300 p-2 text-left'>이전받는 자의 개인정보 이용 목적 및 보유기간</th>
            </tr>
          </thead>
          <tbody>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>
                개인정보 보호법 제28조의8 제1항 제3호 가목 (계약 이행을 위한 국외 처리 위탁・보관)
              </td>
              <td className='border border-gray-300 p-2'>
                언어 모델 기반의 생성형 AI가 연계된 서비스 제공 시 입력하는 내용(질의, 문서 또는 이미지 등) 및 관련 정보
              </td>
              <td className='border border-gray-300 p-2'>
                • OpenAI,LLC (privacy@openai.com)
                <br />
                • 이전 국가: 미국
                <br />
                • 이전 시기: 이용자가 개인정보를 입력창에 입력 후 전송 시
                <br />• 이전 방법: 서비스 이용시 암호화된 네트워크를 통해 전송
              </td>
              <td className='border border-gray-300 p-2'>
                • 이용 목적: 이용자 질문에 대한 답변 제공
                <br />• 보유 기간: 서비스 제공 목적 달성 후 최대 30일 이내 삭제
              </td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>
                개인정보 보호법 제28조의8 제1항 제3호 가목 (계약 이행을 위한 국외 처리 위탁・보관)
              </td>
              <td className='border border-gray-300 p-2'>
                언어 모델 기반의 생성형 AI가 연계된 서비스 제공 시 입력하는 내용(질의, 문서 또는 이미지 등) 및 관련 정보
              </td>
              <td className='border border-gray-300 p-2'>
                • ANTHROPIC,PBC (privacy@anthropic.com)
                <br />
                • 이전 국가: 미국
                <br />
                • 이전 시기: 이용자가 개인정보를 입력창에 입력 후 전송시
                <br />• 이전 방법: 서비스 이용시 암호화된 네트워크를 통해 전송
              </td>
              <td className='border border-gray-300 p-2'>
                • 이용 목적: 이용자 질문에 대한 답변 제공
                <br />• 보유 기간: 서비스 제공 목적 달성 후 최대 30일 이내 삭제
              </td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>
                개인정보 보호법 제28조의8 제1항 제3호 가목 (계약 이행을 위한 국외 처리 위탁・보관)
              </td>
              <td className='border border-gray-300 p-2'>
                언어 모델 기반의 생성형 AI가 연계된 서비스 제공 시 입력하는 내용(질의, 문서 또는 이미지, OCR등) 및 관련 정보
              </td>
              <td className='border border-gray-300 p-2'>
                • 구글코리아(유)(+82 2 531 9000)
                <br />
                • 이전 국가: 미국
                <br />
                • 이전 시기: 이용자가 개인정보를 입력창에 입력 후 전송시
                <br />• 이전 방법: 서비스 이용시 암호화된 네트워크를 통해 전송
              </td>
              <td className='border border-gray-300 p-2'>
                • 이용 목적: 이용자 질문에 대한 답변 제공
                <br />• 보유 기간: 회원 탈퇴 시 혹은 위탁 계약 종료시까지
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className='mt-10 text-lg font-bold'>4. 개인정보의 항목 및 수집방식</h3>
        <p className='pt-4'>회사는 아래에 명시된 목적으로 개인정보를 수집하고 관리하고 있습니다.</p>

        <p className='pt-4 font-bold'>회원 정보</p>
        <table className='mt-4 w-full overflow-hidden border border-gray-300'>
          <thead>
            <tr className='border bg-[#e7f1fd] text-[#252525]'>
              <th className='border border-gray-300 p-2 text-left'>항목</th>
              <th className='border border-gray-300 p-2 text-left'>수집 시점</th>
              <th className='border border-gray-300 p-2 text-left'>필수/선택</th>
              <th className='border border-gray-300 p-2 text-left'>처리 목적</th>
            </tr>
          </thead>
          <tbody>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>이메일 주소, 비밀번호, 이름, 생년월일</td>
              <td className='border border-gray-300 p-2'>회원가입 시</td>
              <td className='border border-gray-300 p-2'>필수</td>
              <td className='border border-gray-300 p-2'>회원관리 및 서비스 제공</td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>변호사 등록 번호</td>
              <td className='border border-gray-300 p-2'>회원가입 시</td>
              <td className='border border-gray-300 p-2'>필수(변호사 회원)</td>
              <td className='border border-gray-300 p-2'>변호사 회원 인증</td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>광고성 정보 수신 채널</td>
              <td className='border border-gray-300 p-2'>회원가입 시</td>
              <td className='border border-gray-300 p-2'>선택</td>
              <td className='border border-gray-300 p-2'>이벤트 정보 및 마케팅 활용</td>
            </tr>
          </tbody>
        </table>

        <p className='pt-4 font-bold'>서비스 정보</p>
        <table className='mt-4 w-full overflow-hidden border border-gray-300'>
          <thead>
            <tr className='border bg-[#e7f1fd] text-[#252525]'>
              <th className='border border-gray-300 p-2 text-left'>항목</th>
              <th className='border border-gray-300 p-2 text-left'>수집 시점</th>
              <th className='border border-gray-300 p-2 text-left'>필수/선택</th>
              <th className='border border-gray-300 p-2 text-left'>처리 목적</th>
            </tr>
          </thead>
          <tbody>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>서비스 이용 기록</td>
              <td className='border border-gray-300 p-2'>서비스 이용 시</td>
              <td className='border border-gray-300 p-2'>필수</td>
              <td className='border border-gray-300 p-2'>이용 통계 분석, 이용 서비스 최적화, 프라이버시 보호 측면의 서비스 환경 구축</td>
            </tr>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>구매 내역, 구매 및 결제 내역, 영수증 (카드종류, 카드정보-일부 표시)</td>
              <td className='border border-gray-300 p-2'>유료 서비스 결제 시</td>
              <td className='border border-gray-300 p-2'>필수</td>
              <td className='border border-gray-300 p-2'>요금 청구 및 정산</td>
            </tr>
          </tbody>
        </table>

        <p className='pt-4 font-bold'>고객 상담 정보</p>
        <table className='mt-4 w-full overflow-hidden border border-gray-300'>
          <thead>
            <tr className='border bg-[#e7f1fd] text-[#252525]'>
              <th className='border border-gray-300 p-2 text-left'>항목</th>
              <th className='border border-gray-300 p-2 text-left'>수집 시점</th>
              <th className='border border-gray-300 p-2 text-left'>필수/선택</th>
              <th className='border border-gray-300 p-2 text-left'>처리 목적</th>
            </tr>
          </thead>
          <tbody>
            <tr className='bg-white'>
              <td className='border border-gray-300 p-2'>이름, 연락처, 이메일주소, 문의 내역</td>
              <td className='border border-gray-300 p-2'>고객센터 이용 시</td>
              <td className='border border-gray-300 p-2'>필수</td>
              <td className='border border-gray-300 p-2'>민원 처리 및 고객 상담</td>
            </tr>
          </tbody>
        </table>

        <h3 className='mt-10 text-lg font-bold'>5. 개인정보 자동수집 장치 운영 및 차단 안내</h3>
        <p className='pt-4'>
          회사는 이용자에게 맞춤형 서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다. 쿠키는 웹사이트 서버가 이용자의 브라우저에 저장하는
          작은 텍스트 파일로, 서비스 환경 최적화 및 사용자 편의성 증대를 목적으로 운영됩니다.
        </p>

        <h4 className='text-md mt-6 font-bold'>5.1 쿠키의 활용 목적</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>접속 및 인증 관리: 이용자의 로그인 상태를 유지하고, 회원별 맞춤형 서비스를 제공합니다.</li>
          <li>사용자 환경 최적화: 접속 빈도와 방문 시간 등을 분석하여 이용자의 취향과 관심사를 파악합니다.</li>
          <li>맞춤형 콘텐츠 제공: 이벤트 참여 현황, 광고 클릭 기록 등을 통해 개인화된 정보 및 최적화된 광고를 제공합니다.</li>
          <li>서비스 개선 및 통계 분석: 방문 기록과 서비스 이용 패턴을 분석하여 서비스 품질을 향상합니다.</li>
        </ul>

        <h4 className='text-md mt-6 font-bold'>5.2 쿠키 설정 및 거부 방법</h4>
        <p className='pt-2'>이용자는 쿠키 설치에 대한 선택권을 가지며, 설정은 브라우저 옵션을 통해 조정할 수 있습니다:</p>

        <ul className='list-disc pl-5 pt-2'>
          <li>모든 쿠키 허용: 웹사이트의 모든 기능을 원활히 이용할 수 있습니다.</li>
          <li>쿠키 저장 시 확인: 쿠키 저장 여부를 개별적으로 확인하고 선택합니다.</li>
          <li>모든 쿠키 거부: 쿠키 저장을 차단하며, 이 경우 일부 서비스 이용이 제한될 수 있습니다.</li>
        </ul>

        <h4 className='text-md mt-6 font-bold'>5.3 쿠키 거부 시 유의사항</h4>
        <p className='pt-2'>쿠키 설치를 거부할 경우:</p>
        <ul className='list-disc pl-5 pt-2'>
          <li>로그인이 필요한 일부 서비스가 원활히 제공되지 않을 수 있습니다.</li>
          <li>맞춤형 광고와 개인화된 콘텐츠 제공이 제한될 수 있습니다.</li>
        </ul>

        <h3 className='mt-10 text-lg font-bold'>6. 서비스 이용 과정에서 수집되는 데이터</h3>
        <p className='pt-4'>
          PC웹 이용 과정에서 단말기정보(OS, 화면사이즈, 디바이스 아이디), IP주소, 쿠키, 방문일시, 부정이용기록, 서비스 이용 과정에서 자동
          생성되는 로그 데이터, 서비스 이용 기록 등의 정보가 자동으로 생성되어 수집될 수 있습니다.
        </p>

        <h3 className='mt-10 text-lg font-bold'>7. 개인정보 보호 책임자 및 민원 접수 안내</h3>
        <h4 className='text-md mt-6 font-bold'>개인정보보호책임자</h4>
        <p className='pt-2'>
          회사는 회원의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.
        </p>
        <ul className='list-disc pl-5 pt-2'>
          <li>개인정보보호책임자: 김윤우, 장일준</li>
          <li>개인정보보호담당자: 김윤우, 장일준</li>
          <li>전화번호: 02-538-3337</li>
          <li>이메일: yunwoo.kim@a2d2.co.kr, ijj@a2d2.co.kr</li>
        </ul>

        <p className='pt-4'>
          이용자는 회사의 서비스를 이용하며 발생하는 모든 개인정보보호 관련 민원을 개인정보보호책임자 혹은 담당부서로 신고할 수 있습니다.
        </p>

        <p className='pt-4'>이용자는 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의할 수 있습니다.</p>
        <ul className='list-disc pl-5 pt-2'>
          <li>개인정보 침해 신고 센터: (국번없이)118 (privacy.kisa.or.kr)</li>
          <li>개인정보 분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
          <li>대검찰청 사이버수사과: (국번없이) 1301, cid@spo.go.kr (www.spo.go.kr)</li>
          <li>경찰청 사이버범죄 신고시스템: (국번없이) 182 (https://ecrm.cyber.go.kr)</li>
        </ul>

        <h3 className='mt-10 text-lg font-bold'>8. 이용자 또는 그 법정대리인의 권리 및 그 행사방법</h3>
        <p className='pt-4'>이용자 또는 그 법정대리인은 언제든지 아래의 사항에 관하여 개인정보 열람 및 정정을 요구할 수 있습니다.</p>
        <ul className='list-disc pl-5 pt-2'>
          <li>회사가 보유하고 있는 이용자의 개인정보</li>
          <li>회사가 이용자의 개인정보를 이용하거나 제3자에게 제공한 내역</li>
          <li>회사에게 개인정보 수집, 이용, 제공 등의 동의를 한 내역</li>
        </ul>

        <p className='pt-4'>
          이용자는 회사가 운영하는 웹사이트에서 직접 자신의 정보를 열람, 정정할 수 있으며, 별도로 개인정보보호책임자에게 서면, 전화,
          전자우편 등을 통하여 개인정보의 열람, 정정을 요청할 수 있습니다.
        </p>

        <p className='pt-4'>이용자 또는 법정대리인은 언제든지 자신의 개인정보처리의 정지를 요구할 수 있습니다.</p>

        <p className='pt-4'>
          이용자 또는 그 법정대리인은 언제든지 회원가입 시 개인정보의 수집, 이용, 제공 등에 대해 동의하신 의사표시를 철회(회원탈퇴)할 수
          있습니다. 회원탈퇴는 회사 웹사이트의 [사용자 설정] - [회원 탈퇴] 메뉴에서 본인 확인 절차를 거친 후 직접하거나, 별도로
          개인정보보호책임자에게 서면, 전화 또는 전자우편 등을 통하여 할 수 있습니다. 단, 동의철회(회원탈퇴)가 있더라도 관계법령에 따라
          요구되는 범위 내에서 최소한의 정보가 보관될 수 있습니다.
        </p>

        <h3 className='mt-10 text-lg font-bold'>9. 개인정보 보호 및 보안 대책</h3>
        <p className='pt-4'>
          회사는 이용자의 개인정보를 보호하기 위해 개인정보보호법 등 관련 법령에 따라 기술적, 관리적, 물리적 조치를 시행하고 있습니다. 주요
          내용은 다음과 같습니다.
        </p>

        <h4 className='text-md mt-6 font-bold'>9.1 기술적 조치</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>개인정보처리시스템 접근권한 관리 및 접근통제 적용</li>
          <li>중요 정보(비밀번호, 고유식별정보 등)의 암호화 저장 및 전송 시 암호화</li>
          <li>해킹 및 악성코드 방지 대책(보안프로그램 설치 및 실시간 모니터링)</li>
          <li>접속기록의 위변조 방지 및 안전한 보관</li>
        </ul>

        <h4 className='text-md mt-6 font-bold'>9.2 관리적 조치</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>내부관리계획 수립 및 정기적 직원 교육</li>
          <li>개인정보 취급자의 접근 권한 부여, 변경, 말소 관리</li>
          <li>개인정보보호 전담조직 운영 및 규정 준수 점검</li>
        </ul>

        <h4 className='text-md mt-6 font-bold'>9.3 물리적 조치</h4>
        <ul className='list-disc pl-5 pt-2'>
          <li>전산실 및 자료보관실에 대한 출입 통제</li>
          <li>외부로부터 접근이 통제된 안전한 구역에 시스템 설치</li>
          <li>출입 통제 절차 수립 및 운영</li>
        </ul>

        <h3 className='mt-10 text-lg font-bold'>10. 개인정보처리방침 변경 공지</h3>
        <p className='pt-4'>
          회사는 개인정보처리방침을 변경하는 경우, 변경 사항이 적용되기 최소 7일 전에 홈페이지 공지사항을 통해 이를 안내합니다.
        </p>
        <p className='pt-4'>또한, 변경 내용이 관계 법령에 따라 별도의 동의가 필요한 경우, 회원으로부터 사전에 동의를 받을 수 있습니다.</p>

        <p className='pt-4'>본 개인정보처리방침에서 규정되지 않은 사항은 관계법령의 범위 내에서 회사 이용약관을 우선적으로 적용합니다.</p>

        <div className='mt-10 pt-4'>
          <p>
            <strong>개인정보처리방침 공고일자:</strong> 2026.01.12
          </p>
          <p>
            <strong>개인정보처리방침 시행일자:</strong> 2026.01.19
          </p>
        </div>
      </div>
    </section>
  );
};
