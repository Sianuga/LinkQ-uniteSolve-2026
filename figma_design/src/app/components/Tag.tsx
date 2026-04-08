interface TagProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Tag({ children, variant = 'primary' }: TagProps) {
  const styles = {
    primary: 'bg-[#EFF6FF] text-[#1E3A8A]',
    secondary: 'bg-[#F3F4F6] text-[#6B7280]',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
