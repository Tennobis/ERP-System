import { useState, useMemo, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SimpleSearchableSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
}

export function SimpleSearchableSelect({
    value,
    onValueChange,
    options,
    placeholder = "Search and select...",
}: SimpleSearchableSelectProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                option.value.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, options]);

    const selectedLabel = options.find((opt) => opt.value === value)?.label;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setOpen(true);
        setHighlightedIndex(0);
    };

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue);
        setSearchQuery("");
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open && e.key === "ArrowDown") {
            setOpen(true);
            return;
        }

        if (!open) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    Math.min(prev + 1, filteredOptions.length - 1)
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                }
                break;
            case "Escape":
                e.preventDefault();
                setOpen(false);
                break;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <Input
                value={searchQuery || selectedLabel || ""}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (options.length > 0) setOpen(true);
                }}
                placeholder={placeholder}
                autoComplete="off"
                className="pr-10"
            />
            {open && filteredOptions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 bg-white border border-input rounded-md shadow-md mt-1 z-50 max-h-60 overflow-y-auto"
                >
                    {filteredOptions.map((option, index) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors",
                                index === highlightedIndex
                                    ? "bg-accent"
                                    : "hover:bg-muted",
                                value === option.value && "bg-blue-50"
                            )}
                        >
                            <Check
                                className={cn(
                                    "h-4 w-4 flex-shrink-0",
                                    value === option.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                )}
                            />
                            <span className="text-sm">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
