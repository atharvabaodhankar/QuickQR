const ResponsiveContainer = ({ children, className = "" }) => {
  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;