import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export function PasswordInput({
  label,
  leftIcon,
  containerClassName = '',
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <Input
      type={show ? 'text' : 'password'}
      label={label}
      leftIcon={leftIcon}
      rightIcon={show ? <EyeOff size={20} /> : <Eye size={20} />}
      onRightIconClick={() => setShow((v) => !v)}
      rightIconAriaLabel={show ? '隐藏密码' : '显示密码'}
      containerClassName={containerClassName}
      {...props}
    />
  );
}
