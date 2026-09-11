const EngagePanel = ({ activityData, token, fetchActivities, loading, mId, finalData }) => {

    if (loading) return <EngagePanelSkeleton />

    return (
        <Grid container spacing={4}>
            <EngageColumn
                slug={"Pre reads"}
                title="Pre-reads"
                ctaLabel="Add a pre-read"
                activityData={activityData}
                token={token}
                mId={mId}
                fetchActivities={fetchActivities}
            >
                <EngageCard title="YouTube Videos" runtime="02:09 runtime" />
            </EngageColumn>

            <EngageColumn
                slug={"Training material"}
                title="Training material"
                ctaLabel="Add training material"
                activityData={activityData}
                token={token}
                mId={mId}
                fetchActivities={fetchActivities}
            >
                <EngageCard title="Videos" runtime="04:26 runtime" />
            </EngageColumn>

            <EngageColumn
                slug={"Post reads"}
                title="Post-reads"
                ctaLabel="Add a quiz"
                activityData={activityData}
                token={token}
                mId={mId}
                fetchActivities={fetchActivities}
            >
                <EngageCard
                    title="Objective-type quiz"
                    subtitle="Available in 3 languages"
                    rightInfo={
                        <>
                            <Typography variant="body2" color="text.secondary">2 questions</Typography>
                            <Typography variant="body2" color="text.secondary">2 minutes</Typography>
                        </>
                    }
                />
                <EngageCard
                    title="Objective-type quiz"
                    subtitle="Available in 3 languages"
                    rightInfo={
                        <>
                            <Typography variant="body2" color="text.secondary">2 questions</Typography>
                            <Typography variant="body2" color="text.secondary">2 minutes</Typography>
                        </>
                    }
                />
            </EngageColumn>
        </Grid>
    );
};

export default EngagePanel
