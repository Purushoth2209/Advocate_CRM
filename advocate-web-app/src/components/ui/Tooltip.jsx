import { useState, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Visible hover hint (not the delayed browser `title` tooltip).
 * Renders in a portal so it isn’t clipped by overflow:hidden ancestors.
 */
export default function Tooltip({ children, content, side = 'bottom', className = '' }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const triggerRef = useRef(null);

  const position = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const estW = 220;
    if (side === 'right') {
      let left = r.right + margin;
      if (left + estW > window.innerWidth - 8) {
        left = Math.max(8, r.left - estW - margin);
      }
      setStyle({
        position: 'fixed',
        top: r.top + r.height / 2,
        left,
        transform: 'translateY(-50%)',
        zIndex: 99999,
      });
    } else if (side === 'bottom') {
      setStyle({
        position: 'fixed',
        top: r.bottom + margin,
        left: r.left + r.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 99999,
      });
    } else {
      setStyle({
        position: 'fixed',
        top: r.top - margin,
        left: r.left + r.width / 2,
        transform: 'translate(-50%, -100%)',
        zIndex: 99999,
      });
    }
  }, [side]);

  useLayoutEffect(() => {
    if (!open) return;
    position();
    const onScroll = () => position();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', position);
    };
  }, [open, position, content]);

  if (!content) return children;

  const tip = open && (
    <div
      role="tooltip"
      style={style}
      className="pointer-events-none max-w-[min(220px,calc(100vw-16px))] px-2.5 py-1.5 text-xs font-medium leading-snug text-white bg-gray-900 rounded-lg shadow-lg border border-white/10"
    >
      {content}
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={`inline-flex max-w-full ${className}`.trim()}
        onMouseEnter={() => {
          setOpen(true);
          requestAnimationFrame(position);
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => {
          setOpen(true);
          requestAnimationFrame(position);
        }}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {typeof document !== 'undefined' && tip ? createPortal(tip, document.body) : null}
    </>
  );
}
