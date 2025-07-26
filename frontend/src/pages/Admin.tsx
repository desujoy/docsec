import { MainLayout } from "../components/layout/MainLayout";
import { AdminPanel } from "../components/features/AdminPanel";
import { useFileRegistry } from "../hooks/useFileRegistry";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock } from "lucide-react";

export function Admin() {
  const { owner } = useFileRegistry();
  const { address } = useAccount();
  const isOwner = owner === address;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>

          {isOwner ? (
            <Badge variant="default" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access Granted
            </Badge>
          ) : (
            <Badge variant="destructive" className="px-3 py-1">
              <Lock className="h-3 w-3 mr-1" />
              Access Denied
            </Badge>
          )}
        </div>

        {isOwner ? (
          <Card>
            <CardHeader>
              <CardTitle>System Administration</CardTitle>
              <CardDescription>
                Manage uploaders and system permissions for the file registry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminPanel />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center space-y-4">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">Unauthorized Access</h3>
                <p className="text-sm text-muted-foreground">
                  You are not authorized to view this page. Only the contract
                  owner can access the admin panel.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
