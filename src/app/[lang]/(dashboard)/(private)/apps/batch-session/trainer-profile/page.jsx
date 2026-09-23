"use client"

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import Link from 'next/link';

import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    Chip,
    TextField,
    Avatar,
    Divider,
    Switch,
    FormControlLabel,
    Skeleton,
    Alert,
    Snackbar
} from '@mui/material';

import Grid from "@mui/material/Grid2";

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

const TrainerProfilePage = () => {
    const { lang } = useParams();
    const { ready, apiGet, apiPut } = useApi();

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const data = await apiGet('/user/trainer/profile');

                if (!cancelled) {

                    setForm({
                        name: `${data.profile?.first_name || ''} ${data.profile?.last_name || ''}`.trim(),
                        email: data.profile?.email || '',
                        title: data.profile?.title || '',
                        bio: data.profile?.bio || '',
                        emailNotifications: data.profile?.email_notifications ?? true,
                        smsReminders: data.profile?.sms_reminders ?? false
                    });
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready]);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleToggle = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.checked }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const [first_name, ...rest] = form.name.split(' ');

            await apiPut('/user/trainer/profile', {
                first_name,
                last_name: rest.join(' '),
                title: form.title,
                bio: form.bio,
                email_notifications: form.emailNotifications,
                sms_reminders: form.smsReminders
            });
            setSaved(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <PermissionGuard element={"isUser"} locale={lang}>

            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                        <Button
                            component={Link}
                            variant='outlined'
                            href={`/${lang}/apps/batch-session`}
                            startIcon={<i className="tabler-arrow-left text-lg" />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            component={Link}
                            href={`/${lang}/apps/batch-session/batches`}
                            variant="outlined"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            View My Batches
                        </Button>
                    </Box>

                    {loading || !form ? (
                        <Skeleton variant="rounded" height={400} />
                    ) : (
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                    <Avatar sx={{ width: 88, height: 88, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 32 }}>
                                        {form.name.split(' ').filter(Boolean).map((n) => n[0]).join('')}
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="700">{form.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{form.title}</Typography>
                                    <Chip label="Enterprise Trainer" color="primary" size="small" variant="outlined" />

                                    <Divider sx={{ my: 3 }} />

                                    <Button
                                        component={Link}
                                        href={`/${lang}/apps/batch-session/resource/grading`}
                                        variant="text"
                                        fullWidth
                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Go to Grading Queue
                                    </Button>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, md: 8 }}>
                                <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Profile Details</Typography>

                                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="Full Name" fullWidth value={form.name} onChange={handleChange('name')} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="Email" fullWidth value={form.email} disabled />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField label="Title" fullWidth value={form.title} onChange={handleChange('title')} />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField label="Bio" fullWidth multiline minRows={3} value={form.bio} onChange={handleChange('bio')} />
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ mb: 3 }} />

                                    <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Notification Preferences</Typography>
                                    <FormControlLabel
                                        control={<Switch checked={form.emailNotifications} onChange={handleToggle('emailNotifications')} />}
                                        label="Email me when a batch is assigned to me"
                                        sx={{ display: 'flex', mb: 1 }}
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={form.smsReminders} onChange={handleToggle('smsReminders')} />}
                                        label="Send SMS reminders before sessions"
                                        sx={{ display: 'flex', mb: 3 }}
                                    />

                                    <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                </Container>
            </Box>

            <Snackbar
                open={saved}
                autoHideDuration={3000}
                onClose={() => setSaved(false)}
                message="Profile updated"
            />
        </PermissionGuard>
    );
};

export default TrainerProfilePage;
