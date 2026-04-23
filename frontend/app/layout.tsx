// Root layout — chỉ pass-through.
// Thẻ <html> / <body> và metadata mặc định được khai báo trong app/[locale]/layout.tsx
// để gán lang attribute đúng theo ngôn ngữ hiện tại.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
