const NotificationModalComponent = ({ open, setIsOpen, token, mId, finalData, handleFetchData }) => {

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const [activeTab, setActiveTab] = useState('settings')

    // Settings tab state
    const [event, setEvent] = useState('')
    const [frequency, setFrequency] = useState('once')
    const [daysBefore, setDaysBefore] = useState(0)
    const [repeatDays, setRepeatDays] = useState(1)
    const [endsOnBatchStart, setEndsOnBatchStart] = useState(true)

    // Message tab state
    const [subject, setSubject] = useState('Your Attendance Has Been Marked as {{attendanceStatus}}')
    const [body, setBody] = useState(
        `Session Title: {{sessionName}}\nStart Date & Time: {{sessionStartDate}}\nEnd Date & Time: {{sessionEndDate}}\nBatch Name: {{batchName}}\nILT Name: {{moduleName}}\n\nIf you believe there is an error, please reach out to your instructor.`
    )

    // Recipients tab state
    const [ccReportingManager, setCcReportingManager] = useState(false)
    const [ccBuddyTrainer, setCcBuddyTrainer] = useState(false)

    // Validation errors
    const [errors, setErrors] = useState({
        event: false,
        subject: false,
        body: false
    })

    const handleClose = () => setIsOpen(false)

    // Insert tag at the current cursor position instead of always at the end
    const bodyRef = useRef(null)

    const insertTag = tag => {
        const token = `{{${tag.replace(/\s+/g, '')}}}`
        const input = bodyRef.current

        if (input && typeof input.selectionStart === 'number') {
            const start = input.selectionStart
            const end = input.selectionEnd

            setBody(prev => {
                const updated = prev.slice(0, start) + token + prev.slice(end)

                // restore cursor position after the inserted tag on next tick
                requestAnimationFrame(() => {
                    input.focus()
                    input.selectionStart = input.selectionEnd = start + token.length
                })

                return updated
            })
        } else {
            // fallback: append at end
            setBody(prev => `${prev}${prev.length === 0 ? '' : ' '}${token}`)
        }

        setErrors(prev => ({ ...prev, body: false }))
    }

    const tabOrder = ['settings', 'message', 'recipients']
    const isLastTab = activeTab === 'recipients'

    const validateSettings = () => !!event

    const validateMessage = () => !!subject.trim() && !!body.trim()

    const validateAll = () => {
        const eventError = !event
        const subjectError = !subject.trim()
        const bodyError = !body.trim()

        setErrors({
            event: eventError,
            subject: subjectError,
            body: bodyError
        })

        return !eventError && !subjectError && !bodyError
    }

    const handleSave = async () => {
        if (!validateAll()) {
            // jump to the first tab that has an error
            if (!event) {
                setActiveTab('settings')
            } else if (!subject.trim() || !body.trim()) {
                setActiveTab('message')
            }

            return
        }

        const payload = {
            event,
            frequency,
            daysBefore,
            repeatDays: frequency === 'recurring' ? repeatDays : null,
            endsOnBatchStart: frequency === 'recurring' ? endsOnBatchStart : null,
            subject: subject.trim(),
            body: body.trim(),
            ccReportingManager,
            ccBuddyTrainer
        }


        try {
            const response = await fetch(`${API_URL}/company/ILT/reminder/save/data/${mId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json();

            if (response.ok) {

                const reminder = result?.data;

                if (reminder) {

                    setEvent(reminder.event || "");
                    setFrequency(reminder.frequency || "once");
                    setDaysBefore(reminder.daysBefore ?? 0);
                    setRepeatDays(reminder.repeatDays ?? 1);
                    setEndsOnBatchStart(reminder.endsOnBatchStart ?? true);
                    setSubject(
                        reminder.subject ||
                        "Your Attendance Has Been Marked as {{attendanceStatus}}"
                    );
                    setBody(
                        reminder.body ||
                        `Session Title: {{sessionName}}
Start Date & Time: {{sessionStartDate}}
End Date & Time: {{sessionEndDate}}
Batch Name: {{batchName}}
ILT Name: {{moduleName}}

If you believe there is an error, please reach out to your instructor.`
                    );
                    setCcReportingManager(reminder.ccReportingManager ?? false);
                    setCcBuddyTrainer(reminder.ccBuddyTrainer ?? false);

                }

                toast.success("Module reminder saved succesasfully", {
                    autoClose: 1000
                })

                handleFetchData()

                handleClose()
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    const handleNext = () => {
        // Validate current tab before moving forward
        if (activeTab === 'settings' && !validateSettings()) {
            setErrors(prev => ({ ...prev, event: true }))
            return
        }

        if (activeTab === 'message' && !validateMessage()) {
            setErrors(prev => ({
                ...prev,
                subject: !subject.trim(),
                body: !body.trim()
            }))
            return
        }

        const idx = tabOrder.indexOf(activeTab)

        if (idx < tabOrder.length - 1) {
            setActiveTab(tabOrder[idx + 1])
        } else {
            handleSave()
        }
    }

    useEffect(() => {
        if (!open) return;

        const reminder = finalData?.moduleReminder;

        if (reminder) {
            setEvent(reminder.event || "");
            setFrequency(reminder.frequency || "once");
            setDaysBefore(reminder.daysBefore ?? 0);
            setRepeatDays(reminder.repeatDays ?? 1);
            setEndsOnBatchStart(reminder.endsOnBatchStart ?? true);
            setSubject(
                reminder.subject ||
                "Your Attendance Has Been Marked as {{attendanceStatus}}"
            );
            setBody(
                reminder.body ||
                `Session Title: {{sessionName}}
Start Date & Time: {{sessionStartDate}}
End Date & Time: {{sessionEndDate}}
Batch Name: {{batchName}}
ILT Name: {{moduleName}}

If you believe there is an error, please reach out to your instructor.`
            );
            setCcReportingManager(reminder.ccReportingManager ?? false);
            setCcBuddyTrainer(reminder.ccBuddyTrainer ?? false);
        } else {
            // Reset to defaults when no reminder exists
            setEvent("");
            setFrequency("once");
            setDaysBefore(0);
            setRepeatDays(1);
            setEndsOnBatchStart(true);
            setSubject(
                "Your Attendance Has Been Marked as {{attendanceStatus}}"
            );
            setBody(`Session Title: {{sessionName}}
Start Date & Time: {{sessionStartDate}}
End Date & Time: {{sessionEndDate}}
Batch Name: {{batchName}}
ILT Name: {{moduleName}}

If you believe there is an error, please reach out to your instructor.`);
            setCcReportingManager(false);
            setCcBuddyTrainer(false);
        }

        setErrors({
            event: false,
            subject: false,
            body: false,
        });

        setActiveTab("settings");
    }, [open, finalData]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            fullScreen={isMobile}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>
            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className="tabler-x" />
            </DialogCloseButton>

            <DialogTitle>Reminder Action</DialogTitle>

            <Box sx={{ display: 'flex', minHeight: 460, flexDirection: isMobile ? 'column' : 'row' }}>
                {/* Sidebar nav */}
                <Box
                    sx={{
                        width: isMobile ? '100%' : 220,
                        flexShrink: 0,
                        p: 3,
                        display: 'flex',
                        flexDirection: isMobile ? 'row' : 'column',
                        gap: 1.5,
                        borderRight: isMobile ? 'none' : theme => `1px solid ${theme.palette.divider}`,
                        borderBottom: isMobile ? theme => `1px solid ${theme.palette.divider}` : 'none'
                    }}
                >
                    {NAV_ITEMS.map(({ key, label, Icon }) => (
                        <Button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            variant="outlined"
                            startIcon={<i className={Icon} fontSize="small" />}
                            sx={{
                                justifyContent: 'flex-start',
                                color: activeTab === key ? 'primary.main' : 'text.secondary',
                                borderColor: activeTab === key ? 'primary.main' : 'divider',
                                fontWeight: 500,
                                textTransform: 'none'
                            }}
                        >
                            {label}
                        </Button>
                    ))}
                </Box>

                {/* Content */}
                <DialogContent sx={{ flex: 1, px: { xs: 2, sm: 4 }, py: 3 }}>
                    {activeTab === 'settings' && (
                        <Box>
                            <DialogTitle sx={{ p: 0, mb: 3, fontSize: 18, fontWeight: 600 }}>
                                Set Trigger &amp; Periodicity
                            </DialogTitle>

                            <FieldLabel required>Select an event to trigger email</FieldLabel>
                            <Select
                                fullWidth
                                size="small"
                                displayEmpty
                                value={event}
                                error={errors.event}
                                onChange={e => {
                                    setEvent(e.target.value)
                                    setErrors(prev => ({ ...prev, event: false }))
                                }}
                                renderValue={selected => selected || <Typography color="text.disabled">Select Event</Typography>}
                                sx={{ mb: errors.event ? 0.5 : 3 }}
                            >
                                {EVENT_OPTIONS.map(opt => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.event && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2.5 }}>
                                    Please select an event to trigger the email
                                </Typography>
                            )}

                            {(event === 'Before Batch Starts' || event === "Before Session Starts" || event === "Survey Reminder") && (
                                <>
                                    <FieldLabel>Trigger Frequency</FieldLabel>
                                    <RadioGroup
                                        row
                                        value={frequency}
                                        onChange={e => setFrequency(e.target.value)}
                                        sx={{ mb: 3 }}
                                    >
                                        <FormControlLabel value="once" control={<Radio size="small" />} label="Once" />
                                        <FormControlLabel value="recurring" control={<Radio size="small" />} label="Recurring" />
                                    </RadioGroup>

                                    <FieldLabel>When to start</FieldLabel>
                                    <Box sx={{ mb: frequency === 'recurring' ? 3 : 0 }}>
                                        <NumberStepper
                                            value={daysBefore}
                                            onChange={setDaysBefore}
                                            suffixLabel={event}
                                        />
                                    </Box>

                                    {frequency === 'recurring' && (
                                        <>
                                            <FieldLabel>Repeats</FieldLabel>
                                            <Box sx={{ mb: 3 }}>
                                                <NumberStepper
                                                    value={repeatDays}
                                                    onChange={setRepeatDays}
                                                    prefixLabel="Every"
                                                    suffixLabel="Days"
                                                />
                                            </Box>

                                            <FieldLabel>Ends On</FieldLabel>
                                            <FormControlLabel
                                                sx={{
                                                    border: theme => `1px solid ${theme.palette.divider}`,
                                                    borderRadius: 1,
                                                    px: 2,
                                                    py: 0.5,
                                                    m: 0,
                                                    width: 'fit-content'
                                                }}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={endsOnBatchStart}
                                                        onChange={e => setEndsOnBatchStart(e.target.checked)}
                                                    />
                                                }
                                                label={event}
                                            />
                                        </>
                                    )}
                                </>
                            )}
                        </Box>
                    )}

                    {activeTab === 'message' && (
                        <Box>
                            <DialogTitle sx={{ p: 0, mb: 3, fontSize: 18, fontWeight: 600 }}>
                                Draft the Email
                            </DialogTitle>

                            <FieldLabel required>Subject</FieldLabel>
                            <TextField
                                fullWidth
                                size="small"
                                value={subject}
                                error={errors.subject}
                                helperText={errors.subject ? 'Subject cannot be empty' : ''}
                                onChange={e => {
                                    setSubject(e.target.value)
                                    setErrors(prev => ({ ...prev, subject: false }))
                                }}
                                sx={{ mb: 3 }}
                            />

                            <FieldLabel required>Body</FieldLabel>
                            <TextField
                                fullWidth
                                multiline
                                rows={7}
                                inputRef={bodyRef}
                                value={body}
                                error={errors.body}
                                helperText={errors.body ? 'Body cannot be empty' : ''}
                                onChange={e => {
                                    setBody(e.target.value)
                                    setErrors(prev => ({ ...prev, body: false }))
                                }}
                                sx={{ mb: 3 }}
                            />

                            <FieldLabel>Add Tags</FieldLabel>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                Click on the Tags to use them in notification body
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                {TAGS.map(tag => (
                                    <Button
                                        key={tag}
                                        size="small"
                                        variant="outlined"
                                        startIcon={<i className="tabler-add" fontSize="small" />}
                                        onClick={() => insertTag(tag)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {tag}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {activeTab === 'recipients' && (
                        <Box>
                            <DialogTitle sx={{ p: 0, mb: 3, fontSize: 18, fontWeight: 600 }}>
                                Configure Recipients for this Email
                            </DialogTitle>

                            <FieldLabel>CC On Email</FieldLabel>
                            <Box sx={{ display: 'flex', gap: 4 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={ccReportingManager}
                                            onChange={e => setCcReportingManager(e.target.checked)}
                                        />
                                    }
                                    label="Reporting Manager"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={ccBuddyTrainer}
                                            onChange={e => setCcBuddyTrainer(e.target.checked)}
                                        />
                                    }
                                    label="Buddy Trainer"
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Box>

            <DialogActions sx={{ px: 3, py: 2, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
                <Button variant="tonal" color="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleNext}>
                    {isLastTab ? 'Save' : 'Next'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default NotificationModalComponent;
