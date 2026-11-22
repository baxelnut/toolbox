export function printWithTitle(title: string): Promise<void> {
  return new Promise((resolve) => {
    const previous = document.title;

    const finish = () => {
      window.removeEventListener("afterprint", finish);
      document.title = previous;
      resolve();
    };

    window.addEventListener("afterprint", finish);
    document.title = title;
    window.print();
  });
}
