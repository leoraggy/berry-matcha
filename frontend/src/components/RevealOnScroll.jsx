import { useEffect, useRef, useState } from "react";
import styles from "./styles/RevealOnScroll.module.css";

function RevealOnScroll({ children, className = "" }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`${styles["scroll-reveal"]}${isVisible ? ` ${styles["is-visible"]}` : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}

export default RevealOnScroll;
