const ActivityCreateModal = ({ open, data, setOpen, setSelected, selected, setNext, slug, token, mId, fetchActivities }) => {

    const handleChange = (selectedItem) => {
        setSelected(selectedItem?._id);
    }

    const submitActivity = async () => {
        try {
            const response = await fetch(`${API_URL}/company/activity/form/${mId}/${selected}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await response.json();

            if (response.ok) {
                const value = result?.data;

                toast.success("Activity added successfully", {
                    autoClose: 1000
                })
                fetchActivities()
                setSelected()
                setOpen(false)
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    const handleNext = () => {
        submitActivity();
        setNext(true)
    }

    return (
        <>
            <Dialog
                fullWidth
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="lg"
                scroll="body"
                closeAfterTransition={false}
                sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
            >
                <DialogCloseButton onClick={() => {
                    setOpen(false)
                    setSelected()
                }} disableRipple>
                    <i className="tabler-x" />
                </DialogCloseButton>

                <DialogTitle
                    variant="h4"
                    className="flex flex-col gap-2 text-center sm:pbs-5 sm:pbe-5 sm:pli-5"
                >
                    <Typography component="span" className="flex flex-col items-center">
                        {"Select any Activity " + `${slug}` + " to create"}
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ px: 2 }}>
                        <RadioGroup
                            name="custom-radios-icons"
                            value={selected || ''}
                            onChange={(e) => {

                                const selectedItem = data?.activity_data?.find(
                                    (item) => item.title === e.target.value
                                )

                                handleChange(selectedItem)
                            }}
                        >
                            <Grid container spacing={4}>
                                {data?.activity_data?.length > 0 && data?.activity_data?.map((item, index) => {
                                    const isSelected = selected === item._id

                                    return (
                                        <Grid item size={{ xs: 12, sm: 3 }} key={index}>
                                            <Card
                                                variant="outlined"
                                                onClick={() => item.status && handleChange(item)}
                                                sx={{
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    opacity: item.status ? 0.5 : 1,
                                                    borderColor: isSelected ? 'primary.main' : 'grey.300',
                                                    '&:hover': {
                                                        borderColor: item.status ? 'primary.main' : 'grey.300',
                                                    },
                                                }}
                                            >
                                                <CardContent
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        gap: 1.5,
                                                        px: 2,
                                                        py: 3,
                                                    }}
                                                >
                                                    <Box
                                                        component="div"
                                                        sx={{ inlineSize: 40, blockSize: 40 }}
                                                        color={"black"}
                                                        dangerouslySetInnerHTML={{ __html: item.svg_content }}
                                                    />

                                                    <Radio
                                                        color="primary"
                                                        checked={isSelected}
                                                        value={item.title}
                                                    />

                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={1000} color="black">
                                                            {item.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="black">
                                                            {item.description}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>

                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </RadioGroup>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button variant="outlined" disabled={!selected} onClick={handleNext}>
                        Next
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ActivityCreateModal;
