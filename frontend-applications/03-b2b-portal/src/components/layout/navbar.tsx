'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  User,
  Settings,
  LogOut,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import LuxuryLogo from '@harshadelights/shared-components/src/components/LuxuryLogo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Products', href: '/products', icon: ShoppingCart },
  { name: 'Orders', href: '/orders', icon: CreditCard },
  { name: 'Account', href: '/account', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, organization, signOut } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <LuxuryLogo size="md" variant="elegant" priority />
              <span className="text-xl font-bold bg-royal-gradient bg-clip-text text-transparent font-royal">
                Harsha Delights B2B
              </span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-4">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-b-2 border-primary text-foreground'
                        : 'border-b-2 border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="text-sm">
                <div className="font-medium">{organization?.name}</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.firstName || user.email} />
                    <AvatarFallback>
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Role: {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/users">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
