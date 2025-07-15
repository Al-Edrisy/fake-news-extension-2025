import { useRef, useEffect } from 'react';

/**
 * useDraggable - Makes an element draggable by a handle.
 * @param handleSelector - CSS selector for the drag handle (e.g., '.popup-header')
 * @returns ref to attach to the draggable element
 */
export function useDraggable(handleSelector: string) {
  const dragRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: 0, y: 0, dx: 0, dy: 0, dragging: false });
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const node = dragRef.current;
    if (!node) return;
    const handle = node.querySelector(handleSelector) as HTMLElement | null;
    if (!handle) return;

    let startX = 0, startY = 0;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      pos.current.dragging = true;
      startX = e.clientX - pos.current.x;
      startY = e.clientY - pos.current.y;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!pos.current.dragging) return;
      pos.current.x = e.clientX - startX;
      pos.current.y = e.clientY - startY;
      // Constrain within viewport
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = node.getBoundingClientRect();
      pos.current.x = Math.max(0, Math.min(pos.current.x, vw - rect.width));
      pos.current.y = Math.max(0, Math.min(pos.current.y, vh - rect.height));
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(() => {
        node.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      });
    };

    const onMouseUp = () => {
      pos.current.dragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [handleSelector]);

  return dragRef;
} 