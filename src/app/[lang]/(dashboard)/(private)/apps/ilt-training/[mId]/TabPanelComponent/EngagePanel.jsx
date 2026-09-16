import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import EngagePanelSkeleton from "../SkeletonComponent/EngagePanelSkeleton";

import EngageColumn from "../Batch/EngageColumn";
import EngageCard from "../Batch/EngageCard";

const EngagePanel = ({
    activityData,
    token,
    handleFetchData,
    loading,
    mId,
    finalData,
    setValue,
}) => {
    if (loading) {
        return <EngagePanelSkeleton />;
    }

    // Get activities from finalData safely
    const activities = Array.isArray(finalData?.activity)
        ? finalData.activity
        : [];

    // Group activities according to engage_type
    const preReadActivities = activities.filter(
        (activity) => activity?.engage_type === "pre_read"
    );

    const trainingMaterialActivities = activities.filter(
        (activity) => activity?.engage_type === "training_material"
    );

    const postReadActivities = activities.filter(
        (activity) => activity?.engage_type === "post_read"
    );

    /**
     * Render a card for an activity
     */
    const renderActivityCard = (activity) => {
        return (
            <EngageCard
                key={activity?._id || activity?.id}
                activity={activity}
                mId={mId}
                token={token}
                API_URL={process.env.NEXT_PUBLIC_API_URL}
                fetchActivities={handleFetchData}
                title={
                    activity?.name ||
                    activity?.activity_type?.activity_data?.title ||
                    "Untitled Activity"
                }
                subtitle={
                    activity?.description ||
                    activity?.activity_type?.activity_data?.description ||
                    ""
                }
                runtime={activity?.runtime || ""}
                rightInfo={null}
            />
        );
    };

    return (
        <Grid container spacing={4}>
            {/* =========================
                PRE READ
            ========================== */}
            <EngageColumn
                slug="pre_read"
                title="Pre-reads"
                ctaLabel="Add a pre-read"
                activityData={activityData}
                token={token}
                setValue={setValue}
                mId={mId}
                handleFetchData={handleFetchData}
            >
                {preReadActivities.length > 0 ? (
                    preReadActivities.map(renderActivityCard)
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 2 }}
                    >
                        No pre-reads added yet.
                    </Typography>
                )}
            </EngageColumn>

            {/* =========================
                TRAINING MATERIAL
            ========================== */}
            <EngageColumn
                slug="training_material"
                title="Training material"
                ctaLabel="Add training material"
                activityData={activityData}
                token={token}
                setValue={setValue}
                mId={mId}
                handleFetchData={handleFetchData}
            >
                {trainingMaterialActivities.length > 0 ? (
                    trainingMaterialActivities.map(renderActivityCard)
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 2 }}
                    >
                        No training material added yet.
                    </Typography>
                )}
            </EngageColumn>

            {/* =========================
                POST READ
            ========================== */}
            <EngageColumn
                slug="post_read"
                title="Post-reads"
                ctaLabel="Add a quiz"
                activityData={activityData}
                token={token}
                setValue={setValue}
                mId={mId}
                handleFetchData={handleFetchData}
            >
                {postReadActivities.length > 0 ? (
                    postReadActivities.map(renderActivityCard)
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 2 }}
                    >
                        No post-reads added yet.
                    </Typography>
                )}
            </EngageColumn>
        </Grid>
    );
};

export default EngagePanel;
