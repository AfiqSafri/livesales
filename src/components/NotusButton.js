"use client";

import React from "react";

export default function NotusButton({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  icon = null,
  ...props
}) {
  // Base classes from Notus theme
  const baseClasses = "outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150";
  
  // Size classes
  const sizeClasses = {
    sm: "text-xs px-3 py-2",
    md: "text-sm px-4 py-2",
    lg: "text-sm px-6 py-3",
    xl: "text-base px-8 py-4"
  };
  
  // Variant classes based on Notus theme
  const variantClasses = {
    primary: "bg-blueGray-800 text-white active:bg-blueGray-600 font-bold uppercase rounded shadow hover:shadow-lg",
    secondary: "bg-white active:bg-blueGray-50 text-blueGray-700 font-bold uppercase rounded shadow hover:shadow-md",
    success: "bg-green-500 text-white active:bg-green-600 font-bold uppercase rounded shadow hover:shadow-lg",
    danger: "bg-red-500 text-white active:bg-red-600 font-bold uppercase rounded shadow hover:shadow-lg",
    warning: "bg-yellow-500 text-white active:bg-yellow-600 font-bold uppercase rounded shadow hover:shadow-lg",
    info: "bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase rounded shadow hover:shadow-lg",
    light: "bg-blueGray-100 text-blueGray-800 active:bg-blueGray-200 font-bold uppercase rounded shadow hover:shadow-md",
    dark: "bg-blueGray-800 text-white active:bg-blueGray-600 font-bold uppercase rounded shadow hover:shadow-lg"
  };
  
  // Width class
  const widthClass = fullWidth ? "w-full" : "";
  
  // Disabled classes
  const disabledClasses = disabled || loading ? "opacity-50 cursor-not-allowed" : "";
  
  // Combine all classes
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClasses} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
