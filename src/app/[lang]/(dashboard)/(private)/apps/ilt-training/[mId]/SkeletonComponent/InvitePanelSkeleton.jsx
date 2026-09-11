const InvitePanelSkeleton = () => (
    <Box>
        <Skeleton variant="rounded" height={64} sx={{ mb: 4 }} />
        <Stack spacing={1} mb={4}>
            {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rounded" height={72} />
            ))}
        </Stack>
        <Divider sx={{ mb: 3 }} />
        <Box display="flex" justifyContent="flex-end">
            <Skeleton variant="rounded" width={140} height={36} />
        </Box>
    </Box>
);

export default InvitePanelSkeleton

