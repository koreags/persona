import nodemailer from 'nodemailer'

export function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true = 465, false = 587/25
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail(to, code) {
  const transporter = createTransport()
  await transporter.sendMail({
    from: `"인물지" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: '[인물지] 이메일 인증 번호',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;border:1px solid #e0e0e0;border-radius:8px">
        <h2 style="color:#1c2b4b;margin-bottom:0.5rem">인물지 이메일 인증</h2>
        <p style="color:#555;font-size:0.95rem">아래 인증번호를 입력해 회원가입을 완료해 주세요.</p>
        <div style="margin:1.5rem 0;padding:1rem 2rem;background:#f4f7ff;border:2px solid #4876bf;border-radius:6px;text-align:center">
          <span style="font-size:2.2rem;font-weight:700;letter-spacing:0.3em;color:#1c2b4b">${code}</span>
        </div>
        <p style="color:#888;font-size:0.8rem">인증번호는 발송 후 <strong>3분간</strong> 유효합니다.<br>본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
      </div>
    `,
  })
}
