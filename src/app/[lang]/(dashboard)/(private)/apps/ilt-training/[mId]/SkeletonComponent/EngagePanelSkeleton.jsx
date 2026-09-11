const EngagePanelSkeleton = () => (
    <Grid container spacing={4}>
        {[1, 2, 3].map(col => (
            <Grid key={col} size={{ xs: 12, md: 4 }}>
                <Skeleton width={140} height={28} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={140} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={40} />
            </Grid>
        ))}
    </Grid>
);

export default EngagePanelSkeleton
