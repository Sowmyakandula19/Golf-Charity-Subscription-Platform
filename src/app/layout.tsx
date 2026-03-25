import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Golf Charity Subscription Platform',
  description: 'Track your scores and support your favorite charities.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
