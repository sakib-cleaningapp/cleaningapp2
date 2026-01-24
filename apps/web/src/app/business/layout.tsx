import { ReactNode } from 'react';

interface BusinessLayoutProps {
  children: ReactNode;
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  return <div className="business-portal">{children}</div>;
}
