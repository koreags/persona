-- 회원 테이블 생성
CREATE TABLE IF NOT EXISTS members (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  username     varchar(20) NOT NULL UNIQUE,   -- 아이디 (영소문자·숫자·밑줄)
  password_hash text       NOT NULL,           -- bcrypt 해시
  nickname     varchar(20) NOT NULL UNIQUE,   -- 닉네임
  email        varchar(255) NOT NULL UNIQUE,  -- 이메일
  is_active    boolean     DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_members_username ON members (username);
CREATE INDEX IF NOT EXISTS idx_members_email    ON members (email);

-- RLS 활성화 (Row Level Security)
-- service_role key는 RLS를 자동으로 우회합니다.
-- anon / authenticated 역할에는 별도 정책을 부여하지 않아 접근 불가.
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 이메일 인증 코드 테이블
CREATE TABLE IF NOT EXISTS email_verifications (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      varchar(255) NOT NULL,
  code       varchar(6)  NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications (email);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
