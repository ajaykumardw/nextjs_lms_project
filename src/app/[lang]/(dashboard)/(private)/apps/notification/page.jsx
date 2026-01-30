'use client'

import { useEffect, useState, useCallback } from 'react'

import { useSession } from 'next-auth/react'

import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    MenuItem,
    DialogContent,
    Checkbox,
    FormControlLabel,
    Stack,
    Typography,
    Skeleton,
    Tab,
    Switch,
    Card,
    CardContent
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { useForm, Controller } from 'react-hook-form'

import { TabContext, TabList, TabPanel } from '@mui/lab'

import { useEditor, EditorContent } from '@tiptap/react'

import { StarterKit } from '@tiptap/starter-kit'

import { Underline } from '@tiptap/extension-underline'

import { Placeholder } from '@tiptap/extension-placeholder'

import { TextAlign } from '@tiptap/extension-text-align'

import { TextStyle } from '@tiptap/extension-text-style'

import { Color } from '@tiptap/extension-color'

import { Heading } from '@tiptap/extension-heading'

import { valibotResolver } from '@hookform/resolvers/valibot'

import {
    object,
    string,
    pipe,
    minLength,
    maxLength,
    optional,
    boolean,
    instance,
    check,
    union,
} from 'valibot'

import { toast } from 'react-toastify'

import classnames from 'classnames'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomIconButton from '@/@core/components/mui/IconButton'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

const groupByCategory = (notifications) =>
    notifications.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)

        return acc
    }, {})

