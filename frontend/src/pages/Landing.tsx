import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from "../components/shared/ConnectButton";
import { Shield, ArrowRight, Lock, Zap } from "lucide-react";

export function Landing() {
  const { isConnected } = useAccount();

  if (isConnected) {
    // Redirect to home if already connected
    window.location.href = "/home";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="relative">
              <Shield className="h-12 w-12 text-primary" />
              <div className="absolute -top-1 -right-1">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight">
              DocSec
            </span>
          </div>

          {/* Badge */}
          <Badge variant="secondary" className="mx-auto px-4 py-2 text-sm">
            <Zap className="h-3 w-3 mr-2" />
            Zero-Knowledge Document Verification
          </Badge>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Secure Document Integrity
              <span className="text-primary block mt-2">Made Simple</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Prove document authenticity using cryptographic proofs and blockchain
              technology without revealing sensitive data.
            </p>
          </div>

          {/* Authentication Card */}
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Get Started</CardTitle>
              <CardDescription>
                Connect your MetaMask wallet to access the secure document
                verification system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConnectButton />
              <p className="text-xs text-muted-foreground text-center">
                Don't have MetaMask?{" "}
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Install it here
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Upload Files</h3>
              <p className="text-xs text-muted-foreground">
                Generate cryptographic proofs
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Blockchain Storage</h3>
              <p className="text-xs text-muted-foreground">
                Immutable verification records
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Verify Integrity</h3>
              <p className="text-xs text-muted-foreground">
                Instant authenticity checks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
