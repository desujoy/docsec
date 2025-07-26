import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, LogOut } from "lucide-react";

export function ConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {address?.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <Badge variant="secondary" className="text-xs">
              Chain: {chainId}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="flex items-center space-x-2"
        >
          <Wallet className="h-4 w-4" />
          <span>Connect {connector.name}</span>
        </Button>
      ))}
    </div>
  );
}
