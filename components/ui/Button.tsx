'use client'
import { motion } from 'framer-motion'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  className?: string
}

export default function Button({
  children, variant = 'primary', size = 'md', href, onClick, className = ''
}: ButtonProps) {
  const sizeMap = {
    sm: 'px-6 py-3 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-5 text-lg',
  }

  const variantMap = {
    primary: `
      text-white font-semibold
      transition-all duration-500
    `,
    secondary: `
      bg-transparent font-semibold
      transition-all duration-500
    `,
    ghost: `
      bg-transparent
      transition-colors duration-300
    `,
  }

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #2E9AC4, #1B7EA6)',
      color: '#FFFFFF',
      boxShadow: '0 4px 15px rgba(46,154,196,0.25)',
    },
    secondary: {
      background: 'transparent',
      color: '#2E9AC4',
      border: '1px solid rgba(46,154,196,0.3)',
    },
    ghost: {
      background: 'transparent',
      color: '#4A5568',
    },
  }

  const sharedClasses = `
    ${sizeMap[size]} ${variantMap[variant]}
    inline-flex items-center justify-center gap-2
    rounded-[var(--radius-sm)] font-body
    tracking-wide uppercase
    cursor-pointer select-none
    ${className}
  `

  if (href) {
    return (
      <motion.a
        href={href}
        className={sharedClasses}
        style={variantStyles[variant]}
        whileHover={{ scale: 1.02, boxShadow: variant === 'primary' ? '0 6px 25px rgba(46,154,196,0.35)' : undefined }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      className={sharedClasses}
      style={variantStyles[variant]}
      whileHover={{ scale: 1.02, boxShadow: variant === 'primary' ? '0 6px 25px rgba(46,154,196,0.35)' : undefined }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}
