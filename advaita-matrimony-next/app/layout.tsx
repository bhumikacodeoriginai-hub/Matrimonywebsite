import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Advaita Matrimony | Two journeys. One beginning.',
  description: 'Inclusive matrimony with dignity for every kind of journey.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
