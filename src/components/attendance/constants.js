export const RANGES = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
];

export const RANGE_LABELS = Object.fromEntries(RANGES.map((r) => [r.value, r.label]));
