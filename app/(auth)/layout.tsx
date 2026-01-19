export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div  suppressHydrationWarning>
      {children}
    </div>
  );
}
