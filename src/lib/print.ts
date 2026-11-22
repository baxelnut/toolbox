export const PAGE_FLUSH = "@page { size: A4; margin: 0; }";

export function printWithTitle(title: string, pageCss: string): Promise<void> {
  return new Promise((resolve) => {
    const previous = document.title;
    const style = document.createElement("style");
    style.textContent = pageCss;
    document.head.append(style);

    const finish = () => {
      window.removeEventListener("afterprint", finish);
      style.remove();
      document.title = previous;
      resolve();
    };

    window.addEventListener("afterprint", finish);
    document.title = title;
    window.print();
  });
}
