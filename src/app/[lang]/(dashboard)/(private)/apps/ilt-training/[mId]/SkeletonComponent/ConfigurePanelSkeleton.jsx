const ConfigurePanelSkeleton = () => (
    <Grid container spacing={4}>
        <Grid item size={{ xs: 12, md: 9 }}>
            {/* Edit permissions */}
            <Box mb={5}>
                <Skeleton width={140} height={28} sx={{ mb: 1 }} />
                <Skeleton width={320} height={24} />
            </Box>

            {/* On completion section */}
            <Box mb={5}>
                <Skeleton width={260} height={28} sx={{ mb: 2 }} />
                <Skeleton width={140} height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} variant="rounded" width={180} height={120} />
                    ))}
                </Box>
            </Box>

            {/* Feedback survey */}
            <Box mb={5}>
                <Skeleton width={140} height={28} sx={{ mb: 2 }} />
                <Box display="flex" alignItems="center" gap={2}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton width="60%" height={24} />
                </Box>
            </Box>

            {/* Self enrollment settings */}
            <Box mb={5}>
                <Skeleton width={220} height={28} sx={{ mb: 2 }} />
                <Stack spacing={1}>
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} variant="rounded" height={48} />
                    ))}
                </Stack>
            </Box>

            {/* Communication settings */}
            <Box mb={5}>
                <Skeleton width={220} height={28} sx={{ mb: 2 }} />
                <Box display="flex" alignItems="center" gap={2}>
                    <Skeleton variant="rounded" width={40} height={24} />
                    <Skeleton width="60%" height={24} />
                </Box>
            </Box>

            <Skeleton variant="rounded" width={100} height={36} />
        </Grid>
    </Grid>
);

export default ConfigurePanelSkeleton;
