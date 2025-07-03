import { forwardRef } from "react";

interface InputProps {
  placeholder: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder }, ref) => {
    return (
      <input
        ref={ref}
        placeholder={placeholder}
        type="text"
        className="px-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    );
  }
);
