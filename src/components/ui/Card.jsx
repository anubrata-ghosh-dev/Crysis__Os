/**
 * CRYSIS OS Card Component
 * Container for content with consistent styling
 */

export const Card = ({ 
  children, 
  className = "", 
  variant = "default",
  ...props 
}) => {
  const variants = {
    default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors",
    dark: "bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600",
    elevated: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-2xl transition-colors",
    critical: "bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 transition-colors"
  };

  return (
    <div
      className={`rounded-lg p-4 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", style = {}, ...props }) => (
  <h3
    className={`text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors ${className}`}
    style={style}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 flex gap-2 ${className}`}>
    {children}
  </div>
);

export default {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};
