export default function Button({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false, fullWidth = false }) {
  const variants = {
    primary: 'bg-navy-700 hover:bg-navy-800 text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border border-gray-200 hover:bg-gray-50 text-gray-700 bg-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'hover:bg-gray-100 text-gray-600',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  };
  const sizes = {
    sm: 'text-sm px-3 py-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 rounded-xl font-medium',
    lg: 'text-base px-6 py-3.5 rounded-xl font-semibold',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
