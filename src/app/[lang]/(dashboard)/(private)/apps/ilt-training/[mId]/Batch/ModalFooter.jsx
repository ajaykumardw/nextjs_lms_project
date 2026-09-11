import { Box, Button } from "@mui/material";

const ModalFooter = ({ onClose, onSave, onPublish, saving, canPublish }) => (
    <Box mt={3} display="flex" justifyContent="center" gap={2}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
            Close
        </Button>
        <Button variant="outlined" onClick={onPublish} disabled={!canPublish || saving}>
            Publish
        </Button>
        <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
        </Button>
    </Box>
);

export default ModalFooter;
