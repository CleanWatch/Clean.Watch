import { ErrorState } from '@/components';

// SPA 폴백이 모든 주소를 index.html로 넘기므로 라우터가 받지 않으면 빈 화면이 된다
export const NotFound = () => (
  <ErrorState
    label="404"
    title="페이지를 찾을 수 없습니다"
    description="주소가 바뀌었거나 삭제된 페이지입니다."
  />
);
