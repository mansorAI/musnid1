"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const options = [
  {
    value: "dark",
    label: "داكن",
    description: "الافتراضي لمسند ولوحات التشغيل",
    icon: Moon,
    color: "#7a5af8",
  },
  {
    value: "light",
    label: "فاتح",
    description: "مناسب للعمل النهاري والشاشات الساطعة",
    icon: Sun,
    color: "#15b79e",
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const current = theme ?? "dark";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon;
        const active = current === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={`rounded-xl border bg-surface-50 p-4 text-right transition-all dark:bg-surface-800/30 ${
              active
                ? "border-primary-300 shadow-lg shadow-primary-500/10 dark:border-primary-700"
                : "border-surface-200 hover:border-surface-300 dark:border-surface-700/50 dark:hover:border-surface-600"
            }`}
            style={{ borderTopColor: option.color, borderTopWidth: 3 }}
            aria-pressed={active}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${option.color}1a`, color: option.color }}
              >
                <Icon className="size-5" />
              </div>
              <span className="text-base font-extrabold text-surface-900 dark:text-white">
                {option.label}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-surface-500 dark:text-surface-400">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
