import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Shield, UserCog } from 'lucide-react';

const SUPER_ADMIN_PASSWORD = 'tlhpteladan123';
const ADMIN_PASSWORD = 'adminteladan123';
const SESSION_KEY = 'admin_authenticated';
const ADMIN_LEVEL_KEY = 'admin_level';

export type AdminLevel = 'super_admin' | 'admin';

interface AdminPasswordDialogProps {
  onAuthenticated: (level: AdminLevel) => void;
}

export function AdminPasswordDialog({ onAuthenticated }: AdminPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Check if already authenticated in this session
    const isAuth = sessionStorage.getItem(SESSION_KEY);
    const adminLevel = sessionStorage.getItem(ADMIN_LEVEL_KEY) as AdminLevel;
    if (isAuth === 'true' && adminLevel) {
      onAuthenticated(adminLevel);
      setIsOpen(false);
    }
  }, [onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let adminLevel: AdminLevel | null = null;
    
    if (password === SUPER_ADMIN_PASSWORD) {
      adminLevel = 'super_admin';
    } else if (password === ADMIN_PASSWORD) {
      adminLevel = 'admin';
    }
    
    if (adminLevel) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      sessionStorage.setItem(ADMIN_LEVEL_KEY, adminLevel);
      setError('');
      setIsOpen(false);
      onAuthenticated(adminLevel);
    } else {
      setError('Password salah! Silakan coba lagi.');
      setPassword('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Authentication
          </DialogTitle>
          <DialogDescription>
            Masukkan password untuk mengakses halaman admin
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Masukkan password admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          
          <Button type="submit" className="w-full">
            Login
          </Button>
          
          <div className="space-y-2 pt-4 border-t">
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3 h-3" />
                <span className="font-semibold">Super Admin:</span> Akses penuh semua fitur
              </div>
              <div className="flex items-center gap-2">
                <UserCog className="w-3 h-3" />
                <span className="font-semibold">Admin:</span> Akses hanya overview dan hasil voting
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Function to logout admin
export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ADMIN_LEVEL_KEY);
  window.location.reload();
}

// Function to get current admin level
export function getAdminLevel(): AdminLevel | null {
  return sessionStorage.getItem(ADMIN_LEVEL_KEY) as AdminLevel | null;
}

// Function to check if super admin
export function isSuperAdmin(): boolean {
  return getAdminLevel() === 'super_admin';
}
