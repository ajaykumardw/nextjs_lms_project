import { useRef } from "react";

import { Box, Button, Chip, FormHelperText } from "@mui/material";

const MAX_ATTACHMENT_MB = 10;

const AttachmentField = ({ attachment, onChange, error }) => {
    const inputRef = useRef(null);

    const handlePick = () => inputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
            onChange(null, `File is too large. Max size is ${MAX_ATTACHMENT_MB}MB.`);
            return;
        }

        onChange(file, "");
    };

    return (
        <Box>
            <input ref={inputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />
            {!attachment ? (
                <Button variant="outlined" fullWidth onClick={handlePick} sx={{ whiteSpace: "nowrap" }}>
                    Add attachment
                </Button>
            ) : (
                <Chip
                    icon={<i className="tabler-paperclip" />}
                    label={attachment.name}
                    onDelete={() => onChange(null, "")}
                    sx={{ maxWidth: "100%" }}
                />
            )}
            {error && (
                <FormHelperText error sx={{ ml: 0 }}>
                    {error}
                </FormHelperText>
            )}
        </Box>
    );
};

export default AttachmentField;
