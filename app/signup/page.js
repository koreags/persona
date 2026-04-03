'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TERMS = `제1조 (목적)
이 약관은 인물지(이하 "사이트")가 제공하는 서비스의 이용과 관련하여 사이트와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
① "회원"이란 사이트에 접속하여 이 약관에 따라 사이트와 이용계약을 체결하고 사이트가 제공하는 서비스를 이용하는 자를 말합니다.
② "아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 정하고 사이트가 승인한 문자와 숫자의 조합을 말합니다.
③ "비밀번호"란 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 개인정보를 보호하기 위해 회원 자신이 정한 문자와 숫자의 조합을 말합니다.

제3조 (약관의 효력 및 변경)
① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.
② 사이트는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수 있습니다.
③ 약관이 변경되는 경우 사이트는 변경사항을 시행일자 7일 전부터 공지합니다.

제4조 (서비스의 제공 및 변경)
① 사이트는 다음과 같은 서비스를 제공합니다.
  - 인물 관련 뉴스 요약 및 아카이브 서비스
  - 독자 투고 서비스
  - 기타 사이트가 자체 개발하거나 타 회사와의 협력 계약 등을 통해 제공하는 서비스
② 사이트는 서비스의 내용 및 제공 일시를 변경할 수 있으며, 이 경우 사전에 공지합니다.

제5조 (서비스의 중단)
① 사이트는 컴퓨터 등 정보통신설비의 보수점검·교체·고장, 통신의 두절 등의 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.
② 사이트는 서비스 중단으로 인하여 회원 또는 제3자가 입은 손해에 대하여는 배상하지 아니합니다. 단, 사이트의 고의 또는 중과실이 있는 경우는 예외로 합니다.

제6조 (회원가입)
① 이용자는 사이트가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
② 사이트는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
  - 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우
  - 등록 내용에 허위, 기재누락, 오기가 있는 경우
  - 기타 회원으로 등록하는 것이 사이트의 운영에 현저히 지장이 있다고 판단되는 경우

제7조 (회원 탈퇴 및 자격 상실)
① 회원은 사이트에 언제든지 탈퇴를 요청할 수 있으며 사이트는 즉시 회원탈퇴를 처리합니다.
② 회원이 다음 각 호의 사유에 해당하는 경우, 사이트는 회원자격을 제한 및 정지시킬 수 있습니다.
  - 가입 신청 시 허위 내용을 등록한 경우
  - 다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 경우
  - 사이트를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우

제8조 (게시물의 저작권)
① 회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.
② 회원이 서비스 내에 게시하는 게시물은 검색 결과 내지 서비스 및 관련 프로모션 등에 노출될 수 있으며, 해당 노출을 위해 필요한 범위 내에서는 일부 수정·복제·편집될 수 있습니다.

제9조 (면책조항)
① 사이트는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
② 사이트는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.

제10조 (분쟁해결)
이 약관과 관련하여 발생한 분쟁은 대한민국 법원에 제소합니다.

부칙
이 약관은 2026년 1월 1일부터 시행됩니다.`

const PRIVACY = `인물지(이하 "사이트")는 개인정보보호법에 따라 이용자의 개인정보를 아래와 같이 수집·이용합니다.

■ 수집하는 개인정보 항목
  - 필수항목: 아이디, 비밀번호, 이메일 주소
  - 선택항목: 없음

■ 개인정보의 수집 및 이용 목적
  - 회원 식별 및 가입 의사 확인
  - 서비스 이용에 따른 본인 확인
  - 공지사항 전달, 민원처리 등 원활한 의사소통 경로 확보
  - 새로운 서비스 및 이벤트 안내

■ 개인정보의 보유 및 이용 기간
  - 회원 탈퇴 시까지 보유·이용합니다.
  - 단, 관련 법령에 의하여 일정 기간 보존이 필요한 경우 해당 기간 동안 보관됩니다.
    · 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)
    · 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
    · 로그인 기록: 3개월 (통신비밀보호법)

