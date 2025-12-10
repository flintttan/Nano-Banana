// Navigation routes for Nano Banana AI Platform
import { IRoute } from '@/types/types';
import {
  HiOutlineCog8Tooth,
  HiOutlineHome,
  HiOutlinePhoto,
  HiOutlineSparkles,
  HiOutlineKey,
  HiOutlineUsers,
  HiOutlineUser
} from 'react-icons/hi2';

export const routes: IRoute[] = [
  {
    name: 'Workspace',
    path: '/workspace',
    icon: <HiOutlineSparkles className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'Gallery',
    path: '/gallery',
    icon: <HiOutlinePhoto className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: <HiOutlineUser className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'API Keys',
    path: '/api-keys',
    icon: <HiOutlineKey className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  }
];

export const adminRoutes: IRoute[] = [
  {
    name: 'Admin Panel',
    path: '/admin',
    icon: <HiOutlineUsers className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  }
];
