"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";

export function MotionProvider({ children }) {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const revealed = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealed.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
    );

    const selector = "main section, main article";
    const scan = (root) => {
      const elements = [];
      if (root instanceof Element && root.matches(selector)) elements.push(root);
      elements.push(...root.querySelectorAll(selector));

      elements.forEach((element) => {
        if (!element.classList.contains("motion-reveal")) {
          element.classList.add("motion-reveal");
          revealed.observe(element);
        }
      });
    };

    scan(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) scan(node);
        });
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      revealed.disconnect();
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
}
