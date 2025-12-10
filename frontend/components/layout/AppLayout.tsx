'use client';

import { routes, adminRoutes } from '@/components/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import Navbar from '@/components/navbar/NavbarAdmin';
import { getActiveRoute } from '@/utils/navigation';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { OpenContext } from '@/contexts/layout';
import { getCurrentUser, isAdmin } from '@/lib/auth';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = getCurrentUser();
  const userIsAdmin = isAdmin();

  // Combine routes with admin routes if user is admin
  const allRoutes = userIsAdmin ? [...routes, ...adminRoutes] : routes;

  return (
    <OpenContext.Provider value={{ open, setOpen }}>
      <div className="flex h-full w-full bg-gray-950">
        <Sidebar routes={allRoutes} />
        <div className="h-full w-full">
          <main className="mx-2.5 flex-none transition-all md:pr-2 xl:ml-[328px]">
            <div className="mx-auto min-h-screen p-2 !pt-[90px] md:p-2 md:!pt-[118px]">
              <Navbar brandText={getActiveRoute(allRoutes, pathname)} />
              {children}
            </div>
          </main>
        </div>
      </div>
    </OpenContext.Provider>
  );
}
