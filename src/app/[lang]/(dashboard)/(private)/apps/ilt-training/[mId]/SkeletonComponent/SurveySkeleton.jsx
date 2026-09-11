const SurveySkeleton = ({ isTablet }) => (
    <>
        {[1, 2, 3].map(i => (
            <Box
                key={i}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: isTablet
                        ? '40px 1fr auto'
                        : '30px 1fr 170px 140px 40px',
                    gap: 2,
                    mb: 4
                }}
            >
                <Skeleton width={20} height={30} />
                <Skeleton height={40} />
                {!isTablet && <Skeleton height={40} />}
                <Skeleton width={80} height={30} />
                <Skeleton width={30} height={30} />
            </Box>
        ))}
    </>
)

export default SurveySkeleton
