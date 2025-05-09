import * as React from "react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 rounded-md bg-transparent border-none hover:bg-gray-100/10"
        >
          {/* Sun icon for light mode */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
          
          {/* Moon icon for dark mode */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-background border-border shadow-lg rounded-md min-w-[8rem] p-1"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`flex items-center cursor-pointer px-2.5 py-2 text-sm rounded-sm ${
            theme === 'light' 
              ? 'bg-yellow-500/10 text-yellow-500' 
              : 'hover:bg-muted/50 text-foreground/90'
          }`}
        >
          <Sun className="mr-2.5 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`flex items-center cursor-pointer px-2.5 py-2 text-sm rounded-sm ${
            theme === 'dark' 
              ? 'bg-blue-500/10 text-blue-400' 
              : 'hover:bg-muted/50 text-foreground/90'
          }`}
        >
          <Moon className="mr-2.5 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`flex items-center cursor-pointer px-2.5 py-2 text-sm rounded-sm ${
            theme === 'system' 
              ? 'bg-gray-500/10 text-foreground' 
              : 'hover:bg-muted/50 text-foreground/90'
          }`}
        >
          <Monitor className="mr-2.5 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}