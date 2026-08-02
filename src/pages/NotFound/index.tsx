/* src/pages/NotFound/index.tsx */

import { ErrorState } from '@/components';

/**
 * 라우터에 없는 주소로 들어왔을 때.
 *
 * vercel.json의 SPA 폴백이 모든 주소를 index.html로 넘기므로, 라우터가 받아주지
 * 않으면 Layout만 그려지고 가운데가 빈 화면이 됩니다. 서버가 아니라 여기서
 * 막아야 하는 이유입니다.
 *
 * 렌더 에러 화면과 문구가 겹치지 않게 씁니다. 여기는 주소가 틀린 것이고
 * 사용자가 할 일은 다른 곳으로 가는 것이지, 다시 시도하는 것이 아닙니다.
 */
export const NotFound = () => (
  <ErrorState
    label="404"
    title="페이지를 찾을 수 없습니다"
    description="주소가 바뀌었거나 삭제된 페이지입니다."
  />
);
