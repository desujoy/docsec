import { ConnectButton } from "../shared/ConnectButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Home,
  Upload,
  FileCheck,
  Settings,
  History,
} from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <a
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DocSec</span>
          </a>

          <Separator orientation="vertical" className="h-6" />

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/upload" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/verify" className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4" />
                <span>Verify</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/admin" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/audit" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Audit</span>
              </a>
            </Button>
          </div>
        </div>

        <ConnectButton />
      </div>
    </nav>
  );
}
