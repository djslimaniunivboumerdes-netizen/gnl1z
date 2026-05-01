import { Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";
import { Badge } from "@/components/ui/badge";
import { META } from "@/data";

export function AppHeader() {
  const { theme, toggle } = useTheme();
  const { lang, toggle: toggleLang } = useI18n();

  return (
    <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30 flex items-center px-3 md:px-5 gap-3">
      <SidebarTrigger className="text-foreground hover:text-accent" />
      <div className="hidden md:flex items-center gap-2 min-w-0">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{META.project}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-xs text-muted-foreground truncate">{META.location}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:inline-flex border-accent/40 text-accent bg-accent/10 font-mono text-[10px]">
          {META.process}
        </Badge>
        <Button variant="ghost" size="sm" onClick={toggleLang} className="font-mono text-xs gap-1.5">
          <Languages className="h-4 w-4" />
          {lang.toUpperCase()}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
