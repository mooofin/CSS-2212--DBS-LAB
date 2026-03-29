import * as React from "react"
import { Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const [theme, setTheme] = React.useState("light")

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  React.useEffect(() => {
    const root = window.document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-10 w-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      {theme === "light" ? (
        <Moon size={18} className="text-foreground/70 group-hover:text-primary transition-colors relative z-10" />
      ) : (
        <Sun size={18} className="text-foreground/70 group-hover:text-primary transition-colors relative z-10" />
      )}
    </button>
  )
}
