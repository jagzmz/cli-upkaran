import React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icon";

export function IconDemo() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">Icon Examples</h2>
      
      <div className="flex flex-wrap gap-4">
        <Button>
          <Icons.Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        
        <Button variant="outline">
          <Icons.Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        
        <Button variant="secondary">
          <Icons.Bell className="mr-2 h-4 w-4" />
          Notifications
        </Button>
        
        <Button variant="ghost">
          <Icons.Mail className="mr-2 h-4 w-4" />
          Messages
        </Button>
        
        <Button variant="destructive">
          <Icons.Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
      
      <div className="grid grid-cols-5 gap-4 mt-4">
        <Icons.Sun className="h-6 w-6" />
        <Icons.Moon className="h-6 w-6" />
        <Icons.Search className="h-6 w-6" />
        <Icons.Check className="h-6 w-6" />
        <Icons.User className="h-6 w-6" />
      </div>
    </div>
  );
} 