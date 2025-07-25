import { useAccount } from "wagmi";
import { MainLayout } from "../components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Upload,
  FileCheck,
  Settings,
  History,
  ArrowRight,
} from "lucide-react";

export function Home() {
  const { isConnected, address } = useAccount();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">DocSec</h1>
          </div>

          {isConnected ? (
            <div className="space-y-4">
              <Badge variant="default" className="px-4 py-2">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
              <p className="text-muted-foreground">
                Welcome back! Choose an action below to manage your files.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2">
                Wallet Not Connected
              </Badge>
              <p className="text-muted-foreground">
                Please connect your wallet to access the file integrity system.
              </p>
            </div>
          )}
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Upload File</CardTitle>
                  <CardDescription>
                    Generate cryptographic proofs for your files
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" disabled={!isConnected}>
                <a
                  href="/upload"
                  className="flex items-center justify-center space-x-2"
                >
                  <span>Upload File</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Verify File</CardTitle>
                  <CardDescription>
                    Check file integrity and authenticity
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                asChild
                className="w-full"
                disabled={!isConnected}
              >
                <a
                  href="/verify"
                  className="flex items-center justify-center space-x-2"
                >
                  <span>Verify File</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        {isConnected && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Admin Panel</CardTitle>
                    <CardDescription>
                      Manage system settings and permissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                >
                  <a href="/admin">Access Admin Panel</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <History className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Audit Trail</CardTitle>
                    <CardDescription>
                      View system activity and file history
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                >
                  <a href="/audit">View Audit Trail</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
