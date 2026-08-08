import React from 'react';
import { useApexStore } from '../store/useApexStore';

export function Link({ href, children, className, target, rel, onClick, style, ...props }: {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const navigate = useApexStore((s) => s.navigate);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    if (target === '_blank' || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
      return;
    }
    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} className={className} target={target} rel={rel} onClick={handleClick} style={style} {...props}>
      {children}
    </a>
  );
}

export function useRouter() {
  const navigate = useApexStore((s) => s.navigate);
  const refresh = useApexStore((s) => s.refresh);
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path),
    refresh: () => refresh(),
  };
}

export function usePathname() {
  return useApexStore((s) => s.currentPath);
}

export function useSearchParams() {
  const searchStr = useApexStore((s) => s.searchString);
  return new URLSearchParams(searchStr);
}
