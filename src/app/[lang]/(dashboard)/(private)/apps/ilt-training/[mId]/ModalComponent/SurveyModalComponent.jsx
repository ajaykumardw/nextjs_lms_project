const SurveyModalComponent = ({ open, setISOpen, token, mId, questions, setQuestions, handleFetchQuestion, fetching }) => {

    const [loading, setLoading] = useState(false)
    const [optionData, setOptionData] = useState()
    const [activeQuestionRowId, setActiveQuestionRowId] = useState(null)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useMediaQuery(theme.breakpoints.down('md'))

    const [mcqOpen, setMCQOpen] = useState(false)
    const [activeQuestionId, setActiveQuestionId] = useState(null)

    const { handleSubmit } = useForm()

    const handleClose = () => {
        setISOpen(false)
    }

    const handleQuestionChange = (id, field, value) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === id
                    ? {
                        ...q,
                        [field]: value,
                        errors: { ...q.errors, [field]: false }
                    }
                    : q
            )
        )
    }

    const addQuestion = () => setQuestions(prev => [...prev, createEmptyQuestion()])
    const removeQuestion = id => questions?.length > 1 && setQuestions(prev => prev.filter(q => q.id !== id))

    const validateQuestions = () => {
        let valid = true

        setQuestions(prev =>
            prev.map(q => {
                const textError = !q.text.trim()
                const typeError = !q.type

                if (textError || typeError) valid = false

                return { ...q, errors: { text: textError, type: typeError } }
            })
        )

        return valid
    }

    // Sync optionData from modal to questions
    useEffect(() => {
        if (!optionData || !activeQuestionRowId) return
        setQuestions(prev =>
            prev.map(q =>
                q.id === activeQuestionRowId
                    ? { ...q, options: optionData.option, multiOption: optionData.multiOption }
                    : q
            )
        )
    }, [optionData])

    const handleSaveSurvey = async () => {
        if (!validateQuestions()) return
        setLoading(true)
        let activeError = false

        try {
            const payload = questions.map((q, index) => {
                const baseQuestion = { text: q.text.trim(), type: q.type, mandatory: q.mandatory }

                if (OPTION_BASED_TYPES.includes(q.type)) {
                    if (!q.options || q.options.length === 0) {
                        toast.error(`Question ${index + 1} requires at least one option`)
                        activeError = true
                    }
                }

                if (q.options?.length) {
                    baseQuestion.options = q.options
                    baseQuestion.multiOption = q.multiOption
                }

                return baseQuestion
            })

            if (activeError) return

            const response = await fetch(`${API_URL}/company/module/survey/setting/${mId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ questions: payload })
            })

            if (response.ok) {
                toast.success('Survey setting saved successfully')
                handleFetchQuestion()
                handleClose()
            } else {
                toast.error('Failed to save survey settings')
            }
        } catch (err) {
            console.error(err)
            toast.error('An error occurred while saving survey')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} fullWidth maxWidth="lg" fullScreen={isMobile} sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>
            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className="tabler-x" />
            </DialogCloseButton>

            <DialogTitle sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Add Survey</DialogTitle>

            <form onSubmit={handleSubmit(handleSaveSurvey)} noValidate>
                <DialogContent sx={{ maxHeight: isMobile ? 'none' : '70vh', overflowY: 'auto', px: { xs: 2, sm: 4 }, pt: 2 }}>
                    {fetching ? (
                        <SurveySkeleton isTablet={isTablet} />
                    ) : (
                        questions.map((q, index) => (
                            <Box key={index} sx={{ display: 'grid', gridTemplateColumns: isTablet ? '40px 1fr auto' : '30px 1fr 200px 140px 40px', gap: 2, mb: 4, pb: isTablet ? 2 : 0, borderBottom: isTablet ? `1px solid ${theme.palette.divider}` : 'none' }}>
                                <Typography sx={{ mt: 1 }}>{index + 1}.</Typography>

                                <Box sx={{ gridColumn: isTablet ? '2 / 4' : 'auto' }}>
                                    <TextField fullWidth size="small" value={q.text} placeholder="Enter question" error={q.errors.text} helperText={q.errors.text ? 'Question text is required' : `${q.text?.length}/300`} onChange={e => handleQuestionChange(q.id, 'text', e.target.value)} inputProps={{ maxLength: 300 }} />
                                </Box>

                                <Box sx={{ gridColumn: isTablet ? '2 / 4' : 'auto', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <Box sx={{ flex: 1, minWidth: 200 }}>
                                        <Select size="small" fullWidth value={q.type} error={q.errors.type} onChange={e => handleQuestionChange(q.id, 'type', e.target.value)}>
                                            {QUESTION_TYPES.map(type => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {q.errors.type && <Typography variant="caption" color="error">Question type is required</Typography>}
                                    </Box>

                                    {OPTION_BASED_TYPES.includes(q.type) && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            sx={{ whiteSpace: 'nowrap' }}
                                            onClick={() => {
                                                setActiveQuestionId(q.type)
                                                setActiveQuestionRowId(q.id)
                                                const currentQuestion = questions.find(ques => ques.id === q.id)

                                                setOptionData(currentQuestion?.options ? { option: currentQuestion.options, multiOption: currentQuestion.multiOption } : { option: [], multiOption: false })
                                                setMCQOpen(true)
                                            }}
                                        >
                                            View Options
                                        </Button>
                                    )}

                                    <Box sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        <Checkbox size="small" checked={q.mandatory} onChange={e => handleQuestionChange(q.id, 'mandatory', e.target.checked)} />
                                        <Typography variant="body2">Mandatory</Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <IconButton size="small" color="error" disabled={questions.length === 1} onClick={() => removeQuestion(q.id)}>
                                        <i className="tabler-trash" />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))
                    )}

                    <Button variant="contained" sx={{ ml: isTablet ? 0 : 8 }} onClick={addQuestion}>
                        Add Question
                    </Button>
                </DialogContent>

                <DialogActions sx={{ flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 6, px: 3, py: 3 }}>
                    <Button type="submit" variant="contained" disabled={loading} fullWidth={isMobile}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
                    </Button>
                    <Button variant="tonal" color="error" onClick={handleClose} fullWidth={isMobile}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>

            <MCQModalComponent open={mcqOpen} setOpen={setMCQOpen} activeQuestionId={activeQuestionId} setOptionData={setOptionData} optionData={optionData} />
        </Dialog>
    )
}

export default SurveyModalComponent;
