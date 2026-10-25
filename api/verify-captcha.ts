import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Cloudflare 테스트 시크릿. 1x는 무엇이든 통과시켜 프로덕션에 들어가면 캡챠가 무력화된다.
const TEST_SECRETS = new Set([
  '1x0000000000000000000000000000000AA', // 항상 성공
  '2x0000000000000000000000000000000AA', // 항상 실패
  '3x0000000000000000000000000000000AA', // 이미 사용된 토큰
]);

// 우리 설정 문제라 403(봇 의심)이 아니라 500으로 내린다
const CONFIG_ERROR_CODES = new Set([
  'invalid-input-secret',
  'missing-input-secret',
  'bad-request',
]);

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '잘못된 요청 방식입니다.' });
  }

  const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

  if (!SECRET_KEY) {
    console.error(
      '[Turnstile] TURNSTILE_SECRET_KEY가 없습니다. 캡챠를 검증할 수 없습니다.',
    );
    return res
      .status(500)
      .json({ success: false, message: '서버 설정 오류입니다.' });
  }

  if (process.env.VERCEL_ENV === 'production' && TEST_SECRETS.has(SECRET_KEY)) {
    console.error(
      '[Turnstile] 프로덕션에 테스트 시크릿이 설정되어 있습니다. 캡챠가 무력화되므로 거부합니다.',
    );
    return res
      .status(500)
      .json({ success: false, message: '서버 설정 오류입니다.' });
  }

  const { captchaToken } = req.body ?? {};

  if (typeof captchaToken !== 'string' || !captchaToken) {
    return res
      .status(400)
      .json({ success: false, message: '통행증이 없습니다.' });
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: SECRET_KEY,
        response: captchaToken,
      }).toString(),
    });

    const verifyData = (await response.json()) as TurnstileResponse;

    if (verifyData.success) {
      return res.status(200).json({ success: true });
    }

    const errorCodes = verifyData['error-codes'] ?? [];

    if (errorCodes.some((code) => CONFIG_ERROR_CODES.has(code))) {
      console.error('[Turnstile] 설정 오류:', errorCodes.join(', '));
      return res
        .status(500)
        .json({ success: false, message: '서버 설정 오류입니다.' });
    }

    console.warn(
      '[Turnstile] 검증 실패:',
      errorCodes.join(', ') || '(코드 없음)',
    );
    return res
      .status(403)
      .json({ success: false, message: '봇으로 의심됩니다.' });
  } catch (error) {
    console.error('캡챠 서버 에러:', error);
    return res
      .status(500)
      .json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
}
