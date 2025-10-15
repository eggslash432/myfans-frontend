import { ErrorBoundary } from '../components/ErrorBoundary';
import MyPageContainer from '../mypage';

export default function MyPage() {
  return (
    <ErrorBoundary>
      <MyPageContainer />
    </ErrorBoundary>
  );
}
