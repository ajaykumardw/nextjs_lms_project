import { useMemo } from "react";

import { TextField, MenuItem, Checkbox, ListItemText } from "@mui/material";

const fieldStyleSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1 },
};

const CompanyLearnerSelector = ({
    users = [],
    selectedIds = [],
    onChange,
    disabled = false,
}) => {

    const learnerUsers = useMemo(() => {
        return (users || []).filter((user) => {
            const roles = Array.isArray(user.roles)
                ? user.roles.map((r) =>
                    typeof r === "string"
                        ? r.toLowerCase()
                        : String(r?.name || r?.role || "").toLowerCase()
                )
                : [];

            const role = String(user.role || "").toLowerCase();

            // Adjust this role check if your backend uses another field.
            return (
                role === "learner" ||
                roles.includes("learner")
            );
        });
    }, [users]);

    return (
        <TextField
            select
            fullWidth
            size="small"
            label="Select learners"
            value={selectedIds}
            disabled={disabled}
            onChange={(e) => {
                const value = e.target.value;

                onChange(
                    typeof value === "string"
                        ? value.split(",").filter(Boolean)
                        : value
                );
            }}
            SelectProps={{
                multiple: true,
                renderValue: (selected) => {
                    if (!selected?.length) {
                        return "Select learners";
                    }

                    return `${selected.length} learner${selected.length > 1 ? "s" : ""} selected`;
                },
            }}
            sx={fieldStyleSx}
        >
            {learnerUsers.length === 0 ? (
                <MenuItem disabled>
                    No company learners available
                </MenuItem>
            ) : (
                learnerUsers.map((user) => {
                    const id = String(user._id);

                    const name =
                        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                        user.name ||
                        user.email ||
                        "Unnamed user";

                    return (
                        <MenuItem key={id} value={id}>
                            <Checkbox
                                size="small"
                                checked={selectedIds.includes(id)}
                            />

                            <ListItemText
                                primary={name}
                                secondary={user.email || ""}
                            />
                        </MenuItem>
                    );
                })
            )}
        </TextField>
    );
};

export default CompanyLearnerSelector;