const EditorToolbar = ({ editor }) => {
    if (!editor) return null

    const buttons = [
        { icon: 'tabler-bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
        { icon: 'tabler-underline', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
        { icon: 'tabler-italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
        { icon: 'tabler-strikethrough', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
        { icon: 'tabler-align-left', action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }) },
        { icon: 'tabler-align-center', action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
        { icon: 'tabler-align-right', action: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }) },
        { icon: 'tabler-align-justified', action: () => editor.chain().focus().setTextAlign('justify').run(), active: editor.isActive({ textAlign: 'justify' }) },
    ]

    return (
        <div className="flex flex-wrap gap-x-3 gap-y-1 plb-2 pli-4 border-b items-center">
            {buttons.map((btn, idx) => (
                <CustomIconButton
                    key={idx}
                    variant="tonal"
                    size="small"
                    color={btn.active ? 'primary' : undefined}
                    onClick={btn.action}
                >
                    <i className={classnames(btn.icon, { 'text-textSecondary': !btn.active })} />
                </CustomIconButton>
            ))}
        </div>
    )
}

const SkeletonComponent = () => {
    return (
        <Card>
            <CardContent>
                {/* Skeleton for Tabs */}
                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto' }}>
                    {[...Array(4)].map((_, idx) => (
                        <Skeleton key={idx} variant="rectangular" width={100} height={40} />
                    ))}
                </Stack>

                {/* Skeleton for Tab Panel Content */}
                <Box mt={4}>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="text" height={30} width="40%" />
                    <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
                </Box>
            </CardContent>
        </Card>
    )
}

const NotificationTabs = () => {

    const { data: session } = useSession();
    const token = session?.user?.token;
    const URL = process.env.NEXT_PUBLIC_API_URL;

    const [tabValue, setTabValue] = useState(null);
    const [data, setData] = useState(null);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState(null);

    const fileImageSchema = pipe(
        instance(File),
        check(
            file =>
                ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type),
            'Only image files are allowed'
        )
    );

    const stringImageSchema = pipe(string());

    const imageSchema = union([fileImageSchema, stringImageSchema]);

    const schema = pipe(
        object({
            subject: pipe(string(), minLength(1, 'Subject is required'), maxLength(100)),
            message: pipe(string(), minLength(1, 'Message is required')),
            footer: pipe(string(), minLength(1, 'Footer is required')),
            header_logo: optional(imageSchema),
            header_logo_align: pipe(string(), minLength(1, 'Header logo alignment is required')),
            show_footer_logo: optional(boolean()),
            footer_logo: optional(imageSchema),
            footer_logo_align: optional(pipe(string())),
        }))

    const fetchCreate = useCallback(async () => {
        try {
            const res = await fetch(`${URL}/company/notification/create`, { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            const result = json?.data?.notification;
            
            setData(result);
            setTabValue(result?.notification_data?.[0]?._id?.toString());
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [URL, token]);

    const fetchNotificationFormData = async (tabId) => {
        setLoading(true);
        
        try {
            const res = await fetch(`${URL}/company/notification/form/${tabId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            const json = await res.json();

            console.log("Notification form", json?.data);


            setFormData(json?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && URL) fetchCreate();
    }, [fetchCreate, token, URL]);

    useEffect(() => {
        if (tabValue) fetchNotificationFormData(tabValue);
    }, [tabValue]);

    const handleClose = () => {
        setOpenDialog(false);
        setEditData(null);
    };

    const updateNotificationAPI = async (formData, id) => {
        try {
            const response = await fetch(`${URL}/company/notification/form/update/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) throw new Error(data?.message || "Failed to update notification");
            await fetchNotificationFormData(tabValue);
            toast.success('Notification updated successfully', { autoClose: 1000 });
            setOpenDialog(false);
            setEditData(null);
        } catch (err) {
            console.error("Update Notification Error:", err);
            throw err;
        }
    };

    const EmailDialog = () => {
        const editor = useEditor({
            extensions: [StarterKit.configure({ heading: false }), Heading.configure({ levels: [1, 2, 3] }), Underline, TextStyle, Color, Placeholder.configure({ placeholder: 'Message' }), TextAlign.configure({ types: ['heading', 'paragraph'] })],
            content: editData?.message || '',
            immediatelyRender: false
        });

        const footerEditor = useEditor({
            extensions: [StarterKit.configure({ heading: false }), Heading.configure({ levels: [1, 2, 3] }), Underline, TextStyle, Color, Placeholder.configure({ placeholder: 'Footer' }), TextAlign.configure({ types: ['heading', 'paragraph'] })],
            content: editData?.footer || '',
            immediatelyRender: false
        });

        const {
            control,
            handleSubmit,
            watch,
            setValue,
            clearErrors,
            setError,
            formState: { errors },
            reset
        } = useForm({
            resolver: valibotResolver(schema),
        });

        useEffect(() => {
            if (!editor) return;
            editor.on('update', () => {
                setValue('message', editor.getHTML(), { shouldValidate: true });
            });
        }, [editor, setValue]);

        useEffect(() => {
            if (!footerEditor) return;
            footerEditor.on('update', () => {
                setValue('footer', footerEditor.getHTML(), { shouldValidate: true });
            });
        }, [footerEditor, setValue]);

        useEffect(() => {
            reset({
                subject: editData?.subject || '',
                message: editData?.message || '',
                footer: editData?.footer || '',
                default_select: editData?.default_select ?? true,
                header_logo_align: editData?.header_logo_align || '',
                show_footer_logo: editData?.show_footer_logo || false,
                footer_logo_align: editData?.footer_logo_align || ''
            });

            editor?.commands.setContent(editData?.message || '');
            footerEditor?.commands.setContent(editData?.footer || '');
        }, [editData, reset, editor, footerEditor]);

        const ALLOWED_IMAGE_TYPES = [
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/svg+xml',
        ];

        const isValidImageType = (file) =>
            file && ALLOWED_IMAGE_TYPES.includes(file.type);


        const onSubmit = async (values) => {

            try {

                let hasError = false;

                if (!values.header_logo && !editData?.header_logo) {

                    setError("header_logo", {
                        type: "required",
                        message: "Header logo is required",
                    });

                    hasError = true;

                } else if (values.header_logo && !isValidImageType(values.header_logo)) {

                    setError("header_logo", {
                        type: "validate",
                        message: "Only PNG, JPEG, WEBP, or SVG files are allowed",
                    });

                    hasError = true;

                }

                if (values.show_footer_logo) {

                    if (!values.footer_logo && !editData?.footer_logo) {

                        setError("footer_logo", {
                            type: "required",
                            message: "Footer logo is required",
                        });

                        hasError = true;

                    } else if ((values?.footer_logo) && !isValidImageType(values.footer_logo)) {

                        setError("footer_logo", {
                            type: "validate",
                            message: "Only PNG, JPEG, WEBP, or SVG files are allowed",
                        });

                        hasError = true;
                    }

                    if (!values.footer_logo_align) {

                        setError("footer_logo_align", {
                            type: "required",
                            message: "Footer logo align is required",
                        });

                        hasError = true;
                    }
                }

                if (hasError) {
                    return;
                } else {
                    clearErrors();
                }

                const formData = new FormData();
                
                formData.append('template_name', values.template_name);
                formData.append('notification_type', values.notification_type);
                formData.append('subject', values.subject);
                formData.append('message', editor?.getHTML() || '');
                formData.append('footer', footerEditor?.getHTML() || '');
                formData.append('default_select', editData?.default_select ? "1" : "0");
                formData.append('header_logo_align', values.header_logo_align);

                if (values.notification_type === '687752877c5f232a7b35c975') {
                    formData.append('category_type', values.category_type);
                }

                if (values.header_logo instanceof File) formData.append('header_logo', values.header_logo);
                else if (typeof values.header_logo === 'string' && values.header_logo) formData.append('header_logo', values.header_logo);

                formData.append('show_footer_logo', values.show_footer_logo ? '1' : '0');

                if (values.show_footer_logo) {
                    if (values.footer_logo instanceof File) formData.append('footer_logo', values.footer_logo);
                    else if (typeof values.footer_logo === 'string' && values.footer_logo) formData.append('footer_logo', values.footer_logo);
                    formData.append('footer_logo_align', values.footer_logo_align);
                }

                await updateNotificationAPI(formData, editData._id);
            } catch (err) {
                console.error("Error submitting notification:", err);
            }
        };

        return (
            <Dialog open={openDialog} fullWidth maxWidth="lg" sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>
                <DialogCloseButton onClick={handleClose}><i className='tabler-x' /></DialogCloseButton>
                <DialogTitle variant='h4' className='text-center'>Edit Email Notification</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <DialogContent sx={{ maxBlockSize: '80vh', overflowY: 'auto' }}>
                        <Grid container spacing={4}>
                            {/* Subject */}
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="subject"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField {...field} fullWidth size="small" label="Subject" required error={!!errors.subject} helperText={errors.subject?.message} />
                                    )}
                                />
                            </Grid>

                            {/* Message */}
                            <Grid size={{ xs: 12 }}>
                                <Typography>Message <span>*</span></Typography>
                                <EditorToolbar editor={editor} />
                                <Box sx={{ border: '1px solid #ccc', borderRadius: 0, p: 2, fontSize: '0.875rem', lineHeight: 1.5, minHeight: 150, '&:focus-within': { borderColor: 'primary.main' }, '& .ProseMirror': { outline: 'none' } }} onClick={() => editor?.chain().focus().run()}>
                                    <EditorContent editor={editor} spellCheck={false} />
                                </Box>
                                {errors.message && <Typography color="error" variant="body2" mt={1}>{errors.message.message}</Typography>}
                            </Grid>

                            {/* Header Logo / Align */}
                            <Grid container spacing={4} size={{ xs: 12 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller
                                        name="header_logo"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <input hidden type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                                                <CustomTextField
                                                    fullWidth
                                                    required={!editData?.header_logo}
                                                    label="Header Logo"
                                                    value={
                                                        field.value instanceof File
                                                            ? field.value.name
                                                            : typeof field.value === 'string'
                                                                ? field.value.split('/').pop()
                                                                : ''
                                                    }
                                                    placeholder="Choose file"
                                                    error={!!errors.header_logo}
                                                    helperText={errors.header_logo?.message}
                                                    InputProps={{
                                                        readOnly: true,
                                                        endAdornment: (
                                                            <Button type="button" component="label" variant="outlined" size="small" sx={{ ml: 1 }}>
                                                                Browse
                                                                <input hidden type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                                                            </Button>
                                                        )
                                                    }}
                                                />
                                            </>
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller
                                        name="header_logo_align"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomTextField {...field} select fullWidth required value={field.value ?? ''} label="Header Logo Alignment" error={!!errors.header_logo_align} helperText={errors.header_logo_align?.message}>
                                                <MenuItem value="left">Left</MenuItem>
                                                <MenuItem value="center">Center</MenuItem>
                                                <MenuItem value="right">Right</MenuItem>
                                            </CustomTextField>
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            {/* Show Footer Logo */}
                            <Grid item size={{ xs: 12 }}>
                                <Controller
                                    name="show_footer_logo"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={<Checkbox {...field} checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />}
                                            label="Show Footer Logo"
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Footer Logo + Align */}
                            {watch('show_footer_logo') && (
                                <>
                                    <Grid item size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="footer_logo"
                                            control={control}
                                            render={({ field }) => (
                                                <>
                                                    <input hidden type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                                                    <CustomTextField
                                                        fullWidth
                                                        required={watch('show_footer_logo') && !editData?.footer_logo}
                                                        label="Footer Logo"
                                                        value={
                                                            field.value instanceof File
                                                                ? field.value.name
                                                                : typeof field.value === 'string'
                                                                    ? field.value.split('/').pop()
                                                                    : ''
                                                        }
                                                        placeholder="Choose file"
                                                        error={!!errors.footer_logo}
                                                        helperText={errors.footer_logo?.message}
                                                        InputProps={{
                                                            readOnly: true,
                                                            endAdornment: (
                                                                <Button type="button" component="label" variant="outlined" size="small" sx={{ ml: 1 }}>
                                                                    Browse
                                                                    <input hidden type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                                                                </Button>
                                                            )
                                                        }}
                                                    />
                                                </>
                                            )}
                                        />
                                    </Grid>

                                    <Grid item size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="footer_logo_align"
                                            control={control}
                                            render={({ field }) => (
                                                <CustomTextField {...field} select fullWidth required value={field.value ?? ''} label="Footer Logo Alignment" error={!!errors.footer_logo_align} helperText={errors.footer_logo_align?.message}>
                                                    <MenuItem value="left">Left</MenuItem>
                                                    <MenuItem value="center">Center</MenuItem>
                                                    <MenuItem value="right">Right</MenuItem>
                                                </CustomTextField>
                                            )}
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Footer Editor */}
                            <Grid size={{ xs: 12 }}>
                                <Typography>Footer <span>*</span></Typography>
                                <EditorToolbar editor={footerEditor} />
                                <Box sx={{ border: '1px solid #ccc', borderRadius: 0, p: 2, fontSize: '0.875rem', lineHeight: 1.5, minHeight: 150, '&:focus-within': { borderColor: 'primary.main' }, '& .ProseMirror': { outline: 'none' } }} onClick={() => footerEditor?.chain().focus().run()}>
                                    <EditorContent editor={footerEditor} spellCheck={false} />
                                </Box>
                                {errors.footer && <Typography color="error" variant="body2" mt={1}>{errors.footer.message}</Typography>}
                            </Grid>

                            <Grid size={{ xs: 12 }} display="flex" justifyContent="center" gap={2}>
                                <Button variant="contained" type="submit">Submit</Button>
                                <Button type="button" variant="tonal" color="error" onClick={handleClose}>Cancel</Button>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </form>
            </Dialog>
        );
    };

    const handleCheckboxChange = (category, id, val) => async (event) => {
        const updatedDefault = event.target.checked;
        const payload = { subject: val.subject, message: val.message, footer: val.footer, default_select: updatedDefault };

        try { await updateNotificationAPI(payload, val._id); } catch (e) { console.error(e); }
    };

    // --- Email / Push / SMS Tabs ---
    const EmailNotificationTab = () => {
        const grouped = groupByCategory(formData);

        return (
            <Box>
                {Object.entries(grouped).map(([category, items]) => (
                    <Box key={category} mb={4}>
                        <Typography variant="subtitle1" fontWeight={800} mb={2}>{category}</Typography>
                        <Stack spacing={2}>
                            {items.map(item => (
                                <Box key={item._id} display="flex" justifyContent="space-between" alignItems="center" border="1px solid #ddd" borderRadius={2} p={2}>
                                    <FormControlLabel control={<Checkbox checked={!!item.default_select} onChange={handleCheckboxChange(category, item._id, item)} color="primary" />} label={item.template_name} />
                                    <Button type="button" onClick={() => { setEditData(item); setOpenDialog(true); }}><i className='tabler-edit'></i></Button>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                ))}
                {editData && <EmailDialog />}
            </Box>
        );
    };

    const AppPushNotificationTab = () => (
        <Box>
            <Typography variant="h6" mb={2}>In-App & Push Notifications</Typography>
            <Stack spacing={2}>
                {formData?.map(item => (
                    <Box key={item._id} display="flex" justifyContent="space-between" alignItems="center" border="1px solid #ddd" borderRadius={2} p={2}>
                        <Typography flex={1}>{item.template_name}</Typography>
                        <Switch onChange={handleCheckboxChange(null, item._id, item)} checked={!!item?.default_select} color="primary" />
                    </Box>
                ))}
            </Stack>
        </Box>
    );

    const SMSNotificationTab = () => (
        <Box>
            <Typography variant="h6" mb={2}>SMS Notifications</Typography>
            <Stack spacing={2}>
                {formData?.map(item => (
                    <Box key={item._id} display="flex" justifyContent="space-between" alignItems="center" border="1px solid #ddd" borderRadius={2} p={2}>
                        <Typography flex={1}>{item.template_name}</Typography>
                        <Switch onChange={handleCheckboxChange(null, item._id, item)} checked={!!item?.default_select} color="primary" />
                    </Box>
                ))}
            </Stack>
        </Box>
    );

    const renderTabContent = () => {
        if (!formData) return <Box>Loading data...</Box>;

        switch (tabValue) {
            case '687752877c5f232a7b35c975': return <EmailNotificationTab />;
            case '687752877c5f232a7b35c97a': return <AppPushNotificationTab />;
            case '687752877c5f232a7b35c97b': return <SMSNotificationTab />;
            default: return <Box>No tab selected</Box>;
        }
    };

    if (loading && !tabValue) return <SkeletonComponent />;

    return (
        <Card>
            <CardContent>
                <TabContext value={tabValue}>
                    <TabList onChange={(_, newVal) => setTabValue(newVal)} variant="scrollable" className="border-b">
                        {data?.notification_data?.map(item => <Tab key={item._id} label={item.type} value={item._id.toString()} />)}
                    </TabList>
                    <Box mt={4}>
                        <TabPanel value={tabValue} className="p-0">{renderTabContent()}</TabPanel>
                    </Box>
                </TabContext>
            </CardContent>
        </Card>
    );
};

export default NotificationTabs
