export default function Button ({ children, icon: Icon, variant = 'primary', ...props }) {
  const baseClasses = "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
  };
  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};