■ 동의 거부 권리 및 불이익
  귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다.
  다만, 동의를 거부하는 경우 회원가입이 불가능합니다.`

export default function SignupTermsPage() {
  const router = useRouter()
  const [agreeAll, setAgreeAll] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeAge, setAgreeAge] = useState(false)

  function handleAgreeAll(checked) {
    setAgreeAll(checked)
    setAgreeTerms(checked)
    setAgreePrivacy(checked)
    setAgreeAge(checked)
  }

  function handleIndividual(setter, value) {
    setter(value)
  }

  // 전체 동의 상태 동기화
  const allChecked = agreeTerms && agreePrivacy && agreeAge
  const canProceed = agreeTerms && agreePrivacy && agreeAge

  function handleNext() {
    if (!canProceed) return
    router.push('/signup/form')
  }

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.88rem', cursor: 'pointer', color: '#222',
    userSelect: 'none',
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      {/* 상단 타이틀 */}
      <div style={{ background: 'var(--accent-dk)', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
        회원가입
      </div>

      {/* 스텝 표시 */}
      <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem', display: 'flex', gap: 0 }}>
        {['약관 동의', '정보 입력', '가입 완료'].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.8rem',
              color: i === 0 ? 'var(--accent)' : 'var(--muted)',
              fontWeight: i === 0 ? 600 : 400,
            }}>
              <span style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: i === 0 ? 'var(--accent)' : 'var(--border)',
                color: i === 0 ? '#fff' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 600, flexShrink: 0,
              }}>{i + 1}</span>
              {step}
            </div>
            {i < 2 && <span style={{ margin: '0 0.75rem', color: 'var(--border)', fontSize: '0.8rem' }}>›</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* 전체 동의 */}
        <div style={{
          background: allChecked ? 'rgba(72,118,191,0.06)' : 'var(--surface2)',
          border: `1px solid ${allChecked ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '4px',
          padding: '0.9rem 1.1rem',
          marginBottom: '1.25rem',
        }}>
          <label style={{ ...labelStyle, fontSize: '0.92rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={allChecked}
              onChange={e => handleAgreeAll(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            전체 동의합니다
          </label>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.35rem', marginLeft: '1.5rem' }}>
            이용약관, 개인정보 수집·이용, 만 14세 이상 확인에 모두 동의합니다.
          </p>
        </div>

        {/* 이용약관 */}
        <TermsBlock
          title="이용약관 동의"
          required
          content={TERMS}
          checked={agreeTerms}
          onChange={v => handleIndividual(setAgreeTerms, v)}
        />

        {/* 개인정보 수집·이용 */}
        <TermsBlock
          title="개인정보 수집·이용 동의"
          required
          content={PRIVACY}
          checked={agreePrivacy}
          onChange={v => handleIndividual(setAgreePrivacy, v)}
        />

        {/* 만 14세 이상 확인 */}
        <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '0.9rem 1.1rem', marginBottom: '1.25rem' }}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={agreeAge}
              onChange={e => handleIndividual(setAgreeAge, e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <span>
              <span style={{ color: '#c0392b', marginRight: '0.25rem' }}>[필수]</span>
              본인은 만 14세 이상입니다.
            </span>
          </label>
        </div>

        {/* 다음 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.75rem' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.6rem 1.8rem',
              border: '1px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--muted)',
              borderRadius: '3px',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            style={{
              padding: '0.6rem 2.2rem',
              border: 'none',
              background: canProceed ? 'var(--accent)' : 'var(--border)',
              color: canProceed ? '#fff' : 'var(--muted)',
              borderRadius: '3px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: canProceed ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
          >
            다음 →
          </button>
        </div>
      </div>
    </div>
  )
}

function TermsBlock({ title, required, content, checked, onChange }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderBottom: 'none',
        borderRadius: '4px 4px 0 0',
        padding: '0.6rem 1rem',
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#222' }}>
          {required && <span style={{ color: '#c0392b', marginRight: '0.25rem' }}>[필수]</span>}
          {title}
        </span>
      </div>
      {/* 스크롤 텍스트 박스 */}
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '0 0 4px 4px',
        padding: '0.9rem 1rem',
        height: '160px',
        overflowY: 'auto',
        background: '#fff',
        fontSize: '0.78rem',
        color: '#333',
        lineHeight: 1.85,
        whiteSpace: 'pre-wrap',
        fontFamily: 'var(--font-sans)',
      }}>
        {content}
      </div>
      {/* 동의 체크박스 */}
      <div style={{
        border: '1px solid var(--border)',
        borderTop: 'none',
        padding: '0.6rem 1rem',
        background: checked ? 'rgba(72,118,191,0.04)' : 'var(--surface2)',
        borderRadius: '0 0 4px 4px',
        display: 'flex', gap: '1.5rem',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer', color: checked ? 'var(--accent)' : '#555', fontWeight: checked ? 600 : 400 }}>
          <input
            type="radio"
            name={title}
            checked={checked}
            onChange={() => onChange(true)}
            style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          동의합니다
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer', color: !checked ? '#555' : 'var(--muted)' }}>
          <input
            type="radio"
            name={title}
            checked={!checked}
            onChange={() => onChange(false)}
            style={{ cursor: 'pointer' }}
          />
          동의하지 않습니다
        </label>
      </div>
    </div>
  )
}
