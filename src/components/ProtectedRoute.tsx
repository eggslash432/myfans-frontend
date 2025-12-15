// front/src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";
import type { Role } from "../shared/prisma-enums";

type Props = {
  children: ReactNode;
  role?: Role;
  roles?: Role[];
};

export default function ProtectedRoute({ children, role, roles }: Props) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <div className="p-6">読み込み中...</div>;
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  const allowedRoles: Role[] | null = roles
    ? roles
    : role
      ? [role]
      : null;

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role as Role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
