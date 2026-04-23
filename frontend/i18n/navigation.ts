import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Wrappers của next/navigation & next/link có gắn locale.
// Dùng Link / useRouter / usePathname / redirect / getPathname từ đây
// thay vì next/link + next/navigation để tự động sinh URL theo locale hiện tại.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
