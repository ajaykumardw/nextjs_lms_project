import {
    Checkbox,
    ListItemText,
    MenuItem,
    TextField,
} from "@mui/material";

const fieldStyleSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 1,
    },
};

const CompanyLearnerSelector = ({
    finalData = {},
    selectedIds = [],
    onChange,
    disabled = false,
}) => {
    const normalizedSelectedIds = (
        selectedIds || []
    ).map(String);

    const learners = Array.isArray(
        finalData?.learner
    )
        ? finalData.learner
        : [];

    const handleChange = (event) => {
        const value =
            event.target.value;

        const ids = Array.isArray(value)
            ? value.map(String)
            : String(value)
                .split(",")
                .filter(Boolean)
                .map(String);

        onChange?.(ids);
    };

    return (
        <TextField
            select
            fullWidth
            size="small"
            label="Select learners"
            value={
                normalizedSelectedIds
            }
            disabled={disabled}
            onChange={handleChange}
            sx={fieldStyleSx}
            SelectProps={{
                multiple: true,

                renderValue: (
                    selected
                ) => {
                    if (
                        !selected ||
                        selected.length === 0
                    ) {
                        return "Select learners";
                    }

                    return `${selected.length
                        } learner${selected.length > 1
                            ? "s"
                            : ""
                        } selected`;
                },
            }}
        >
            {learners.length === 0 ? (
                <MenuItem disabled>
                    No company learners
                    available
                </MenuItem>
            ) : (
                learners.map((user) => {

                    const id = String(user?._id || user?.id || "");
                    const name = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Unnamed learner";
                    const isSelected = normalizedSelectedIds.includes(id);

                    return (
                        <MenuItem
                            key={id}
                            value={id}
                        >
                            <Checkbox
                                size="small"
                                checked={isSelected}
                            />

                            <ListItemText
                                primary={name}
                                secondary={user?.emp_id || user?.email || ""}
                            />
                        </MenuItem>
                    );
                })
            )}
        </TextField>
    );
};

export default CompanyLearnerSelector;
