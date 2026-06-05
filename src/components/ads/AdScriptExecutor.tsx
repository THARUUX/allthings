"use client";

import { useEffect, useRef } from "react";

interface AdScriptExecutorProps {
  html: string;
  className?: string;
}

export default function AdScriptExecutor({ html, className }: AdScriptExecutorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;

    const container = containerRef.current;
    
    // Clear container contents first
    container.innerHTML = "";

    // Parse the html string into DOM elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const childNodes = Array.from(doc.body.childNodes);

    // Track script tags to load them sequentially
    const scriptsToLoad: HTMLScriptElement[] = [];

    // Append non-script nodes and gather script nodes
    childNodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        scriptsToLoad.push(node as HTMLScriptElement);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });

    // Run/load scripts sequentially to preserve dependencies
    let isCancelled = false;

    async function loadScripts() {
      for (const oldScript of scriptsToLoad) {
        if (isCancelled) break;

        await new Promise<void>((resolve) => {
          const newScript = document.createElement("script");
          
          // Copy all attributes
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Copy script text content
          if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
          }

          if (oldScript.src) {
            newScript.onload = () => resolve();
            newScript.onerror = () => resolve(); // continue even if one fails
            container.appendChild(newScript);
          } else {
            // Inline scripts execute synchronously when appended
            container.appendChild(newScript);
            resolve();
          }
        });
      }
    }

    loadScripts();

    return () => {
      isCancelled = true;
      container.innerHTML = "";
    };
  }, [html]);

  return <div ref={containerRef} className={className} />;
}
