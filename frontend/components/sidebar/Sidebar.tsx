'use client';

import {
  renderThumb,
  renderTrack,
  renderView
} from '@/components/scrollbar/Scrollbar';
import Links from '@/components/sidebar/components/Links';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OpenContext } from '@/contexts/layout';
import { IRoute } from '@/types/types';
import { getCurrentUser, logout } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useContext } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { HiX } from 'react-icons/hi';
import { HiBolt, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const { routes } = props;
  const { open, setOpen } = useContext(OpenContext);
  const user = getCurrentUser();
  const currentPath = usePathname();

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`lg:!z-99 fixed !z-[99] min-h-full w-[300px] transition-all md:!z-[99] xl:!z-0 ${
        props.variant === 'auth' ? 'xl:hidden' : 'xl:block'
      } ${open ? '' : '-translate-x-[120%] xl:translate-x-[unset]'}`}
    >
      <Card
        className={`m-3 ml-3 h-[96.5vh] w-full overflow-hidden !rounded-md border-zinc-200 dark:border-zinc-800 sm:my-4 sm:mr-4 md:m-5 md:mr-[-50px]`}
      >
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <span
                className="absolute top-4 block cursor-pointer text-zinc-200 dark:text-white/40 xl:hidden"
                onClick={() => setOpen(false)}
              >
                <HiX />
              </span>
              <div className={`mt-8 flex items-center justify-center`}>
                <div className="me-2 flex h-[40px] w-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  <HiBolt className="h-5 w-5" />
                </div>
                <h5 className="text-2xl font-bold leading-5 text-foreground dark:text-white">
                  Nano Banana
                </h5>
              </div>
              <div className="mb-8 mt-8 h-px bg-zinc-200 dark:bg-white/10" />
              <ul className="-me-4">
                <Links routes={routes} />
              </ul>
            </div>
            <div className="mb-9 mt-7">
              <div className="mt-5 flex w-full items-center rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                <Link href="/profile">
                  <Avatar className="min-h-10 min-w-10">
                    <AvatarFallback className="font-bold dark:text-foreground bg-blue-600 text-white">
                      {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Link href="/profile">
                  <p className="ml-2 mr-2 w-max max-w-100% flex items-center text-sm font-semibold leading-none text-foreground dark:text-white">
                    {user?.username || 'User'}
                  </p>
                </Link>
                <Button
                  variant="outline"
                  className="ml-auto flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full p-0 text-center text-sm font-medium hover:dark:text-white"
                  onClick={handleLogout}
                >
                  <HiOutlineArrowRightOnRectangle
                    className="h-4 w-4 stroke-2 text-foreground dark:text-white"
                    width="16px"
                    height="16px"
                    color="inherit"
                  />
                </Button>
              </div>
            </div>
          </div>
        </Scrollbars>
      </Card>
    </div>
  );
}

export default Sidebar;
