"use client";
export function PrintButton() {
  return <button onClick={() => window.print()} className="btn btn-primary no-print">🖨 Print receipt</button>;
}
