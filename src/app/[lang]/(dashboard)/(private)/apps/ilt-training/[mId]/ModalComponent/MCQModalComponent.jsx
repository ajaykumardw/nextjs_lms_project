const MCQModalComponent = ({ open, setOpen, activeQuestionId, setOptionData, optionData }) => {
    const handleClose = () => setOpen(false)

    const [customOptions, setCustomOptions] = useState([''])
    const [allowMulti, setAllowMulti] = useState(false)
    const [errors, setErrors] = useState([])
    const [addNeutral, setAddNeutral] = useState(false)
    const [minOptionError, setMinOptionError] = useState('')

    // Pre-fill modal state from optionData
    useEffect(() => {
        if (!open) return

        setErrors([])
        setAllowMulti(false)
        setAddNeutral(false)
        setCustomOptions([''])

        if (optionData?.option?.length) {
            if (activeQuestionId === '7') {
                setCustomOptions(optionData.option.map(o => o.value))
                setAllowMulti(optionData.multiOption || false)
            }

            if (activeQuestionId === '8') {
                const hasNeutral = optionData.option.some(o => o.value === 'Neutral')

                setAddNeutral(hasNeutral)
            }

            if (activeQuestionId === '9') {
                // Prefill if needed
            }

            if (activeQuestionId === '10') {
                // Prefill if needed
            }
        }
    }, [open, optionData])

    const likertOptions = addNeutral
        ? ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
        : ['Strongly Disagree', 'Disagree', 'Agree', 'Strongly Agree']

    const satisfactionOptions = [
        'Very Dissatisfied',
        'Dissatisfied',
        'Neutral',
        'Satisfied',
        'Very Satisfied'
    ]

    const qualityOptions = ['Poor', 'Good', 'Excellent']

    const MAX_OPTIONS = 10

    const addCustomOption = () => {
        if (customOptions.length >= MAX_OPTIONS) return
        setCustomOptions(prev => [...prev, ''])
    }

    const updateCustomOption = (index, value) => {
        const updated = [...customOptions]

        updated[index] = value

        setCustomOptions(updated)

        setErrors(prev => {
            const err = [...prev]

            err[index] = false

            return err
        })
        setMinOptionError('')
    }

    const removeCustomOption = index => {
        if (customOptions.length <= 2) return
        setCustomOptions(prev => prev.filter((_, i) => i !== index))
        setErrors(prev => prev.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        let payload = []

        setMinOptionError('')
        setErrors([])

        if (activeQuestionId === '7') {

            if (customOptions.length < 2) {
                setMinOptionError('At least 2 options are required')

                return
            }

            const validationErrors = customOptions.map(opt => !opt.trim())

            if (validationErrors.some(Boolean)) {

                setErrors(validationErrors)

                return
            }

            payload = customOptions.map((opt, index) => ({
                index,
                value: opt.trim()
            }))
        }

        if (activeQuestionId === '8') {
            payload = likertOptions.map((opt, index) => ({
                index,
                value: opt
            }))
        }

        if (activeQuestionId === '9') {
            payload = satisfactionOptions.map((opt, index) => ({
                index,
                value: opt
            }))
        }

        if (activeQuestionId === '10') {
            payload = qualityOptions.map((opt, index) => ({
                index,
                value: opt
            }))
        }

        setOptionData({
            option: payload,
            multiOption: activeQuestionId === '7' ? allowMulti : false
        })

        setOpen(false)
    }

    return (
        <Dialog open={open} fullWidth maxWidth="lg" sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>
            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className="tabler-x" />
            </DialogCloseButton>

            <DialogTitle textAlign="center">{labelOption?.[activeQuestionId] || ''}</DialogTitle>

            <DialogContent>
                {activeQuestionId === '7' &&
                    customOptions.map((opt, index) => (
                        <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography>Option {index + 1}</Typography>
                                <TextField
                                    fullWidth
                                    value={opt}
                                    error={errors[index]}
                                    helperText={errors[index] && 'Option cannot be empty'}
                                    onChange={e => updateCustomOption(index, e.target.value)}
                                />
                                {minOptionError && (
                                    <Typography color="error" variant="caption" sx={{ mb: 1 }}>
                                        {minOptionError}
                                    </Typography>
                                )}
                            </Box>
                            <IconButton
                                color="error"
                                size="small"
                                disabled={customOptions.length <= 2}
                                onClick={() => removeCustomOption(index)}
                                sx={{ mt: 3 }}
                            >
                                <i className="tabler-trash" />
                            </IconButton>
                        </Box>
                    ))}

                {activeQuestionId === '7' && (
                    <>
                        <Button onClick={addCustomOption} variant="contained">
                            Add Option
                        </Button>
                        <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                            <FormControlLabel
                                control={<Checkbox checked={allowMulti} onChange={e => setAllowMulti(e.target.checked)} />}
                                label="Allow Multiselect"
                            />
                        </Box>
                    </>
                )}

                {activeQuestionId === '8' && (
                    <>
                        <FormControlLabel
                            control={<Checkbox checked={addNeutral} onChange={e => setAddNeutral(e.target.checked)} />}
                            label="Add Neutral"
                        />
                        {likertOptions.map((opt, i) => (
                            <TextField key={i} fullWidth disabled value={opt} sx={{ mb: 2 }} />
                        ))}
                    </>
                )}

                {activeQuestionId === '9' &&
                    satisfactionOptions.map((opt, i) => (
                        <TextField key={i} fullWidth disabled value={opt} sx={{ mb: 2 }} />
                    ))}

                {activeQuestionId === '10' &&
                    qualityOptions.map((opt, i) => (
                        <TextField key={i} fullWidth disabled value={opt} sx={{ mb: 2 }} />
                    ))}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button variant="contained" onClick={handleSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default MCQModalComponent;
