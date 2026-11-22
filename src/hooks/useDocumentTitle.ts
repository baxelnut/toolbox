import { useEffect } from "react";
import { SITE } from "@/data/site";

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title
      ? `${title} | ${SITE.name}`
      : `${SITE.name} | ${SITE.owner}`;
  }, [title]);
}
