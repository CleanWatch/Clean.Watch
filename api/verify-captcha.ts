/* api/verify-captcha.ts */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Cloudflare가 문서화한 테스트용 시크릿. 토큰이 무엇이든 결과가 고정됩니다.
 *
 * 그중 1x...AA는 어떤 값을 보내도 성공을 돌려주므로, 프로덕션에 들어가면
 * 캡챠가 통째로 무력화됩니다. 실패하는 쪽(2x/3x)은 아무도 통과하지 못해
 * 금방 드러나지만, 성공하는 쪽은 조용히 뚫린 채로 남습니다.
 */
const TEST_SECRETS = new Set([
  '1x0000000000000000000000000000000AA', // 항상 성공
  '2x0000000000000000000000000000000AA', // 항상 실패
  '3x0000000000000000000000000000000AA', // 이미 사용된 토큰
]);

/**
 * 우리 쪽 설정이 틀렸을 때 Cloudflare가 주는 코드.
 *
 * 사용자가 봇이어서 나오는 것이 아니므로 403으로 뭉뚱그리면 안 됩니다.
 * 그렇게 하면 정상 사용자에게 "봇으로 의심됩니다"가 뜨고, 진짜 원인은
 * 어디에도 남지 않아 캡챠에서 원인을 찾게 됩니다.
 */
const CONFIG_ERROR_CODES = new Set([
  'invalid-input-secret',
  'missing-input-secret',
  'bad-request',
]);

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

// 브라우저가 아닌 백엔드에서 실행
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // POST 요청만 받도록 세팅
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '잘못된 요청 방식입니다.' });
  }

  // 버셀 환경 변수 호출
  const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

  // 키가 없으면 Cloudflare는 success: false를 돌려줍니다. 그대로 403으로
  // 넘기면 환경변수 사고가 봇 판정으로 위장되어, 정상 사용자는 이유를 모른 채
  // 막히고 우리는 엉뚱한 곳을 뒤지게 됩니다.
  if (!SECRET_KEY) {
    console.error(
      '[Turnstile] TURNSTILE_SECRET_KEY가 없습니다. 캡챠를 검증할 수 없습니다.',
    );
    return res
      .status(500)
      .json({ success: false, message: '서버 설정 오류입니다.' });
  }

  // 로컬에서 테스트 시크릿을 쓰는 것은 정상입니다. 막아야 할 곳은 프로덕션뿐입니다.
  if (process.env.VERCEL_ENV === 'production' && TEST_SECRETS.has(SECRET_KEY)) {
    console.error(
      '[Turnstile] 프로덕션에 테스트 시크릿이 설정되어 있습니다. 캡챠가 무력화되므로 거부합니다.',
    );
    return res
      .status(500)
      .json({ success: false, message: '서버 설정 오류입니다.' });
  }

  // 리액트(useRegisterMutation, useLoginForm)에서 보낸 토큰을 받음
  const { captchaToken } = req.body ?? {};

  if (typeof captchaToken !== 'string' || !captchaToken) {
    return res
      .status(400)
      .json({ success: false, message: '통행증이 없습니다.' });
  }

  try {
    // 인코딩은 URLSearchParams에 맡깁니다. 문자열을 직접 이어붙이면 값에
    // &나 +가 섞였을 때 검증이 실패하는데, 그 원인은 응답에 드러나지 않습니다.
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: SECRET_KEY,
        response: captchaToken,
      }).toString(),
    });

    const verifyData = (await response.json()) as TurnstileResponse;

    // 통과된 경우 200(OK) 신호를 보냅니다.
    if (verifyData.success) {
      return res.status(200).json({ success: true });
    }

    const errorCodes = verifyData['error-codes'] ?? [];

    // 우리 설정이 틀린 경우와 사용자가 막힌 경우를 갈라 놓습니다.
    if (errorCodes.some((code) => CONFIG_ERROR_CODES.has(code))) {
      console.error('[Turnstile] 설정 오류:', errorCodes.join(', '));
      return res
        .status(500)
        .json({ success: false, message: '서버 설정 오류입니다.' });
    }

    // 토큰 만료나 재사용은 다시 시도하면 풀립니다. 코드를 남겨 두어야
    // 나중에 "왜 막혔는지"를 로그만 보고 판단할 수 있습니다.
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
