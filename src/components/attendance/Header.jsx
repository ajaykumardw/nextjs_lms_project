"use client";

import { Box, Typography, TextField, InputAdornment, FormControl, Select, MenuItem } from "@mui/material";

import { RANGES } from "./constants";

const Header = ({ filters, batches = [], onChange }) => {

    // if the selected batch disappears from the list, fall back to "all"

    const batchValue = filters.batch_id === "all" || batches.some((b) => b._id === filters.batch_id)
        ? filters.batch_id
        : "all";

    return (
        <Box
            sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "stretch", md: "center" },
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
            }}
        >
            <Typography variant="h4" fontWeight={700}>
                Attendance dashboard
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 150, flex: { xs: "1 1 140px", md: "0 0 auto" } }}>
                    <Select
                        value={filters.range}
                        onChange={(e) => onChange({ range: e.target.value })}
                        inputProps={{ "aria-label": "Date range" }}
                    >
                        {RANGES.map((r) => (
                            <MenuItem key={r.value} value={r.value}>
                                {r.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200, flex: { xs: "1 1 180px", md: "0 0 auto" } }}>
                    <Select
                        value={batchValue}
                        onChange={(e) => onChange({ batch_id: e.target.value })}
                        inputProps={{ "aria-label": "Batch" }}
                        renderValue={(value) => (
                            <Box display="flex" alignItems="center" gap={1}>
                                <i className="tabler-filter" style={{ fontSize: 18 }} />
                                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {value === "all"
                                        ? "All batches"
                                        : batches.find((b) => b._id === value)?.name || "Batch"}
                                </Box>
                            </Box>
                        )}
                    >
                        <MenuItem value="all">All batches</MenuItem>
                        {batches.map((b) => (
                            <MenuItem key={b._id} value={b._id}>
                                {b.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    placeholder="Search learner or batch"
                    value={filters.search}
                    onChange={(e) => onChange({ search: e.target.value })}
                    sx={{ width: { xs: "100%", md: 260 } }}
                    slotProps={{
                        htmlInput: { "aria-label": "Search learner or batch" },
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="tabler-search" style={{ fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default Header;
