import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";

function ModeToggle() {

    const { setTheme, theme } = useTheme();

    return (
        <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="bg-transparent border-0 text-inherit"
            variant="outline"
            size="icon"
        >
            {theme === 'dark' ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
        </Button>
    );
};

export default ModeToggle;