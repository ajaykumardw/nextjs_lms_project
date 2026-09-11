const BatchModal = ({ openBatchModal, setOpenBatchModal, batchType, mId, token, users, canManage, onBatchSaved }) => {
    const titleMap = {
        defined: "Create a defined batch",
        nominations: "Create a nominations batch",
    };

    return (
        <Dialog
            open={openBatchModal}
            onClose={() => setOpenBatchModal(false)}
            fullWidth
            maxWidth="md"
            sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}
        >
            <DialogCloseButton onClick={() => setOpenBatchModal(false)}>
                <i className="tabler-x" />
            </DialogCloseButton>
            <DialogTitle className="text-center">{titleMap[batchType] ?? "Create a batch"}</DialogTitle>

            <DialogContent sx={{ maxHeight: "75vh", overflowY: "auto" }}>
                {batchType === "defined" && (
                    <DefinedBatch
                        setOpenBatchModal={setOpenBatchModal}
                        mId={mId}
                        token={token}
                        users={users}
                        canManage={canManage}
                        onBatchSaved={onBatchSaved}
                    />
                )}
                {batchType === "nominations" && (
                    <NominationBatch
                        setOpenBatchModal={setOpenBatchModal}
                        mId={mId}
                        token={token}
                        users={users}
                        canManage={canManage}
                        onBatchSaved={onBatchSaved}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default BatchModal;

