"use client";

import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
} from "@mui/material";

const Header = () => {
    return (
        <Box
            sx={{
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
            }}
        >
            <Typography variant="h4" fontWeight={700}>
                Attendance Dashboard
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                        defaultValue="all"
                        displayEmpty
                        renderValue={(value) => {
                            if (value === "all") {
                                return (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <i className="tabler-filter" style={{ fontSize: 18 }} />
                                        All Filters
                                    </Box>
                                );
                            }

                            return value;
                        }}
                    >
                        <MenuItem value="all">
                            <Box display="flex" alignItems="center" gap={1}>
                                <i className="tabler-filter" style={{ fontSize: 18 }} />
                                All Filters
                            </Box>
                        </MenuItem>

                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    placeholder="Search..."
                    sx={{ width: 250 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <i
                                    className="tabler-search"
                                    style={{
                                        fontSize: 18,
                                        color: "#6c757d",
                                    }}
                                />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </Box>
    );
};

export default Header;
