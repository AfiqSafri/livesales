"use client";

import React from "react";

export default function NotusCard({ children, className = "", ...props }) {
  return (
    <div
      className={`relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function NotusCardHeader({ children, className = "", ...props }) {
  return (
    <div
      className={`flex-auto p-4 lg:p-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function NotusCardBody({ children, className = "", ...props }) {
  return (
    <div
      className={`flex-auto p-4 lg:p-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function NotusCardFooter({ children, className = "", ...props }) {
  return (
    <div
      className={`flex-auto p-4 lg:p-10 border-t border-blueGray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
