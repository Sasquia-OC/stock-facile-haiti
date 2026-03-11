import { LogOut, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderMenuProps {
  t: (key: string) => string;
  onSignOut: () => void;
  onOpenReports?: () => void;
}

export function HeaderMenu({ t, onSignOut, onOpenReports }: HeaderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onOpenReports && (
          <>
            <DropdownMenuItem onClick={onOpenReports} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              {t("reports")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
