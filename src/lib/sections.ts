/** Numera as seções de uma página na ordem em que aparecem: "01", "02"... */
export function sectionCounter(): () => string {
  let count = 0;
  return () => {
    count += 1;
    return String(count).padStart(2, "0");
  };
}
