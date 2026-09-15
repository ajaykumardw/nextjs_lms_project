import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@mui/material";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";

import NominationBatch from "../Batch/NominationBatch";
import DefinedBatch from "../Batch/DefinedBatch";

const BatchModal = ({
    openBatchModal,
    setOpenBatchModal,
    batchType,
    mId,
    token,
    handleFetchData,
    setValue,
    users = [],
    canManage = false,
    onBatchSaved,
    finalData = {},
    editingBatch = null,
}) => {
    const isEdit = Boolean(
        editingBatch?._id
    );

    const titleMap = {
        defined: isEdit
            ? "Edit defined batch"
            : "Create a defined batch",

        nominations: isEdit
            ? "Edit nominations batch"
            : "Create a nominations batch",
    };

    const handleClose = () => {
        setOpenBatchModal(false);
    };

    return (
        <Dialog
            open={openBatchModal}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            sx={{
                "& .MuiDialog-paper": {
                    overflow: "visible",
                },
            }}
        >
            <DialogCloseButton
                onClick={handleClose}
            >
                <i className="tabler-x" />
            </DialogCloseButton>

            <DialogTitle className="text-center">
                {titleMap[batchType] ||
                    "Create a batch"}
            </DialogTitle>

            <DialogContent
                sx={{
                    maxHeight: "75vh",
                    overflowY: "auto",
                }}
            >
                {batchType ===
                    "defined" && (
                        <DefinedBatch
                            setOpenBatchModal={setOpenBatchModal}
                            mId={mId}
                            handleFetchData={handleFetchData}
                            token={token}
                            users={users}
                            setValue={setValue}
                            finalData={finalData}
                            canManage={canManage}
                            onBatchSaved={onBatchSaved}
                            editingBatch={editingBatch}
                        />
                    )}

                {batchType ===
                    "nominations" && (
                        <NominationBatch
                            setOpenBatchModal={setOpenBatchModal}
                            mId={mId}
                            setValue={setValue}
                            token={token}
                            handleFetchData={handleFetchData}
                            users={users}
                            finalData={finalData}
                            canManage={canManage}
                            onBatchSaved={onBatchSaved}
                            editingBatch={editingBatch}
                        />
                    )}
            </DialogContent>
        </Dialog>
    );
};

export default BatchModal;
