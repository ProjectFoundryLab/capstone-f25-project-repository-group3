export default function Button ({ children, icon: Icon, variant = 'primary', size = 'md', ...props }) {
  const baseClasses =
    "rounded-md font-medium flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base"
  };

  const variants = {
    primary:   "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button
      className={`${baseClasses} ${sizes[size]} ${variants[variant]}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

